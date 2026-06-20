"""OpenCV-based logic for detecting and extracting photos from flatbed scans."""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Callable

import cv2
import numpy as np

from image_utils import clamp_box, iter_image_files, read_image, save_image, unique_path

LogFn = Callable[[str], None]


@dataclass
class SplitterConfig:
    margin_px: int = 20
    min_area: int = 20_000
    threshold: int = 45
    black_background: bool = True
    deskew: bool = True


@dataclass
class DetectedPhoto:
    contour: np.ndarray
    box: tuple[int, int, int, int]
    rect: tuple[tuple[float, float], tuple[float, float], float]
    area: float


@dataclass
class ProcessingSummary:
    scans_processed: int = 0
    photos_extracted: int = 0
    warnings: int = 0
    errors: int = 0


def _find_photos(image: np.ndarray, config: SplitterConfig) -> list[DetectedPhoto]:
    """Create a foreground mask and return plausible photo rectangles."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # A small blur removes scanner noise and dust specks before thresholding.
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    # With a black/dark backing, photos are usually brighter than the background.
    # If the option is disabled, Otsu tries to infer the split automatically.
    if config.black_background:
        _, mask = cv2.threshold(blurred, config.threshold, 255, cv2.THRESH_BINARY)
    else:
        _, mask = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Morphological closing fills small gaps on photo edges; opening removes dots.
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (9, 9))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)

    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    detections: list[DetectedPhoto] = []
    image_area = image.shape[0] * image.shape[1]

    for contour in contours:
        area = cv2.contourArea(contour)
        if area < config.min_area or area > image_area * 0.95:
            continue

        x, y, w, h = cv2.boundingRect(contour)
        if w < 40 or h < 40:
            continue

        extent = area / float(w * h)
        if extent < 0.45:  # Reject very irregular shapes, labels, or glare streaks.
            continue

        rect = cv2.minAreaRect(contour)
        detections.append(DetectedPhoto(contour=contour, box=(x, y, w, h), rect=rect, area=area))

    return sorted(detections, key=lambda d: (d.box[1] // 100, d.box[0]))


def _deskew_crop(image: np.ndarray, detection: DetectedPhoto, margin: int) -> np.ndarray | None:
    """Try to crop a rotated photo using minAreaRect.

    Returns None when the rotated rectangle is suspicious; the caller then uses
    the safer axis-aligned crop, which may include a small border but avoids
    cutting photo content.
    """
    (cx, cy), (rw, rh), angle = detection.rect
    if rw <= 1 or rh <= 1:
        return None

    # OpenCV may report the long side as height; normalize so the rotation is mild.
    if rw < rh:
        rw, rh = rh, rw
        angle += 90
    if abs(angle) > 20:  # Old photos can be slightly tilted, not usually 45°+.
        return None

    rw += margin * 2
    rh += margin * 2
    matrix = cv2.getRotationMatrix2D((cx, cy), angle, 1.0)
    rotated = cv2.warpAffine(image, matrix, (image.shape[1], image.shape[0]), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    crop = cv2.getRectSubPix(rotated, (int(rw), int(rh)), (cx, cy))

    if crop is None or crop.size == 0:
        return None

    x, y, w, h = detection.box
    simple_area = max(1, (w + margin * 2) * (h + margin * 2))
    rotated_area = crop.shape[0] * crop.shape[1]
    if rotated_area < simple_area * 0.45 or rotated_area > simple_area * 1.8:
        return None
    return crop


def _crop_photo(image: np.ndarray, detection: DetectedPhoto, config: SplitterConfig) -> np.ndarray:
    if config.deskew:
        deskewed = _deskew_crop(image, detection, config.margin_px)
        if deskewed is not None:
            return deskewed

    x, y, w, h = detection.box
    x1, y1, x2, y2 = clamp_box(x, y, w, h, image.shape[1], image.shape[0], config.margin_px)
    return image[y1:y2, x1:x2]


def process_scan(scan_path: Path, output_root: Path, config: SplitterConfig, log: LogFn = print) -> int:
    """Process one scan and return the number of extracted photos."""
    image = read_image(scan_path)
    detections = _find_photos(image, config)
    scan_output = output_root / scan_path.stem
    scan_output.mkdir(parents=True, exist_ok=True)

    preview = image.copy()
    for index, detection in enumerate(detections, start=1):
        x, y, w, h = detection.box
        cv2.rectangle(preview, (x, y), (x + w, y + h), (0, 255, 0), 4)
        cv2.putText(preview, str(index), (x + 10, max(30, y + 30)), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 255, 0), 3)

        crop = _crop_photo(image, detection, config)
        photo_path = unique_path(scan_output / f"{scan_path.stem}_foto_{index:02d}.jpg")
        save_image(photo_path, crop)
        log(f"  foto {index:02d}: {photo_path.name}")

    preview_path = unique_path(scan_output / f"{scan_path.stem}_preview.jpg")
    save_image(preview_path, preview)
    if not detections:
        log(f"  aviso: nenhuma foto detectada em {scan_path.name}")
    log(f"  preview: {preview_path.name}")
    return len(detections)


def process_folder(input_dir: Path, output_dir: Path, config: SplitterConfig, log: LogFn = print) -> ProcessingSummary:
    """Process all supported images from input_dir without aborting on one bad file."""
    summary = ProcessingSummary()
    files = list(iter_image_files(input_dir))
    if not files:
        log("Aviso: nenhuma imagem compatível encontrada na pasta de entrada.")
        summary.warnings += 1
        return summary

    output_dir.mkdir(parents=True, exist_ok=True)
    for scan_path in files:
        log(f"Processando {scan_path.name}...")
        try:
            count = process_scan(scan_path, output_dir, config, log)
            summary.scans_processed += 1
            summary.photos_extracted += count
            if count == 0:
                summary.warnings += 1
        except Exception as exc:  # Keep the batch running and report the file that failed.
            summary.errors += 1
            log(f"  erro em {scan_path.name}: {exc}")
    return summary
