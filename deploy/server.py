import http.server
import socketserver
import requests

PORT = 8000
TARGET_URL = "http://localhost:3000"

class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.proxy_request()

    def do_POST(self):
        self.proxy_request()

    def proxy_request(self):
        url = f"{TARGET_URL}{self.path}"
        try:
            resp = requests.request(
                method=self.command,
                url=url,
                headers={k: v for k, v in self.headers.items() if k.lower() != 'host'},
                data=self.rfile.read(int(self.headers.get('Content-Length', 0))) if self.command == 'POST' else None,
                allow_redirects=False
            )
            self.send_response(resp.status_code)
            for k, v in resp.headers.items():
                if k.lower() not in ['content-encoding', 'transfer-encoding', 'content-length', 'connection']:
                    self.send_header(k, v)
            self.end_headers()
            self.wfile.write(resp.content)
        except Exception as e:
            self.send_error(502, f"Proxy error: {e}")

with socketserver.TCPServer(("", PORT), ProxyHandler) as httpd:
    print(f"Proxying from {PORT} to {TARGET_URL}")
    httpd.serve_forever()
