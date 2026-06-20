"""Flask web interface for the scanned-photo splitter."""
from __future__ import annotations

import io
import os
import tempfile
import zipfile
from pathlib import Path

from flask import Flask, jsonify, render_template, request, send_file

from scanner_splitter import SplitterConfig, process_scan

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 100 * 1024 * 1024  # 100 MB per request

SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".tif", ".tiff", ".bmp"}


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/process", methods=["POST"])
def process():
    files = request.files.getlist("scans")
    if not files or all(f.filename == "" for f in files):
        return jsonify({"error": "Nenhum arquivo enviado."}), 400

    margin_px = int(request.form.get("margin_px", 20))
    min_area = int(request.form.get("min_area", 20000))
    threshold = int(request.form.get("threshold", 45))
    black_background = request.form.get("black_background", "true") == "true"
    deskew = request.form.get("deskew", "true") == "true"

    config = SplitterConfig(
        margin_px=max(0, margin_px),
        min_area=max(1, min_area),
        threshold=min(254, max(1, threshold)),
        black_background=black_background,
        deskew=deskew,
    )

    zip_buffer = io.BytesIO()
    total_extracted = 0
    log_lines: list[str] = []

    def log(msg: str) -> None:
        log_lines.append(msg)

    with tempfile.TemporaryDirectory() as tmpdir:
        tmp = Path(tmpdir)
        input_dir = tmp / "input"
        output_dir = tmp / "output"
        input_dir.mkdir()
        output_dir.mkdir()

        saved: list[Path] = []
        for f in files:
            if not f.filename:
                continue
            ext = Path(f.filename).suffix.lower()
            if ext not in SUPPORTED_EXTENSIONS:
                log(f"Ignorado (formato não suportado): {f.filename}")
                continue
            dest = input_dir / Path(f.filename).name
            f.save(dest)
            saved.append(dest)

        if not saved:
            return jsonify({"error": "Nenhum arquivo com formato suportado (JPG, PNG, TIFF, BMP)."}), 400

        for scan_path in sorted(saved, key=lambda p: p.name.lower()):
            log(f"Processando {scan_path.name}...")
            try:
                count = process_scan(scan_path, output_dir, config, log)
                total_extracted += count
                if count == 0:
                    log(f"  aviso: nenhuma foto detectada em {scan_path.name}")
            except Exception as exc:
                log(f"  erro em {scan_path.name}: {exc}")

        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
            for result_file in sorted(output_dir.rglob("*")):
                if result_file.is_file():
                    zf.write(result_file, result_file.relative_to(output_dir))

    zip_buffer.seek(0)

    if zip_buffer.getbuffer().nbytes == 0:
        return jsonify({"error": "Nenhuma foto foi extraída.", "log": log_lines}), 422

    response = send_file(
        zip_buffer,
        mimetype="application/zip",
        as_attachment=True,
        download_name="fotos_separadas.zip",
    )
    response.headers["X-Log"] = " | ".join(log_lines[-20:])
    response.headers["X-Photos-Extracted"] = str(total_extracted)
    return response


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
