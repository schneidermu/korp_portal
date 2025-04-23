#!/bin/python -B

from http.server import BaseHTTPRequestHandler, HTTPServer
import logging


class RequestHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def _log_request(self):
        logging.info(f"Received request: {self.command} {self.path}")
        logging.info("Headers:")
        for header, value in self.headers.items():
            logging.info(f"  {header}: {value}")

        content_length = int(self.headers.get("Content-Length", 0))
        if content_length > 0:
            body = self.rfile.read(content_length).decode("utf-8")
            logging.info(f"Body: {body}")

    def do_GET(self):
        self._log_request()
        self.send_header("WWW-Authenticate", 'Basic realm="Nextcloud"')
        self.send_header("Content-Type", "text/plain")
        self.send_header("Content-Length", "0")
        if self.headers.get("Authorization") is None:
            self.send_response(200)
            self.end_headers()
            return
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        self._log_request()
        self.send_response(200)
        self.end_headers()


def run(server_class=HTTPServer, handler_class=RequestHandler, port=8080):
    logging.basicConfig(level=logging.INFO)
    server_address = ("", port)
    httpd = server_class(server_address, handler_class)
    logging.info(f"Starting server on port {port}")
    httpd.serve_forever()


if __name__ == "__main__":
    run()
