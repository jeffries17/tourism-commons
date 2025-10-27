#!/usr/bin/env python3
"""
Comprehensive API server for the Digital Assessment Dashboard
Provides all data endpoints the dashboard needs
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

class APIHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Initialize Google Sheets service
        try:
            credentials = service_account.Credentials.from_service_account_file(
                CREDENTIALS_PATH, scopes=SCOPES
            )
            self.sheets_service = build('sheets', 'v4', credentials=credentials)
            print("✅ Connected to Google Sheets for API data")
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

    def do_GET(self):
        """Handle GET requests"""
        if self.path.startswith('/api/'):
            self.handle_api_request()
        else:
            super().do_GET()

    def do_POST(self):
        """Handle POST requests"""
        if self.path == '/api/auth/login':
            self.handle_login()
        else:
            self.send_error(404, "Not Found")

    def handle_api_request(self):
        """Handle API requests"""
        try:
            if self.path == '/api/dashboard':
                self.handle_dashboard_data()
            elif self.path == '/api/participants':
                self.handle_participants()
            elif self.path == '/api/platform-adoption/overall':
                self.handle_platform_adoption()
            elif self.path == '/api/technical-audit/summary':
                self.handle_technical_audit()
            elif self.path == '/api/sectors':
                self.handle_sectors()
            elif self.path.startswith('/api/participant/'):
                self.handle_participant_detail()
            else:
                self.send_error(404, "API endpoint not found")
        except Exception as e:
            print(f"API error: {e}")
            self.send_error(500, "Internal server error")

    def handle_dashboard_data(self):
        """Provide dashboard summary data"""
        try:
            # Get basic stats from CI Assessment
            result = self.sheets_service.spreadsheets().values().get(
                spreadsheetId=SHEET_ID,
                range='CI Assessment!A1:Z100'
            ).execute()
            
            rows = result.get('values', [])
            if not rows:
                self.send_error(500, "No data found")
                return

            # Count participants by sector
            sector_counts = {}
            total_participants = len(rows) - 1  # Exclude header
            
            for row in rows[1:]:
                if len(row) > 1:
                    sector = row[1] if len(row) > 1 else 'Unknown'
                    sector_counts[sector] = sector_counts.get(sector, 0) + 1

            dashboard_data = {
                'sheetName': 'CI Assessment',
                'total': total_participants,
                'sectors': sector_counts,
                'lastUpdated': datetime.now().isoformat()
            }
            
            self.send_json_response(dashboard_data)
            
        except Exception as e:
            print(f"Dashboard data error: {e}")
            self.send_error(500, "Failed to fetch dashboard data")

    def handle_participants(self):
        """Provide participants data"""
        try:
            result = self.sheets_service.spreadsheets().values().get(
                spreadsheetId=SHEET_ID,
                range='CI Assessment!A1:Z100'
            ).execute()
            
            rows = result.get('values', [])
            if not rows:
                self.send_error(500, "No data found")
                return

            headers = rows[0]
            participants = []
            
            for row in rows[1:]:
                if len(row) > 0 and row[0]:  # Has name
                    participant = {
                        'name': row[0],
                        'sector': row[1] if len(row) > 1 else 'Unknown',
                        'region': row[2] if len(row) > 2 else 'Unknown',
                        'socialMedia': self.safe_float(row[3]) if len(row) > 3 else 0,
                        'website': self.safe_float(row[4]) if len(row) > 4 else 0,
                        'visualContent': self.safe_float(row[5]) if len(row) > 5 else 0,
                        'discoverability': self.safe_float(row[6]) if len(row) > 6 else 0,
                        'digitalSales': self.safe_float(row[7]) if len(row) > 7 else 0,
                        'platformIntegration': self.safe_float(row[8]) if len(row) > 8 else 0,
                        'externalTotal': self.safe_float(row[9]) if len(row) > 9 else 0,
                        'surveyTotal': self.safe_float(row[10]) if len(row) > 10 else 0,
                        'combinedScore': self.safe_float(row[11]) if len(row) > 11 else 0,
                        'maturityLevel': self.get_maturity_level(self.safe_float(row[9]) if len(row) > 9 else 0)
                    }
                    participants.append(participant)
            
            self.send_json_response(participants)
            
        except Exception as e:
            print(f"Participants data error: {e}")
            self.send_error(500, "Failed to fetch participants data")

    def handle_platform_adoption(self):
        """Provide platform adoption data"""
        # Mock data for now - can be enhanced with real data
        platform_data = {
            'overall': {
                'social_media': 75,
                'website': 60,
                'e_commerce': 40,
                'analytics': 30
            },
            'by_sector': {
                'Cultural heritage sites/museums': {'social_media': 70, 'website': 80, 'e_commerce': 20},
                'Crafts and artisan products': {'social_media': 85, 'website': 50, 'e_commerce': 60},
                'Performing and visual arts': {'social_media': 90, 'website': 40, 'e_commerce': 30}
            }
        }
        self.send_json_response(platform_data)

    def handle_technical_audit(self):
        """Provide technical audit summary"""
        # Mock data for now
        audit_data = {
            'summary': {
                'total_audited': 25,
                'critical_issues': 5,
                'medium_issues': 12,
                'low_issues': 8
            },
            'common_issues': [
                {'issue': 'Missing SSL certificate', 'count': 8, 'severity': 'critical'},
                {'issue': 'Slow page load times', 'count': 15, 'severity': 'medium'},
                {'issue': 'Missing meta descriptions', 'count': 20, 'severity': 'low'}
            ]
        }
        self.send_json_response(audit_data)

    def handle_sectors(self):
        """Provide sectors data"""
        try:
            result = self.sheets_service.spreadsheets().values().get(
                spreadsheetId=SHEET_ID,
                range='CI Assessment!A1:Z100'
            ).execute()
            
            rows = result.get('values', [])
            if not rows:
                self.send_error(500, "No data found")
                return

            # Count by sector
            sector_stats = {}
            for row in rows[1:]:
                if len(row) > 1:
                    sector = row[1]
                    if sector not in sector_stats:
                        sector_stats[sector] = {'count': 0, 'avg_score': 0, 'scores': []}
                    sector_stats[sector]['count'] += 1
                    if len(row) > 9:  # Has external score
                        score = self.safe_float(row[9])
                        if score > 0:
                            sector_stats[sector]['scores'].append(score)
            
            # Calculate averages
            for sector, stats in sector_stats.items():
                if stats['scores']:
                    stats['avg_score'] = sum(stats['scores']) / len(stats['scores'])
                del stats['scores']  # Remove raw scores
            
            self.send_json_response(sector_stats)
            
        except Exception as e:
            print(f"Sectors data error: {e}")
            self.send_error(500, "Failed to fetch sectors data")

    def handle_participant_detail(self):
        """Handle participant detail requests"""
        try:
            # Parse the request path to get participant name and type
            path_parts = self.path.split('/')
            if len(path_parts) < 4:
                self.send_error(400, "Invalid participant path")
                return
            
            participant_name = urllib.parse.unquote(path_parts[3])
            request_type = path_parts[4] if len(path_parts) > 4 else 'plan'
            
            # Mock data for now - can be enhanced with real data
            if request_type == 'plan':
                plan_data = {
                    'participant': participant_name,
                    'recommendations': [
                        'Improve digital presence',
                        'Enhance social media engagement',
                        'Develop online sales capabilities'
                    ],
                    'priority_actions': [
                        'Set up professional website',
                        'Create social media strategy',
                        'Implement online booking system'
                    ]
                }
                self.send_json_response(plan_data)
            elif request_type == 'opportunities':
                opportunities_data = {
                    'participant': participant_name,
                    'opportunities': [
                        'Digital marketing expansion',
                        'Online sales growth',
                        'Social media engagement'
                    ],
                    'market_potential': 'High',
                    'next_steps': [
                        'Conduct digital readiness assessment',
                        'Develop digital strategy',
                        'Implement recommended tools'
                    ]
                }
                self.send_json_response(opportunities_data)
            else:
                self.send_error(404, "Unknown request type")
                
        except Exception as e:
            print(f"Participant detail error: {e}")
            self.send_error(500, "Failed to fetch participant data")

    def handle_login(self):
        """Handle login requests"""
        try:
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
                self.update_user_login(username)
                self.send_json_response({'user': user_data})
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

            result = self.sheets_service.spreadsheets().values().get(
                spreadsheetId=SHEET_ID,
                range='dashboard_auth!A1:Z100'
            ).execute()
            
            rows = result.get('values', [])
            if not rows:
                return None

            for row in rows[1:]:
                if len(row) >= 3 and row[1].strip().lower() == username:
                    return {
                        'id': row[1].strip().lower(),
                        'username': row[1].strip().lower(),
                        'name': row[0].strip(),
                        'role': row[2].strip().lower() if len(row) > 2 else 'user',
                        'email': f"{row[1].strip().lower()}@itc.int",
                        'loginCount': int(row[4]) if len(row) > 4 and row[4].strip() else 0
                    }
            return None

        except Exception as e:
            print(f"Authentication error: {e}")
            return None

    def update_user_login(self, username):
        """Update user login count and timestamp"""
        try:
            if not self.sheets_service:
                return

            result = self.sheets_service.spreadsheets().values().get(
                spreadsheetId=SHEET_ID,
                range='dashboard_auth!A1:Z100'
            ).execute()
            
            rows = result.get('values', [])
            if not rows:
                return

            for i, row in enumerate(rows[1:], start=2):
                if len(row) >= 2 and row[1].strip().lower() == username:
                    current_count = int(row[4]) if len(row) > 4 and row[4].strip() else 0
                    new_count = current_count + 1
                    
                    update_range = f'dashboard_auth!E{i}:F{i}'
                    values = [[str(new_count), datetime.now().isoformat()]]
                    
                    self.sheets_service.spreadsheets().values().update(
                        spreadsheetId=SHEET_ID,
                        range=update_range,
                        valueInputOption='RAW',
                        body={'values': values}
                    ).execute()
                    break

        except Exception as e:
            print(f"Error updating login: {e}")

    def safe_float(self, value):
        """Safely convert to float"""
        try:
            return float(value) if value and str(value).strip() else 0.0
        except (ValueError, TypeError):
            return 0.0

    def get_maturity_level(self, score):
        """Determine maturity level based on score"""
        if score >= 60:
            return "Advanced"
        elif score >= 40:
            return "Intermediate"
        elif score >= 20:
            return "Basic"
        else:
            return "Absent"

    def send_json_response(self, data):
        """Send JSON response"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def send_error_response(self, code, message):
        """Send error response"""
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({'error': message}).encode('utf-8'))

def run_api_server(port=5003):
    """Run the comprehensive API server"""
    print(f"🚀 Starting comprehensive API server on port {port}")
    print("📊 Connected to Google Sheets for all dashboard data")
    
    with socketserver.TCPServer(("", port), APIHandler) as httpd:
        print(f"✅ API server running at http://localhost:{port}")
        print("🔐 Available API endpoints:")
        print("   - /api/dashboard - Dashboard summary data")
        print("   - /api/participants - Participants data")
        print("   - /api/sectors - Sectors analysis")
        print("   - /api/platform-adoption/overall - Platform adoption")
        print("   - /api/technical-audit/summary - Technical audit")
        print("   - /api/auth/login - Authentication")
        print("\n🌐 Dashboard should now work at http://localhost:3001")
        httpd.serve_forever()

if __name__ == "__main__":
    run_api_server()
