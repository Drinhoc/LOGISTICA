"""Tkinter interface for the scanned-photo splitter."""
from __future__ import annotations

from pathlib import Path
import queue
import threading
import tkinter as tk
from tkinter import filedialog, messagebox, ttk

from scanner_splitter import SplitterConfig, process_folder


class PhotoSplitterApp:
    """Minimal cross-platform desktop UI."""

    def __init__(self) -> None:
        self.root = tk.Tk()
        self.root.title("Separador de Fotos Escaneadas")
        self.root.geometry("820x620")
        self.log_queue: queue.Queue[str] = queue.Queue()
        self.worker: threading.Thread | None = None

        self.input_dir = tk.StringVar()
        self.output_dir = tk.StringVar()
        self.margin_px = tk.IntVar(value=20)
        self.min_area = tk.IntVar(value=20000)
        self.threshold = tk.IntVar(value=45)
        self.black_background = tk.BooleanVar(value=True)
        self.deskew = tk.BooleanVar(value=True)

        self._build_ui()
        self.root.after(100, self._drain_log_queue)

    def run(self) -> None:
        self.root.mainloop()

    def _build_ui(self) -> None:
        frame = ttk.Frame(self.root, padding=14)
        frame.pack(fill="both", expand=True)
        frame.columnconfigure(1, weight=1)
        frame.rowconfigure(8, weight=1)

        self._folder_row(frame, 0, "Pasta de entrada", self.input_dir, self._choose_input)
        self._folder_row(frame, 1, "Pasta de saída", self.output_dir, self._choose_output)

        ttk.Label(frame, text="Margem extra (px)").grid(row=2, column=0, sticky="w", pady=4)
        ttk.Spinbox(frame, from_=0, to=200, textvariable=self.margin_px, width=10).grid(row=2, column=1, sticky="w", pady=4)

        ttk.Label(frame, text="Área mínima detectada").grid(row=3, column=0, sticky="w", pady=4)
        ttk.Spinbox(frame, from_=1000, to=10000000, increment=1000, textvariable=self.min_area, width=12).grid(row=3, column=1, sticky="w", pady=4)

        ttk.Label(frame, text="Threshold detecção").grid(row=4, column=0, sticky="w", pady=4)
        ttk.Spinbox(frame, from_=1, to=254, textvariable=self.threshold, width=10).grid(row=4, column=1, sticky="w", pady=4)

        ttk.Checkbutton(frame, text="Fundo preto/escuro", variable=self.black_background).grid(row=5, column=1, sticky="w", pady=4)
        ttk.Checkbutton(frame, text="Tentar corrigir rotação", variable=self.deskew).grid(row=6, column=1, sticky="w", pady=4)

        self.process_button = ttk.Button(frame, text="Processar scans", command=self._start_processing)
        self.process_button.grid(row=7, column=0, columnspan=3, sticky="ew", pady=12)

        self.log_text = tk.Text(frame, height=18, wrap="word")
        self.log_text.grid(row=8, column=0, columnspan=3, sticky="nsew")
        scroll = ttk.Scrollbar(frame, command=self.log_text.yview)
        scroll.grid(row=8, column=3, sticky="ns")
        self.log_text.configure(yscrollcommand=scroll.set)

    def _folder_row(self, parent: ttk.Frame, row: int, label: str, variable: tk.StringVar, command) -> None:
        ttk.Label(parent, text=label).grid(row=row, column=0, sticky="w", pady=4)
        ttk.Entry(parent, textvariable=variable).grid(row=row, column=1, sticky="ew", padx=8, pady=4)
        ttk.Button(parent, text="Escolher...", command=command).grid(row=row, column=2, sticky="e", pady=4)

    def _choose_input(self) -> None:
        folder = filedialog.askdirectory(title="Escolha a pasta com os scans")
        if folder:
            self.input_dir.set(folder)

    def _choose_output(self) -> None:
        folder = filedialog.askdirectory(title="Escolha a pasta de saída")
        if folder:
            self.output_dir.set(folder)

    def _log(self, message: str) -> None:
        self.log_queue.put(message)

    def _drain_log_queue(self) -> None:
        while True:
            try:
                message = self.log_queue.get_nowait()
            except queue.Empty:
                break
            self.log_text.insert("end", message + "\n")
            self.log_text.see("end")
        self.root.after(100, self._drain_log_queue)

    def _start_processing(self) -> None:
        if self.worker and self.worker.is_alive():
            return
        input_dir = Path(self.input_dir.get()).expanduser()
        output_dir = Path(self.output_dir.get()).expanduser()
        if not input_dir.is_dir():
            messagebox.showerror("Erro", "Escolha uma pasta de entrada válida.")
            return
        if not output_dir:
            messagebox.showerror("Erro", "Escolha uma pasta de saída válida.")
            return

        config = SplitterConfig(
            margin_px=max(0, self.margin_px.get()),
            min_area=max(1, self.min_area.get()),
            threshold=min(254, max(1, self.threshold.get())),
            black_background=self.black_background.get(),
            deskew=self.deskew.get(),
        )
        self.process_button.configure(state="disabled")
        self._log("Iniciando processamento...")
        self.worker = threading.Thread(target=self._run_processing, args=(input_dir, output_dir, config), daemon=True)
        self.worker.start()

    def _run_processing(self, input_dir: Path, output_dir: Path, config: SplitterConfig) -> None:
        try:
            summary = process_folder(input_dir, output_dir, config, self._log)
            self._log("")
            self._log("Resumo final:")
            self._log(f"  scans processados: {summary.scans_processed}")
            self._log(f"  fotos extraídas: {summary.photos_extracted}")
            self._log(f"  avisos: {summary.warnings}")
            self._log(f"  erros: {summary.errors}")
        finally:
            self.root.after(0, lambda: self.process_button.configure(state="normal"))
