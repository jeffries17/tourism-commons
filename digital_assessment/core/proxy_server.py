#!/usr/bin/env python3
"""
Proxy server that serves the dashboard and proxies API calls
"""

import os
import json
import http.server
import socketserver
import urllib.request
import urllib.parse
from http.server import SimpleHTTPRequestHandler

class ProxyHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.api_base = 'http://localhost:5003'
        super().__init__(*args, **kwargs)

    def do_GET(self):
        if self.path.startswith('/api/'):
            self.proxy_api_request()
        else:
            super().do_GET()

    def do_POST(self):
        if self.path.startswith('/api/'):
            self.proxy_api_request()
        else:
            super().do_POST()

    def proxy_api_request(self):
        """Proxy API requests to the API server"""
        try:
            # Forward the request to the API server
            api_url = f"{self.api_base}{self.path}"
            
            if self.command == 'GET':
                req = urllib.request.Request(api_url)
            else:
                # Handle POST requests
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                req = urllib.request.Request(api_url, data=post_data, method=self.command)
                req.add_header('Content-Type', self.headers.get('Content-Type', 'application/json'))
            
            # Copy headers
            for header, value in self.headers.items():
                if header.lower() not in ['host', 'content-length']:
                    req.add_header(header, value)
            
            # Make the request
            with urllib.request.urlopen(req) as response:
                # Copy response headers
                for header, value in response.headers.items():
                    if header.lower() not in ['content-encoding', 'transfer-encoding']:
                        self.send_header(header, value)
                
                # Send response
                self.send_response(response.status)
                self.end_headers()
                self.wfile.write(response.read())
                
        except Exception as e:
            print(f"Proxy error: {e}")
            self.send_error(500, f"Proxy error: {str(e)}")

    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.end_headers()

def run_proxy_server(port=3001):
    """Run the proxy server"""
    print(f"🚀 Starting proxy server on port {port}")
    print("📊 Serving dashboard with API proxy to localhost:5003")
    
    with socketserver.TCPServer(("", port), ProxyHandler) as httpd:
        print(f"✅ Dashboard running at http://localhost:{port}")
        print("🔗 API calls will be proxied to http://localhost:5003")
        print("🌐 Access your dashboard now!")
        httpd.serve_forever()

if __name__ == "__main__":
    run_proxy_server()
