#!/usr/bin/env python3
"""Servidor estático con soporte para URLs sin extensión (.html)."""
import http.server
import os

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
    http.server.test(HandlerClass=Handler, port=5000, bind='0.0.0.0')
