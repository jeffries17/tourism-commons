#!/usr/bin/env python3
"""
Web-based Visual Score Updater for Checklist Detail Sheet
Runs locally in your browser - no tkinter needed!
"""

import os
import json
import csv
from datetime import datetime
from typing import Dict, List, Optional
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.parse
import threading
import webbrowser

try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
    GOOGLE_SHEETS_AVAILABLE = True
except ImportError:
    GOOGLE_SHEETS_AVAILABLE = False
    print("Google Sheets API not available. Install with: pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client")

class WebScoreUpdater:
    def __init__(self):
        self.spreadsheet_id = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
        self.service = None
        self.stakeholders_data = []
        self.current_sheet = 'Checklist Detail'
        
        # Category configuration - From updated_scoring.md
        self.categories = {
            'Social Media': {
                'start_col': 'F',
                'end_col': 'O', 
                'total_col': 'P',
                'criteria': [
                    'Has business account on primary platform',
                    'Has business account on second platform',
                    'Has business account on third platform',
                    'Posts monthly in last 6 months',
                    'Posts 2x monthly in last 6 months',
                    'Posts weekly in last 6 months',
                    'Clear, in-focus photos/videos',
                    'Shows products/services consistently',
                    'Uses platform business features (catalog, shopping, etc.)',
                    'Contact info clearly visible in bio/about'
                ]
            },
            'Website': {
                'start_col': 'Q',
                'end_col': 'Z',
                'total_col': 'AA',
                'criteria': [
                    'Website exists and loads',
                    'Mobile-friendly/responsive',
                    'No major usability issues (broken links, images not loading)',
                    'Services/products clearly described',
                    'Contact information clearly visible',
                    'Working contact forms',
                    'Content updated within last 6 months',
                    'Modern, professional design',
                    'Multiple pages (not just homepage)',
                    'Links to social media accounts'
                ]
            },
            'Visual Content': {
                'start_col': 'AB',
                'end_col': 'AK',
                'total_col': 'AL',
                'criteria': [
                    'Photos are in focus',
                    'Good lighting (not too dark/bright)',
                    'Subject is clearly visible',
                    'Shows products/services',
                    'Behind-the-scenes content',
                    'Different angles/perspectives',
                    'Consistent style/filter',
                    'Good composition (rule of thirds, etc.)',
                    'Professional product shots',
                    'Video content'
                ]
            },
            'Discoverability': {
                'start_col': 'AM',
                'end_col': 'AV',
                'total_col': 'AW',
                'criteria': [
                    'Appears in Google search for business name',
                    'Google My Business listing exists',
                    'Listed on one national directory',
                    'Appears on first page of results',
                    'Google My Business has photos',
                    'Listed on multiple national directories',
                    'Has customer reviews',
                    '5+ reviews total',
                    'Responds to reviews',
                    'Other websites link to them'
                ]
            },
            'Digital Sales': {
                'start_col': 'AX',
                'end_col': 'BG',
                'total_col': 'BH',
                'criteria': [
                    'Contact form on website',
                    'WhatsApp Business for orders',
                    'Phone number clearly visible',
                    'Facebook/Instagram shopping features',
                    'WhatsApp catalog',
                    'Social media posts include pricing',
                    'Mobile money integration',
                    'Online payment options',
                    'Online booking system',
                    'Full e-commerce website'
                ]
            },
            'Platform Integration': {
                'start_col': 'BI',
                'end_col': 'BR',
                'total_col': 'BS',
                'criteria': [
                    'Listed on one Gambian platform (AccessGambia, My-Gambia, VisitTheGambia)',
                    'Listed on TripAdvisor',
                    'Listed on one other platform',
                    'Complete profile information',
                    'Professional photos uploaded',
                    'Contact information provided',
                    'Regular updates on platforms',
                    'Responds to platform messages',
                    'Customer reviews visible',
                    'Cross-platform consistency'
                ]
            }
        }
        
        self.setup_google_sheets()
        self.load_sample_data()

    def setup_google_sheets(self):
        """Setup Google Sheets API connection"""
        if not GOOGLE_SHEETS_AVAILABLE:
            return
            
        # Try to find credentials file
        credentials_paths = [
            'tourism-development-d620c-5c9db9e21301.json',
            './tourism-development-d620c-5c9db9e21301.json'
        ]
        
        credentials_path = None
        for path in credentials_paths:
            if os.path.exists(path):
                credentials_path = path
                break
        
        if not credentials_path:
            print("Google Sheets credentials not found. You can still use the app with CSV import/export.")
            return
            
        try:
            credentials = service_account.Credentials.from_service_account_file(
                credentials_path,
                scopes=['https://www.googleapis.com/auth/spreadsheets']
            )
            self.service = build('sheets', 'v4', credentials=credentials)
            print("✅ Google Sheets API connected successfully!")
        except Exception as e:
            print(f"❌ Error connecting to Google Sheets: {e}")
            self.service = None

    def load_sample_data(self):
        """Load sample data for demonstration"""
        self.stakeholders_data = [
            {
                'name': 'Gambia Cultural Center',
                'sector': 'Cultural heritage sites/museums',
                'region': 'Greater Banjul Area',
                'row': 2,
                'scores': {
                    'Social Media': [1, 1, 0, 1, 0, 0, 0, 0, 0, 0],
                    'Website': [1, 1, 1, 0, 1, 0, 0, 0, 0, 0],
                    'Visual Content': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    'Discoverability': [1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
                    'Digital Sales': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    'Platform Integration': [1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                },
                'websites': {
                    'website': 'https://gambiaculturalcenter.com',
                    'facebook': 'https://facebook.com/gambiaculturalcenter',
                    'instagram': '',
                    'tripadvisor': 'https://tripadvisor.com/gambiaculturalcenter',
                    'youtube': ''
                }
            },
            {
                'name': 'Banjul Art Gallery',
                'sector': 'Performing and visual arts',
                'region': 'Greater Banjul Area',
                'row': 3,
                'scores': {
                    'Social Media': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    'Website': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    'Visual Content': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    'Discoverability': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    'Digital Sales': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    'Platform Integration': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
                },
                'websites': {
                    'website': 'https://banjulartgallery.com',
                    'facebook': 'https://facebook.com/banjulartgallery',
                    'instagram': 'https://instagram.com/banjulartgallery',
                    'tripadvisor': 'https://tripadvisor.com/banjulartgallery',
                    'youtube': 'https://youtube.com/banjulartgallery'
                }
            },
            {
                'name': 'Serekunda Market Crafts',
                'sector': 'Crafts and artisan products',
                'region': 'West Coast Region',
                'row': 4,
                'scores': {
                    'Social Media': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    'Website': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    'Visual Content': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    'Discoverability': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    'Digital Sales': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    'Platform Integration': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                },
                'websites': {
                    'website': '',
                    'facebook': '',
                    'instagram': '',
                    'tripadvisor': '',
                    'youtube': ''
                }
            }
        ]

    def load_from_sheets(self):
        """Load data from Google Sheets - optimized to avoid rate limits"""
        if not self.service:
            return {'success': False, 'error': 'Google Sheets API not available'}
            
        try:
            # Step 1: Load scores from Checklist Detail (A to BS columns)
            range_name = "Checklist Detail!A2:BS1000"
            result = self.service.spreadsheets().values().get(
                spreadsheetId=self.spreadsheet_id,
                range=range_name
            ).execute()
            
            checklist_values = result.get('values', [])
            print(f"✅ Loaded {len(checklist_values)} rows from Checklist Detail sheet")
            
            # Step 2: Load URLs from CI Assessment (columns A, AK-AO)
            ci_result = self.service.spreadsheets().values().get(
                spreadsheetId=self.spreadsheet_id,
                range="CI Assessment!A2:AO1000"
            ).execute()
            ci_values = ci_result.get('values', [])
            print(f"✅ Loaded {len(ci_values)} rows from CI Assessment sheet")
            
            # Step 3: Load URLs from TO Assessment (columns A, AK-AO)
            to_result = self.service.spreadsheets().values().get(
                spreadsheetId=self.spreadsheet_id,
                range="TO Assessment!A2:AO1000"
            ).execute()
            to_values = to_result.get('values', [])
            print(f"✅ Loaded {len(to_values)} rows from TO Assessment sheet")
            
            # Create a URL lookup by stakeholder name
            url_lookup = {}
            
            for row in ci_values + to_values:
                if row and len(row) > 0 and row[0].strip():
                    name = row[0].strip()
                    url_lookup[name] = {
                        'website': str(row[36]).strip() if len(row) > 36 else '',
                        'facebook': str(row[37]).strip() if len(row) > 37 else '',
                        'instagram': str(row[38]).strip() if len(row) > 38 else '',
                        'tripadvisor': str(row[39]).strip() if len(row) > 39 else '',
                        'youtube': str(row[40]).strip() if len(row) > 40 else ''
                    }
            
            print(f"✅ Created URL lookup for {len(url_lookup)} stakeholders")
            
            # Step 4: Parse Checklist Detail data and match with URLs
            self.stakeholders_data = []
            
            for i, row in enumerate(checklist_values, start=2):
                # Skip empty rows
                if not row or len(row) < 3 or not row[0].strip():
                    continue
                
                name = row[0].strip()
                
                stakeholder = {
                    'name': name,
                    'sector': row[1] if len(row) > 1 else 'Unknown',
                    'region': row[2] if len(row) > 2 else 'Unknown',
                    'assessmentDate': row[2] if len(row) > 2 else '',
                    'assessor': row[4] if len(row) > 4 else '',  # Column E
                    'row': i,
                    'scores': {},
                    'websites': url_lookup.get(name, {
                        'website': '', 'facebook': '', 'instagram': '', 'tripadvisor': '', 'youtube': ''
                    })
                }
                
                # Debug: Print first few stakeholders' URLs
                if i <= 5:
                    urls = stakeholder['websites']
                    print(f"Row {i} - {name}: website={urls.get('website', '')[:50]}, fb={urls.get('facebook', '')[:50]}")
                
                # Extract scores for each category from the single row
                # Social Media: F-O (columns 5-14)
                # Website: Q-Z (columns 16-25)
                # Visual Content: AB-AK (columns 27-36)
                # Discoverability: AM-AV (columns 38-47)
                # Digital Sales: AX-BG (columns 49-58)
                # Platform Integration: BI-BR (columns 60-69)
                
                def safe_score(val):
                    """Convert value to 0 or 1"""
                    if not val:
                        return 0
                    val_str = str(val).strip()
                    return 1 if val_str == '1' or val_str.lower() == 'true' else 0
                
                stakeholder['scores'] = {
                    'Social Media': [safe_score(row[j]) if len(row) > j else 0 for j in range(5, 15)],
                    'Website': [safe_score(row[j]) if len(row) > j else 0 for j in range(16, 26)],
                    'Visual Content': [safe_score(row[j]) if len(row) > j else 0 for j in range(27, 37)],
                    'Discoverability': [safe_score(row[j]) if len(row) > j else 0 for j in range(38, 48)],
                    'Digital Sales': [safe_score(row[j]) if len(row) > j else 0 for j in range(49, 59)],
                    'Platform Integration': [safe_score(row[j]) if len(row) > j else 0 for j in range(60, 70)]
                }
                
                self.stakeholders_data.append(stakeholder)
            
            print(f"✅ Successfully parsed {len(self.stakeholders_data)} stakeholders with URLs")
            return {'success': True, 'count': len(self.stakeholders_data)}
            
        except Exception as e:
            print(f"❌ Error loading from Google Sheets: {e}")
            return {'success': False, 'error': str(e)}

    def save_single_stakeholder(self, stakeholder):
        """Save a single stakeholder to Google Sheets and mark as assessed"""
        if not self.service:
            return {'success': False, 'error': 'Google Sheets API not available'}
            
        try:
            row_num = stakeholder['row']
            
            # Build the complete row data (F to BS) for scores
            row_data = []
            
            # Social Media: F-P (10 criteria + 1 total)
            sm_scores = stakeholder['scores'].get('Social Media', [0] * 10)
            row_data.extend([str(s) for s in sm_scores])
            row_data.append(str(sum(sm_scores)))
            
            # Website: Q-AA (10 criteria + 1 total)
            ws_scores = stakeholder['scores'].get('Website', [0] * 10)
            row_data.extend([str(s) for s in ws_scores])
            row_data.append(str(sum(ws_scores)))
            
            # Visual Content: AB-AL (10 criteria + 1 total)
            vc_scores = stakeholder['scores'].get('Visual Content', [0] * 10)
            row_data.extend([str(s) for s in vc_scores])
            row_data.append(str(sum(vc_scores)))
            
            # Discoverability: AM-AW (10 criteria + 1 total)
            dc_scores = stakeholder['scores'].get('Discoverability', [0] * 10)
            row_data.extend([str(s) for s in dc_scores])
            row_data.append(str(sum(dc_scores)))
            
            # Digital Sales: AX-BH (10 criteria + 1 total)
            ds_scores = stakeholder['scores'].get('Digital Sales', [0] * 10)
            row_data.extend([str(s) for s in ds_scores])
            row_data.append(str(sum(ds_scores)))
            
            # Platform Integration: BI-BS (10 criteria + 1 total)
            pi_scores = stakeholder['scores'].get('Platform Integration', [0] * 10)
            row_data.extend([str(s) for s in pi_scores])
            row_data.append(str(sum(pi_scores)))
            
            # Update scores (F to BS)
            self.service.spreadsheets().values().update(
                spreadsheetId=self.spreadsheet_id,
                range=f"Checklist Detail!F{row_num}:BS{row_num}",
                valueInputOption='RAW',
                body={'values': [row_data]}
            ).execute()
            
            # Update Assessor column (E) with 'Alex'
            self.service.spreadsheets().values().update(
                spreadsheetId=self.spreadsheet_id,
                range=f"Checklist Detail!E{row_num}",
                valueInputOption='RAW',
                body={'values': [['Alex']]}
            ).execute()
            
            # Update Assessment Date column (C)
            assessment_date = stakeholder.get('assessmentDate', datetime.now().strftime('%Y-%m-%d'))
            self.service.spreadsheets().values().update(
                spreadsheetId=self.spreadsheet_id,
                range=f"Checklist Detail!C{row_num}",
                valueInputOption='RAW',
                body={'values': [[assessment_date]]}
            ).execute()
            
            print(f"✅ Saved {stakeholder['name']} and marked as assessed by Alex")
            return {'success': True, 'stakeholder': stakeholder['name']}
            
        except Exception as e:
            print(f"❌ Error saving stakeholder: {e}")
            return {'success': False, 'error': str(e)}

    def save_to_sheets(self):
        """Save data to Google Sheets - batch update to avoid rate limits"""
        if not self.service:
            return {'success': False, 'error': 'Google Sheets API not available'}
            
        try:
            # Use batchUpdate to minimize API calls
            batch_data = []
            
            for stakeholder in self.stakeholders_data:
                row_num = stakeholder['row']
                
                # Build the complete row data (F to BS)
                row_data = []
                
                # Social Media: F-P (10 criteria + 1 total)
                sm_scores = stakeholder['scores'].get('Social Media', [0] * 10)
                row_data.extend([str(s) for s in sm_scores])
                row_data.append(str(sum(sm_scores)))  # Total in P
                
                # Website: Q-AA (10 criteria + 1 total)
                ws_scores = stakeholder['scores'].get('Website', [0] * 10)
                row_data.extend([str(s) for s in ws_scores])
                row_data.append(str(sum(ws_scores)))  # Total in AA
                
                # Visual Content: AB-AL (10 criteria + 1 total)
                vc_scores = stakeholder['scores'].get('Visual Content', [0] * 10)
                row_data.extend([str(s) for s in vc_scores])
                row_data.append(str(sum(vc_scores)))  # Total in AL
                
                # Discoverability: AM-AW (10 criteria + 1 total)
                dc_scores = stakeholder['scores'].get('Discoverability', [0] * 10)
                row_data.extend([str(s) for s in dc_scores])
                row_data.append(str(sum(dc_scores)))  # Total in AW
                
                # Digital Sales: AX-BH (10 criteria + 1 total)
                ds_scores = stakeholder['scores'].get('Digital Sales', [0] * 10)
                row_data.extend([str(s) for s in ds_scores])
                row_data.append(str(sum(ds_scores)))  # Total in BH
                
                # Platform Integration: BI-BS (10 criteria + 1 total)
                pi_scores = stakeholder['scores'].get('Platform Integration', [0] * 10)
                row_data.extend([str(s) for s in pi_scores])
                row_data.append(str(sum(pi_scores)))  # Total in BS
                
                batch_data.append({
                    'range': f"Checklist Detail!F{row_num}:BS{row_num}",
                    'values': [row_data]
                })
            
            # Execute batch update - all rows in ONE API call
            body = {
                'valueInputOption': 'RAW',
                'data': batch_data
            }
            
            result = self.service.spreadsheets().values().batchUpdate(
                spreadsheetId=self.spreadsheet_id,
                body=body
            ).execute()
            
            print(f"✅ Successfully saved {len(self.stakeholders_data)} stakeholders to Google Sheets")
            return {'success': True, 'count': len(self.stakeholders_data)}
            
        except Exception as e:
            print(f"❌ Error saving to Google Sheets: {e}")
            return {'success': False, 'error': str(e)}

    def export_csv(self):
        """Export data to CSV format"""
        try:
            # Prepare headers
            headers = ['Name', 'Sector', 'Region']
            for category_name, category_config in self.categories.items():
                for criterion in category_config['criteria']:
                    headers.append(f"{category_name} - {criterion}")
                headers.append(f"{category_name} Total")
            
            # Prepare rows
            rows = []
            for stakeholder in self.stakeholders_data:
                row = [stakeholder['name'], stakeholder['sector'], stakeholder['region']]
                
                for category_name in self.categories.keys():
                    scores = stakeholder['scores'].get(category_name, [0] * 10)
                    row.extend(scores)
                    row.append(sum(scores))
                
                rows.append(row)
            
            return {'success': True, 'headers': headers, 'rows': rows}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def update_score(self, stakeholder_name, category_name, criterion_index, checked):
        """Update a single score"""
        stakeholder = next((s for s in self.stakeholders_data if s['name'] == stakeholder_name), None)
        if stakeholder:
            if category_name not in stakeholder['scores']:
                stakeholder['scores'][category_name] = [0] * 10
            stakeholder['scores'][category_name][criterion_index] = 1 if checked else 0
            return True
        return False

    def get_stakeholders(self, filter_text=""):
        """Get filtered stakeholders"""
        if not filter_text:
            return self.stakeholders_data
        
        filter_lower = filter_text.lower()
        return [s for s in self.stakeholders_data if filter_lower in s['name'].lower()]

# Global instance
updater = WebScoreUpdater()

class RequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(self.get_html().encode())
        elif self.path == '/api/stakeholders':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            filter_text = self.get_query_param('filter', '')
            stakeholders = updater.get_stakeholders(filter_text)
            response = json.dumps(stakeholders)
            self.wfile.write(response.encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == '/api/load-sheets':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            result = updater.load_from_sheets()
            response = json.dumps(result)
            self.wfile.write(response.encode())
            
        elif self.path == '/api/save-single':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            result = updater.save_single_stakeholder(data['stakeholder'])
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = json.dumps(result)
            self.wfile.write(response.encode())
            
        elif self.path == '/api/save-sheets':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            result = updater.save_to_sheets()
            response = json.dumps(result)
            self.wfile.write(response.encode())
            
        elif self.path == '/api/export-csv':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            result = updater.export_csv()
            response = json.dumps(result)
            self.wfile.write(response.encode())
            
        elif self.path == '/api/update-score':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            success = updater.update_score(
                data['stakeholder_name'],
                data['category_name'],
                data['criterion_index'],
                data['checked']
            )
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = json.dumps({'success': success})
            self.wfile.write(response.encode())
        else:
            self.send_response(404)
            self.end_headers()

    def get_query_param(self, name, default=''):
        query_string = self.path.split('?')[1] if '?' in self.path else ''
        params = urllib.parse.parse_qs(query_string)
        return params.get(name, [default])[0]

    def get_html(self):
        # Escape the categories JSON for safe insertion into JavaScript
        categories_json_str = json.dumps(updater.categories, indent=8)
        return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visual Score Updater - Checklist Detail</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }}

        .container {{
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }}

        .header {{
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }}

        .header h1 {{
            font-size: 2.5em;
            margin-bottom: 10px;
        }}

        .header p {{
            font-size: 1.2em;
            opacity: 0.9;
        }}

        .controls {{
            padding: 20px 30px;
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
            display: flex;
            gap: 20px;
            align-items: center;
            flex-wrap: wrap;
        }}

        .control-group {{
            display: flex;
            flex-direction: column;
            gap: 5px;
        }}

        .control-group label {{
            font-weight: 600;
            color: #495057;
            font-size: 0.9em;
        }}

        .control-group select, .control-group input {{
            padding: 8px 12px;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            font-size: 1em;
            transition: border-color 0.3s;
        }}

        .control-group select:focus, .control-group input:focus {{
            outline: none;
            border-color: #667eea;
        }}

        .btn {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 1em;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }}

        .btn:hover {{
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }}

        .btn:active {{
            transform: translateY(0);
        }}

        .btn-success {{
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        }}

        .btn-secondary {{
            background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
        }}

        .main-content {{
            padding: 30px;
        }}

        .stakeholder-card {{
            background: white;
            border: 2px solid #e9ecef;
            border-radius: 12px;
            margin-bottom: 20px;
            overflow: hidden;
            transition: box-shadow 0.3s, border-color 0.3s;
        }}

        .stakeholder-card:hover {{
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            border-color: #667eea;
        }}

        .stakeholder-header {{
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 20px;
            border-bottom: 1px solid #dee2e6;
        }}

        .stakeholder-name {{
            font-size: 1.5em;
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 5px;
        }}

        .stakeholder-info {{
            color: #6c757d;
            font-size: 1.1em;
        }}

        .website-links {{
            background: #e3f2fd;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
            border-left: 4px solid #2196f3;
        }}

        .website-links h4 {{
            margin: 0 0 10px 0;
            color: #1976d2;
            font-size: 1.1em;
        }}

        .links-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
        }}

        .link-item {{
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px;
            background: white;
            border-radius: 6px;
            border: 1px solid #e0e0e0;
        }}

        .link-item a {{
            color: #1976d2;
            text-decoration: none;
            font-size: 0.9em;
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }}

        .link-item a:hover {{
            text-decoration: underline;
        }}

        .link-icon {{
            font-size: 1.2em;
            min-width: 20px;
        }}

        .no-links {{
            color: #666;
            font-style: italic;
            text-align: center;
            padding: 10px;
        }}

        .navigation-bar {{
            background: #fff3cd;
            padding: 20px 30px;
            border-bottom: 2px solid #ffc107;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
        }}

        .nav-info {{
            font-size: 1.2em;
            font-weight: 600;
            color: #856404;
        }}

        .nav-buttons {{
            display: flex;
            gap: 10px;
        }}

        .btn-nav {{
            background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
            color: #333;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 1em;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }}

        .btn-nav:hover {{
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(255, 193, 7, 0.3);
        }}

        .btn-nav:disabled {{
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }}

        .assessed-badge {{
            background: #28a745;
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.9em;
            font-weight: 600;
            margin-left: 10px;
        }}

        .categories-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            padding: 20px;
        }}

        .category {{
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            border: 2px solid #e9ecef;
        }}

        .category-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #dee2e6;
        }}

        .category-title {{
            font-size: 1.3em;
            font-weight: 700;
            color: #2c3e50;
        }}

        .category-score {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 700;
            font-size: 1.1em;
        }}

        .criteria-list {{
            display: grid;
            gap: 10px;
        }}

        .criterion {{
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px;
            background: white;
            border-radius: 8px;
            border: 1px solid #e9ecef;
            transition: background-color 0.2s;
        }}

        .criterion:hover {{
            background: #f8f9fa;
        }}

        .criterion-checkbox {{
            width: 20px;
            height: 20px;
            cursor: pointer;
            accent-color: #667eea;
        }}

        .criterion-label {{
            flex: 1;
            font-size: 0.95em;
            color: #495057;
            line-height: 1.4;
        }}

        .criterion-points {{
            background: #e9ecef;
            color: #495057;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.85em;
            font-weight: 600;
            min-width: 30px;
            text-align: center;
        }}

        .loading {{
            text-align: center;
            padding: 40px;
            color: #6c757d;
            font-size: 1.2em;
        }}

        .error {{
            background: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border: 1px solid #f5c6cb;
        }}

        .success {{
            background: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border: 1px solid #c3e6cb;
        }}

        .status {{
            padding: 10px;
            background: #e3f2fd;
            color: #1565c0;
            border-radius: 8px;
            margin: 10px 0;
            font-weight: 600;
        }}

        @media (max-width: 768px) {{
            .categories-grid {{
                grid-template-columns: 1fr;
            }}
            
            .controls {{
                flex-direction: column;
                align-items: stretch;
            }}
            
            .control-group {{
                width: 100%;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Visual Score Updater</h1>
            <p>Update scores for Checklist Detail sheet with visual interface</p>
        </div>

        <div class="controls">
            <div class="control-group">
                <label for="sheetSelect">Select Sheet:</label>
                <select id="sheetSelect">
                    <option value="Checklist Detail">Checklist Detail</option>
                    <option value="CI Assessment">CI Assessment</option>
                    <option value="TO Assessment">TO Assessment</option>
                </select>
            </div>

            <div class="control-group">
                <label for="stakeholderFilter">Filter by Name:</label>
                <input type="text" id="stakeholderFilter" placeholder="Search stakeholders...">
            </div>

            <button class="btn" onclick="loadData()">🔄 Load Data</button>
            <button class="btn btn-success" onclick="loadFromSheets()">📊 Load from Google Sheets</button>
            <button class="btn btn-success" onclick="saveToSheets()">💾 Save to Google Sheets</button>
            <button class="btn btn-secondary" onclick="exportCSV()">📁 Export CSV</button>
        </div>

        <div id="statusBar" class="status" style="display: none;">
            <span id="statusText">Ready</span>
        </div>

        <div id="navigationBar" class="navigation-bar" style="display: none;">
            <div class="nav-info">
                <span id="currentIndex">1</span> of <span id="totalCount">0</span>
                <span id="assessedBadge" class="assessed-badge" style="display: none;">✓ Assessed by Alex</span>
            </div>
            <div class="nav-buttons">
                <button class="btn-nav" id="prevBtn" onclick="previousStakeholder()" disabled>← Previous</button>
                <button class="btn btn-success" onclick="saveCurrentAndNext()">💾 Save & Next →</button>
                <button class="btn-nav" id="nextBtn" onclick="nextStakeholder()">Next →</button>
                <button class="btn btn-secondary" onclick="toggleViewMode()">📋 View All</button>
            </div>
        </div>

        <div class="main-content">
            <div id="loadingMessage" class="loading" style="display: none;">
                Loading data...
            </div>

            <div id="errorMessage" class="error" style="display: none;"></div>
            <div id="successMessage" class="success" style="display: none;"></div>

            <div id="stakeholdersContainer"></div>
        </div>
    </div>

    <script>
        let stakeholdersData = [];
        const categories = {categories_json_str};
        let currentIndex = 0;
        let viewMode = 'single'; // 'single' or 'all'

        // Auto-load from Google Sheets on startup
        document.addEventListener('DOMContentLoaded', function() {{
            loadFromSheets();
        }});

        async function loadData() {{
            showLoading(true);
            hideMessages();
            
            try {{
                const response = await fetch('/api/stakeholders');
                stakeholdersData = await response.json();
                renderStakeholders();
                showSuccess('Data loaded successfully!');
            }} catch (error) {{
                showError('Failed to load data: ' + error.message);
            }} finally {{
                showLoading(false);
            }}
        }}

        async function loadFromSheets() {{
            showLoading(true);
            hideMessages();
            showStatus('Loading from Google Sheets...');
            
            try {{
                const response = await fetch('/api/load-sheets', {{ method: 'POST' }});
                const result = await response.json();
                
                if (result.success) {{
                    await loadData(); // Reload the data
                    showSuccess(`Loaded ${{result.count}} stakeholders from Google Sheets!`);
                }} else {{
                    showError('Failed to load from Google Sheets: ' + result.error);
                }}
            }} catch (error) {{
                showError('Failed to load from Google Sheets: ' + error.message);
            }} finally {{
                showLoading(false);
                hideStatus();
            }}
        }}

        async function saveToSheets() {{
            if (!confirm('Save all changes to Google Sheets? This will update the Checklist Detail sheet.')) {{
                return;
            }}
            
            showLoading(true);
            hideMessages();
            showStatus('Saving to Google Sheets...');
            console.log('Starting save to Google Sheets...');
            console.log('Stakeholders to save:', stakeholdersData.length);
            
            try {{
                const response = await fetch('/api/save-sheets', {{ method: 'POST' }});
                console.log('Save response status:', response.status);
                
                const result = await response.json();
                console.log('Save result:', result);
                
                if (result.success) {{
                    showSuccess(`✅ Successfully saved ${{result.count}} stakeholders to Google Sheets!`);
                    alert(`Success! Saved ${{result.count}} stakeholders to Checklist Detail sheet.`);
                }} else {{
                    showError('Failed to save to Google Sheets: ' + result.error);
                    console.error('Save error:', result.error);
                }}
            }} catch (error) {{
                showError('Failed to save to Google Sheets: ' + error.message);
                console.error('Save exception:', error);
            }} finally {{
                showLoading(false);
                hideStatus();
            }}
        }}

        async function exportCSV() {{
            try {{
                const response = await fetch('/api/export-csv', {{ method: 'POST' }});
                const result = await response.json();
                
                if (result.success) {{
                    // Create CSV content
                    const csvContent = [result.headers, ...result.rows]
                        .map(row => row.map(field => `"${{field}}"`).join(','))
                        .join('\\n');
                    
                    // Download CSV
                    const blob = new Blob([csvContent], {{ type: 'text/csv' }});
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `checklist_detail_export_${{new Date().toISOString().split('T')[0]}}.csv`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    
                    showSuccess('CSV exported successfully!');
                }} else {{
                    showError('Failed to export CSV: ' + result.error);
                }}
            }} catch (error) {{
                showError('Failed to export CSV: ' + error.message);
            }}
        }}

        async function updateScore(stakeholderName, categoryName, criterionIndex, checked) {{
            try {{
                const response = await fetch('/api/update-score', {{
                    method: 'POST',
                    headers: {{ 'Content-Type': 'application/json' }},
                    body: JSON.stringify({{
                        stakeholder_name: stakeholderName,
                        category_name: categoryName,
                        criterion_index: criterionIndex,
                        checked: checked
                    }})
                }});
                
                const result = await response.json();
                if (result.success) {{
                    // Update the local data
                    const stakeholder = stakeholdersData.find(s => s.name === stakeholderName);
                    if (stakeholder) {{
                        if (!stakeholder.scores[categoryName]) {{
                            stakeholder.scores[categoryName] = new Array(10).fill(0);
                        }}
                        stakeholder.scores[categoryName][criterionIndex] = checked ? 1 : 0;
                        
                        // Re-render to update totals
                        renderStakeholders();
                    }}
                }}
            }} catch (error) {{
                console.error('Error updating score:', error);
            }}
        }}

        function renderStakeholders() {{
            const container = document.getElementById('stakeholdersContainer');
            const filter = document.getElementById('stakeholderFilter').value.toLowerCase();
            
            const filteredData = stakeholdersData.filter(stakeholder => 
                stakeholder.name.toLowerCase().includes(filter)
            );
            
            if (viewMode === 'single') {{
                // Show only current stakeholder
                document.getElementById('navigationBar').style.display = 'flex';
                
                if (filteredData.length === 0) {{
                    container.innerHTML = '<div class="loading">No stakeholders found</div>';
                    return;
                }}
                
                const stakeholder = filteredData[currentIndex] || filteredData[0];
                currentIndex = Math.min(currentIndex, filteredData.length - 1);
                
                // Update navigation
                document.getElementById('currentIndex').textContent = currentIndex + 1;
                document.getElementById('totalCount').textContent = filteredData.length;
                document.getElementById('prevBtn').disabled = currentIndex === 0;
                document.getElementById('nextBtn').disabled = currentIndex >= filteredData.length - 1;
                
                // Show assessed badge if assessor is 'Alex'
                const assessedBadge = document.getElementById('assessedBadge');
                if (stakeholder.assessor && stakeholder.assessor.toLowerCase().includes('alex')) {{
                    assessedBadge.style.display = 'inline-block';
                }} else {{
                    assessedBadge.style.display = 'none';
                }}
                
                container.innerHTML = `
                    <div class="stakeholder-card">
                        <div class="stakeholder-header">
                            <div class="stakeholder-name">${{stakeholder.name}}</div>
                            <div class="stakeholder-info">${{stakeholder.sector}} • ${{stakeholder.region}}</div>
                        </div>
                        ${{renderWebsiteLinks(stakeholder)}}
                        <div class="categories-grid">
                            ${{Object.keys(categories).map(category => renderCategory(stakeholder, category)).join('')}}
                        </div>
                    </div>
                `;
            }} else {{
                // Show all stakeholders
                document.getElementById('navigationBar').style.display = 'none';
                
                container.innerHTML = filteredData.map(stakeholder => `
                    <div class="stakeholder-card">
                        <div class="stakeholder-header">
                            <div class="stakeholder-name">${{stakeholder.name}}
                                ${{stakeholder.assessor && stakeholder.assessor.toLowerCase().includes('alex') ? '<span class="assessed-badge">✓ Assessed</span>' : ''}}
                            </div>
                            <div class="stakeholder-info">${{stakeholder.sector}} • ${{stakeholder.region}}</div>
                        </div>
                        ${{renderWebsiteLinks(stakeholder)}}
                        <div class="categories-grid">
                            ${{Object.keys(categories).map(category => renderCategory(stakeholder, category)).join('')}}
                        </div>
                    </div>
                `).join('');
            }}
        }}
        
        function previousStakeholder() {{
            if (currentIndex > 0) {{
                currentIndex--;
                renderStakeholders();
            }}
        }}
        
        function nextStakeholder() {{
            const filter = document.getElementById('stakeholderFilter').value.toLowerCase();
            const filteredData = stakeholdersData.filter(stakeholder => 
                stakeholder.name.toLowerCase().includes(filter)
            );
            
            if (currentIndex < filteredData.length - 1) {{
                currentIndex++;
                renderStakeholders();
            }}
        }}
        
        function toggleViewMode() {{
            viewMode = viewMode === 'single' ? 'all' : 'single';
            if (viewMode === 'single') {{
                currentIndex = 0;
            }}
            renderStakeholders();
        }}
        
        async function saveCurrentAndNext() {{
            const filter = document.getElementById('stakeholderFilter').value.toLowerCase();
            const filteredData = stakeholdersData.filter(stakeholder => 
                stakeholder.name.toLowerCase().includes(filter)
            );
            const currentStakeholder = filteredData[currentIndex];
            
            if (!currentStakeholder) return;
            
            showStatus('Saving current stakeholder...');
            
            try {{
                // Mark as assessed by Alex
                currentStakeholder.assessor = 'Alex';
                currentStakeholder.assessmentDate = new Date().toISOString().split('T')[0];
                
                // Save this stakeholder to Google Sheets
                const response = await fetch('/api/save-single', {{
                    method: 'POST',
                    headers: {{ 'Content-Type': 'application/json' }},
                    body: JSON.stringify({{
                        stakeholder: currentStakeholder
                    }})
                }});
                
                const result = await response.json();
                
                if (result.success) {{
                    showSuccess(`✅ Saved ${{currentStakeholder.name}}!`);
                    
                    // Move to next
                    if (currentIndex < filteredData.length - 1) {{
                        currentIndex++;
                        renderStakeholders();
                    }} else {{
                        alert('All stakeholders assessed! Great job!');
                    }}
                }} else {{
                    showError('Failed to save: ' + result.error);
                }}
            }} catch (error) {{
                showError('Failed to save: ' + error.message);
            }} finally {{
                hideStatus();
            }}
        }}

        function renderWebsiteLinks(stakeholder) {{
            const websites = stakeholder.websites || {{}};
            const hasLinks = Object.values(websites).some(url => url && url.trim() !== '' && url.trim() !== '0');
            
            if (!hasLinks) {{
                return '<div class="website-links"><div class="no-links">No website or social media links available</div></div>';
            }}
            
            const linkItems = [];
            const addLink = (url, icon, label) => {{
                if (url && url.trim() !== '' && url.trim() !== '0') {{
                    // Ensure URL has protocol
                    const fullUrl = url.startsWith('http') ? url : 'https://' + url;
                    linkItems.push(`<div class="link-item"><span class="link-icon">${{icon}}</span><a href="${{fullUrl}}" target="_blank" rel="noopener noreferrer">${{label}}</a></div>`);
                }}
            }};
            
            addLink(websites.website, '🌐', 'Website');
            addLink(websites.facebook, '📘', 'Facebook');
            addLink(websites.instagram, '📷', 'Instagram');
            addLink(websites.tripadvisor, '🏨', 'TripAdvisor');
            addLink(websites.youtube, '📺', 'YouTube');
            
            if (linkItems.length === 0) {{
                return '<div class="website-links"><div class="no-links">No website or social media links available</div></div>';
            }}
            
            return `
                <div class="website-links">
                    <h4>🔗 Quick Reference Links</h4>
                    <div class="links-grid">
                        ${{linkItems.join('')}}
                    </div>
                </div>
            `;
        }}

        function renderCategory(stakeholder, categoryName) {{
            const category = categories[categoryName];
            const scores = stakeholder.scores[categoryName] || new Array(10).fill(0);
            const total = scores.reduce((sum, score) => sum + score, 0);

            return `
                <div class="category">
                    <div class="category-header">
                        <div class="category-title">${{categoryName}}</div>
                        <div class="category-score">${{total}}/10</div>
                    </div>
                    <div class="criteria-list">
                        ${{category.criteria.map((criterion, index) => `
                            <div class="criterion">
                                <input type="checkbox" 
                                       class="criterion-checkbox" 
                                       ${{scores[index] ? 'checked' : ''}}
                                       onchange="updateScore('${{stakeholder.name}}', '${{categoryName}}', ${{index}}, this.checked)">
                                <div class="criterion-label">${{criterion}}</div>
                                <div class="criterion-points">${{scores[index] ? '1' : '0'}}</div>
                            </div>
                        `).join('')}}
                    </div>
                </div>
            `;
        }}

        // Filter functionality
        document.getElementById('stakeholderFilter').addEventListener('input', renderStakeholders);

        // Utility functions
        function showLoading(show) {{
            document.getElementById('loadingMessage').style.display = show ? 'block' : 'none';
        }}

        function showError(message) {{
            const errorDiv = document.getElementById('errorMessage');
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            setTimeout(() => errorDiv.style.display = 'none', 5000);
        }}

        function showSuccess(message) {{
            const successDiv = document.getElementById('successMessage');
            successDiv.textContent = message;
            successDiv.style.display = 'block';
            setTimeout(() => successDiv.style.display = 'none', 3000);
        }}

        function showStatus(message) {{
            const statusDiv = document.getElementById('statusBar');
            const statusText = document.getElementById('statusText');
            statusText.textContent = message;
            statusDiv.style.display = 'block';
        }}

        function hideStatus() {{
            document.getElementById('statusBar').style.display = 'none';
        }}

        function hideMessages() {{
            document.getElementById('errorMessage').style.display = 'none';
            document.getElementById('successMessage').style.display = 'none';
        }}
    </script>
</body>
</html>
        """

def run_server(port=8080):
    """Run the web server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, RequestHandler)
    
    print(f"🎯 Visual Score Updater running at: http://localhost:{port}")
    print("Press Ctrl+C to stop")
    
    # Open browser automatically
    threading.Timer(1.5, lambda: webbrowser.open(f'http://localhost:{port}')).start()
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Server stopped")
        httpd.shutdown()

if __name__ == "__main__":
    run_server()
