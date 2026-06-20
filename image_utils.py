"""Small image/file helpers used by the scanner splitter."""
from __future__ import annotations

from pathlib import Path
from typing import Iterable

import cv2
import numpy as np
from PIL import Image

SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".tif", ".tiff", ".bmp"}


def iter_image_files(folder: Path) -> Iterable[Path]:
    """Yield supported images in a stable order."""
    for path in sorted(folder.iterdir(), key=lambda p: p.name.lower()):
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS:
            yield path


def read_image(path: Path) -> np.ndarray:
    """Read an image with Pillow, returning an OpenCV BGR array.

    Pillow handles paths and formats consistently on Windows/macOS, including
    TIFF variants that OpenCV sometimes struggles with.
    """
    with Image.open(path) as img:
        rgb = img.convert("RGB")
    return cv2.cvtColor(np.array(rgb), cv2.COLOR_RGB2BGR)


def save_image(path: Path, image_bgr: np.ndarray, quality: int = 95) -> None:
    """Save a BGR image using Pillow so filenames work cross-platform."""
    path.parent.mkdir(parents=True, exist_ok=True)
    rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    Image.fromarray(rgb).save(path, quality=quality)


def unique_path(path: Path) -> Path:
    """Return a non-existing path by adding _02, _03... when needed."""
    if not path.exists():
        return path
    stem, suffix = path.stem, path.suffix
    counter = 2
    while True:
        candidate = path.with_name(f"{stem}_{counter:02d}{suffix}")
        if not candidate.exists():
            return candidate
        counter += 1


def clamp_box(x: int, y: int, w: int, h: int, max_w: int, max_h: int, margin: int) -> tuple[int, int, int, int]:
    """Expand and clamp a crop rectangle to image bounds."""
    x1 = max(0, x - margin)
    y1 = max(0, y - margin)
    x2 = min(max_w, x + w + margin)
    y2 = min(max_h, y + h + margin)
    return x1, y1, x2, y2
