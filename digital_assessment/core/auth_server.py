#!/usr/bin/env python3
"""
Simple authentication server that connects to Google Sheets auth tab
"""

import os
import json
import http.server
import socketserver
import urllib.parse
from datetime import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Configuration
SHEET_ID = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
CREDENTIALS_PATH = '/Users/alexjeffries/tourism-commons/tourism-development-d620c-5c9db9e21301.json'
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

class AuthHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Initialize Google Sheets service
        try:
            credentials = service_account.Credentials.from_service_account_file(
                CREDENTIALS_PATH, scopes=SCOPES
            )
            self.sheets_service = build('sheets', 'v4', credentials=credentials)
            print("✅ Connected to Google Sheets for authentication")
        except Exception as e:
            print(f"❌ Error connecting to Google Sheets: {e}")
            self.sheets_service = None
        super().__init__(*args, **kwargs)

    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        """Handle POST requests"""
        if self.path == '/api/auth/login':
            self.handle_login()
        else:
            self.send_error(404, "Not Found")

    def handle_login(self):
        """Handle login requests"""
        try:
            # Read request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            username = data.get('username', '').strip().lower()

            if not username:
                self.send_error_response(400, "Username is required")
                return

            # Authenticate against Google Sheets
            user_data = self.authenticate_user(username)
            
            if user_data:
                # Update login count and last login
                self.update_user_login(username)
                
                # Send success response
                self.send_success_response({
                    'user': user_data
                })
            else:
                self.send_error_response(401, "Invalid username")

        except Exception as e:
            print(f"Login error: {e}")
            self.send_error_response(500, "Internal server error")

    def authenticate_user(self, username):
        """Authenticate user against Google Sheets"""
        try:
            if not self.sheets_service:
                return None

            # Read auth data from Google Sheets
            result = self.sheets_service.spreadsheets().values().get(
                spreadsheetId=SHEET_ID,
                range='dashboard_auth!A1:Z100'
            ).execute()
            
            rows = result.get('values', [])
            if not rows:
                return None

            headers = rows[0]
            for row in rows[1:]:
                if len(row) >= 3 and row[1].strip().lower() == username:
                    # Found user
                    user_data = {
                        'id': row[1].strip().lower(),
                        'username': row[1].strip().lower(),
                        'name': row[0].strip(),
                        'role': row[2].strip().lower() if len(row) > 2 else 'user',
                        'email': f"{row[1].strip().lower()}@itc.int",
                        'loginCount': int(row[4]) if len(row) > 4 and row[4].strip() else 0
                    }
                    return user_data
            
            return None

        except Exception as e:
            print(f"Authentication error: {e}")
            return None

    def update_user_login(self, username):
        """Update user login count and timestamp"""
        try:
            if not self.sheets_service:
                return

            # Read current data
            result = self.sheets_service.spreadsheets().values().get(
                spreadsheetId=SHEET_ID,
                range='dashboard_auth!A1:Z100'
            ).execute()
            
            rows = result.get('values', [])
            if not rows:
                return

            # Find user row and update
            for i, row in enumerate(rows[1:], start=2):  # Start from row 2 (skip header)
                if len(row) >= 2 and row[1].strip().lower() == username:
                    # Update login count
                    current_count = int(row[4]) if len(row) > 4 and row[4].strip() else 0
                    new_count = current_count + 1
                    
                    # Update the row
                    update_range = f'dashboard_auth!E{i}:F{i}'
                    values = [[str(new_count), datetime.now().isoformat()]]
                    
                    self.sheets_service.spreadsheets().values().update(
                        spreadsheetId=SHEET_ID,
                        range=update_range,
                        valueInputOption='RAW',
                        body={'values': values}
                    ).execute()
                    
                    print(f"✅ Updated login for {username}: count={new_count}")
                    break

        except Exception as e:
            print(f"Error updating login: {e}")

    def send_success_response(self, data):
        """Send success response"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def send_error_response(self, code, message):
        """Send error response"""
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({'error': message}).encode('utf-8'))

def run_auth_server(port=5002):
    """Run the authentication server"""
    print(f"🚀 Starting authentication server on port {port}")
    print("📊 Connected to Google Sheets for user authentication")
    
    with socketserver.TCPServer(("", port), AuthHandler) as httpd:
        print(f"✅ Authentication server running at http://localhost:{port}")
        print("🔐 Available users from Google Sheets:")
        print("   - ajeffries (admin)")
        print("   - fthomas (admin)")
        print("   - rcira (admin)")
        print("   - omarty (admin)")
        print("   - adiaz (admin)")
        print("   - dniang (admin)")
        print("   - ykeita (admin)")
        print("   - hdarboe (admin)")
        print("   - yanyassi (admin)")
        print("\n🌐 Dashboard should now be accessible at http://localhost:3001")
        httpd.serve_forever()

if __name__ == "__main__":
    run_auth_server()
