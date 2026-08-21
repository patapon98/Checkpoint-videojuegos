#!/usr/bin/env python3
"""Servidor estático con soporte para URLs sin extensión (.html).

En los entornos de preview regenera primero las superficies derivadas de Noticias
para que una rama bot/news-* pueda contener únicamente los JSON fuente y, aun
así, la vista previa muestre portada, Noticias, ticker y relacionadas actualizados.
Los archivos generados solo cambian en el worktree efímero de la preview; la
publicación de las superficies derivadas en main la realiza GitHub Actions.
"""
import http.server
import os
import subprocess
import sys

NEWS_PREVIEW_COMMANDS = [
    ["node", "scripts/build-news-index.mjs"],
    ["node", "scripts/render-news.mjs"],
    ["node", "scripts/render-game-hubs.mjs"],
    ["node", "scripts/render-game-hub-pc-requirements.mjs"],
    ["node", "scripts/render-game-hub-editions.mjs"],
]


def prepare_preview():
    """Genera las superficies derivadas antes de servir la preview."""
    if not os.path.isdir("data/news"):
        return

    print("Preparando superficies derivadas de Noticias para la preview…", flush=True)
    for command in NEWS_PREVIEW_COMMANDS:
        try:
            subprocess.run(command, check=True)
        except FileNotFoundError as exc:
            print(f"No se puede preparar la preview: falta {exc.filename}.", file=sys.stderr)
            raise SystemExit(1) from exc
        except subprocess.CalledProcessError as exc:
            print(
                f"No se puede preparar la preview: {' '.join(command)} terminó con código {exc.returncode}.",
                file=sys.stderr,
            )
            raise SystemExit(exc.returncode) from exc


class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Si la ruta no tiene extensión y no es un archivo existente,
        # intenta añadir .html
        path = self.translate_path(self.path)
        if not os.path.exists(path) and not os.path.splitext(path)[1]:
            html_path = path + '.html'
            if os.path.exists(html_path):
                self.path = self.path.rstrip('/') + '.html'
        super().do_GET()

    def log_message(self, format, *args):
        # Suprime logs repetitivos de 304
        if args and '304' not in str(args[1]):
            super().log_message(format, *args)


if __name__ == '__main__':
    prepare_preview()
    http.server.test(HandlerClass=Handler, port=5000, bind='0.0.0.0')