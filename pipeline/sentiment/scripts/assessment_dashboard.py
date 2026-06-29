#!/usr/bin/env python3
"""
Interactive Assessment Dashboard
Web-based tool for manual assessment with Google Sheets integration
"""

import os
import json
from datetime import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build
from flask import Flask, render_template, request, jsonify, redirect, url_for

app = Flask(__name__)

# Google Sheets setup
SHEET_ID = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
key_path = '../../../tourism-development-d620c-5c9db9e21301.json'

# Simple credentials setup
try:
    credentials = service_account.Credentials.from_service_account_file(
        key_path,
        scopes=['https://www.googleapis.com/auth/spreadsheets']
    )
    service = build('sheets', 'v4', credentials=credentials)
    print("✅ Google Sheets service connected successfully")
except Exception as e:
    print(f"❌ Error connecting to Google Sheets: {e}")
    service = None

# Assessment criteria definitions
CRITERIA_DEFINITIONS = {
    'social_media': {
        'name': 'Social Media Presence',
        'description': 'Digital engagement and content quality across social platforms',
        'criteria': {
            'SM1': {'name': 'Primary Platform', 'description': 'Has at least one active social media account (Facebook, Instagram, YouTube, etc.)'},
            'SM2': {'name': 'Secondary Platform', 'description': 'Has two or more social media platforms'},
            'SM3': {'name': 'Tertiary Platform', 'description': 'Has three or more social media platforms'},
            'SM4': {'name': 'Regular Posting', 'description': 'Posts content at least weekly (check last 30 days)'},
            'SM5': {'name': 'Quality Content', 'description': 'Posts are well-crafted, relevant, and engaging'},
            'SM6': {'name': 'Visual Content', 'description': 'Uses photos, videos, or graphics in posts'},
            'SM7': {'name': 'Engagement', 'description': 'Gets likes, comments, shares on posts'},
            'SM8': {'name': 'Business Info', 'description': 'Profile includes business details, contact info'},
            'SM9': {'name': 'Call to Action', 'description': 'Encourages bookings, visits, or contact'},
            'SM10': {'name': 'Professional Branding', 'description': 'Consistent visual identity across platforms'}
        }
    },
    'website': {
        'name': 'Website Quality',
        'description': 'Professional web presence and user experience',
        'criteria': {
            'WEB1': {'name': 'Exists & Loads', 'description': 'Website exists and loads without errors'},
            'WEB2': {'name': 'Mobile Friendly', 'description': 'Website works well on mobile devices'},
            'WEB3': {'name': 'No Major Issues', 'description': 'No broken links, missing images, or technical problems'},
            'WEB4': {'name': 'Services Described', 'description': 'Clearly describes what services/products are offered'},
            'WEB5': {'name': 'Contact Visible', 'description': 'Contact information is easy to find'},
            'WEB6': {'name': 'Contact Forms', 'description': 'Has working contact forms or booking systems'},
            'WEB7': {'name': 'Recently Updated', 'description': 'Content appears current (within last year)'},
            'WEB8': {'name': 'Modern Design', 'description': 'Professional, attractive, modern appearance'},
            'WEB9': {'name': 'Multiple Pages', 'description': 'Has more than just a homepage'},
            'WEB10': {'name': 'Social Links', 'description': 'Links to social media accounts'}
        }
    },
    'visual_content': {
        'name': 'Visual Content Quality',
        'description': 'Quality and appeal of visual materials',
        'criteria': {
            'VIS1': {'name': 'High Quality Photos', 'description': 'Uses clear, professional photos'},
            'VIS2': {'name': 'Variety of Images', 'description': 'Shows different aspects of business/services'},
            'VIS3': {'name': 'Recent Photos', 'description': 'Photos appear current and up-to-date'},
            'VIS4': {'name': 'Brand Consistency', 'description': 'Visual style matches business branding'},
            'VIS5': {'name': 'Product Showcase', 'description': 'Effectively showcases products/services'},
            'VIS6': {'name': 'Professional Lighting', 'description': 'Photos are well-lit and clear'},
            'VIS7': {'name': 'Appropriate Composition', 'description': 'Photos are well-composed and appealing'},
            'VIS8': {'name': 'Video Content', 'description': 'Uses video to showcase business'},
            'VIS9': {'name': 'User Generated Content', 'description': 'Features customer photos or testimonials'},
            'VIS10': {'name': 'Visual Storytelling', 'description': 'Tells a story through images'}
        }
    },
    'discoverability': {
        'name': 'Online Discoverability',
        'description': 'How easily customers can find the business online',
        'criteria': {
            'DIS1': {'name': 'Google Search Results', 'description': 'Appears in Google search results for relevant terms'},
            'DIS2': {'name': 'Google My Business', 'description': 'Has a complete Google My Business listing'},
            'DIS3': {'name': 'Directory Listings', 'description': 'Listed on tourism directories (TripAdvisor, etc.)'},
            'DIS4': {'name': 'First Page Results', 'description': 'Appears on first page of search results'},
            'DIS5': {'name': 'GMB Photos', 'description': 'Google My Business has photos'},
            'DIS6': {'name': 'Multiple Directories', 'description': 'Listed on multiple relevant directories'},
            'DIS7': {'name': 'Positive Reviews', 'description': 'Has positive online reviews'},
            'DIS8': {'name': 'Review Response', 'description': 'Responds to customer reviews'},
            'DIS9': {'name': 'Local SEO', 'description': 'Optimized for local search terms'},
            'DIS10': {'name': 'Consistent NAP', 'description': 'Name, Address, Phone consistent across platforms'}
        }
    },
    'digital_sales': {
        'name': 'Digital Sales Capability',
        'description': 'Online booking, purchasing, and customer conversion',
        'criteria': {
            'DIG1': {'name': 'Online Booking', 'description': 'Customers can book services online'},
            'DIG2': {'name': 'Payment Processing', 'description': 'Accepts online payments'},
            'DIG3': {'name': 'Product Catalog', 'description': 'Shows available products/services clearly'},
            'DIG4': {'name': 'Pricing Information', 'description': 'Clear pricing for services/products'},
            'DIG5': {'name': 'Booking Calendar', 'description': 'Shows availability and booking calendar'},
            'DIG6': {'name': 'Customer Accounts', 'description': 'Customers can create accounts'},
            'DIG7': {'name': 'Order Tracking', 'description': 'Customers can track orders/bookings'},
            'DIG8': {'name': 'Email Marketing', 'description': 'Collects emails for marketing'},
            'DIG9': {'name': 'Promotional Offers', 'description': 'Offers discounts or special deals online'},
            'DIG10': {'name': 'Customer Support', 'description': 'Provides online customer support'}
        }
    },
    'platform_integration': {
        'name': 'Platform Integration',
        'description': 'Integration with booking platforms and tourism systems',
        'criteria': {
            'PLAT1': {'name': 'Booking Platforms', 'description': 'Listed on major booking platforms (Booking.com, Expedia, etc.)'},
            'PLAT2': {'name': 'TripAdvisor', 'description': 'Has TripAdvisor listing'},
            'PLAT3': {'name': 'Tourism Websites', 'description': 'Featured on tourism authority websites'},
            'PLAT4': {'name': 'Travel Agencies', 'description': 'Works with travel agencies'},
            'PLAT5': {'name': 'Hotel Partnerships', 'description': 'Partners with hotels for referrals'},
            'PLAT6': {'name': 'Event Platforms', 'description': 'Uses event booking platforms'},
            'PLAT7': {'name': 'Social Commerce', 'description': 'Sells directly through social media'},
            'PLAT8': {'name': 'API Integration', 'description': 'Integrates with other tourism systems'},
            'PLAT9': {'name': 'Mobile Apps', 'description': 'Has mobile app or works with travel apps'},
            'PLAT10': {'name': 'Third-party Reviews', 'description': 'Encourages reviews on multiple platforms'}
        }
    }
}

def get_stakeholders():
    """Get all stakeholders from Checklist Detail"""
    try:
        if not service:
            print("Google Sheets service not available")
            return []
            
        result = service.spreadsheets().values().get(
            spreadsheetId=SHEET_ID,
            range='Checklist Detail!A2:BW200'
        ).execute()
        
        rows = result.get('values', [])
        stakeholders = []
        
        # Helper function to safely convert to int
        def safe_int(value, default=0):
            try:
                return int(value) if value and str(value).strip() else default
            except (ValueError, TypeError):
                return default
        
        for i, row in enumerate(rows, start=2):
            if row and len(row) > 0 and row[0].strip():
                stakeholders.append({
                    'id': i,
                    'name': row[0].strip(),
                    'sector': row[1] if len(row) > 1 else '',
                    'date': row[2] if len(row) > 2 else '',
                    'method': row[3] if len(row) > 3 else '',
                    'assessor': row[4] if len(row) > 4 else '',
                    'social_media_raw': safe_int(row[15]) if len(row) > 15 else 0,
                    'website_raw': safe_int(row[26]) if len(row) > 26 else 0,
                    'visual_content_raw': safe_int(row[37]) if len(row) > 37 else 0,
                    'discoverability_raw': safe_int(row[48]) if len(row) > 48 else 0,
                    'digital_sales_raw': safe_int(row[59]) if len(row) > 59 else 0,
                    'platform_integration_raw': safe_int(row[70]) if len(row) > 70 else 0,
                    'total_raw': safe_int(row[71]) if len(row) > 71 else 0,
                    'notes': row[72] if len(row) > 72 else '',
                    'confidence': row[73] if len(row) > 73 else '',
                    'manual_review': row[74] if len(row) > 74 else ''
                })
        
        return stakeholders
    except Exception as e:
        print(f"Error getting stakeholders: {e}")
        return []

def get_stakeholder_links(stakeholder_name, sector):
    """Get social media and platform links for a stakeholder"""
    # Try multiple sheets to find the stakeholder data
    sheets_to_check = ['Menus', 'Master Assessment', 'TO Assessment', 'CI Assessment']
    
    for sheet_name in sheets_to_check:
        try:
            result = service.spreadsheets().values().get(
                spreadsheetId=SHEET_ID,
                range=f'{sheet_name}!A2:AO100'
            ).execute()
            
            rows = result.get('values', [])
            
            for row in rows:
                if row and len(row) > 0 and row[0].strip() == stakeholder_name:
                    # Try different column mappings based on the sheet structure
                    if sheet_name == 'Menus':
                        # Based on the image: A=Name, AL=Facebook, AM=Instagram, AN=TripAdvisor, AO=YouTube, AK=Website
                        return {
                            'facebook': row[37] if len(row) > 37 else '',  # Column AL (index 37)
                            'instagram': row[38] if len(row) > 38 else '',  # Column AM (index 38)
                            'youtube': row[40] if len(row) > 40 else '',    # Column AO (index 40)
                            'tripadvisor': row[39] if len(row) > 39 else '', # Column AN (index 39)
                            'website': row[36] if len(row) > 36 else ''      # Column AK (index 36)
                        }
                    else:
                        # Fallback for other sheets
                        return {
                            'facebook': row[37] if len(row) > 37 else '',
                            'instagram': row[38] if len(row) > 38 else '',
                            'youtube': row[39] if len(row) > 39 else '',
                            'tripadvisor': row[40] if len(row) > 40 else '',
                            'website': row[41] if len(row) > 41 else ''
                        }
        except Exception as e:
            print(f"Error getting links for {stakeholder_name} from {sheet_name}: {e}")
            continue
    
    return {
        'facebook': '',
        'instagram': '',
        'youtube': '',
        'tripadvisor': '',
        'website': ''
    }

def get_stakeholder_scores(stakeholder_id):
    """Get current scores for a stakeholder"""
    result = service.spreadsheets().values().get(
        spreadsheetId=SHEET_ID,
        range=f'Checklist Detail!F{stakeholder_id}:BR{stakeholder_id}'
    ).execute()
    
    row = result.get('values', [])
    if not row or not row[0]:
        return {}
    
    row = row[0]
    
    # Extract scores for each category - safely handle empty strings and non-numeric values
    def safe_int(value, default=0):
        try:
            return int(value) if value and str(value).strip() else default
        except (ValueError, TypeError):
            return default
    
    scores = {
        'social_media': [safe_int(row[i]) if i < len(row) else 0 for i in range(0, 10)],
        'website': [safe_int(row[i]) if i < len(row) else 0 for i in range(10, 20)],
        'visual_content': [safe_int(row[i]) if i < len(row) else 0 for i in range(20, 30)],
        'discoverability': [safe_int(row[i]) if i < len(row) else 0 for i in range(30, 40)],
        'digital_sales': [safe_int(row[i]) if i < len(row) else 0 for i in range(40, 50)],
        'platform_integration': [safe_int(row[i]) if i < len(row) else 0 for i in range(50, 60)]
    }
    
    return scores

@app.route('/')
def index():
    """Main dashboard page"""
    stakeholders = get_stakeholders()
    return render_template('dashboard.html', 
                         stakeholders=stakeholders, 
                         criteria=CRITERIA_DEFINITIONS)

@app.route('/assess/<int:stakeholder_id>')
def assess_stakeholder(stakeholder_id):
    """Individual stakeholder assessment page"""
    stakeholders = get_stakeholders()
    stakeholder = next((s for s in stakeholders if s['id'] == stakeholder_id), None)
    
    if not stakeholder:
        return "Stakeholder not found", 404
    
    # Get stakeholder links
    links = get_stakeholder_links(stakeholder['name'], stakeholder['sector'])
    
    # Get current scores
    scores = get_stakeholder_scores(stakeholder_id)
    
    return render_template('assess.html', 
                         stakeholder=stakeholder,
                         links=links,
                         scores=scores,
                         criteria=CRITERIA_DEFINITIONS)

@app.route('/update_scores', methods=['POST'])
def update_scores():
    """Update scores for a stakeholder"""
    try:
        if not service:
            return jsonify({'success': False, 'error': 'Google Sheets service not available'}), 500
            
        data = request.json
        print(f"Received data: {data}")  # Debug log
        
        if not data:
            return jsonify({'success': False, 'error': 'No data received'}), 400
            
        stakeholder_id = data.get('stakeholder_id')
        category = data.get('category')
        criterion = data.get('criterion')
        value_str = data.get('value', '')
        
        # Handle empty or invalid value
        if value_str == '' or value_str is None:
            value = 0
        else:
            try:
                value = int(value_str)
            except (ValueError, TypeError):
                print(f"Invalid value received: '{value_str}', defaulting to 0")
                value = 0
        
        # Validate required fields
        if not stakeholder_id or not category or not criterion:
            return jsonify({'success': False, 'error': 'Missing required fields: stakeholder_id, category, or criterion'}), 400
        
        # Calculate column position
        category_columns = {
            'social_media': 5,    # F
            'website': 15,        # Q
            'visual_content': 25, # AB
            'discoverability': 35, # AM
            'digital_sales': 45,  # AX
            'platform_integration': 55 # BI
        }
        
        criterion_num = int(criterion[3:])  # Extract number from SM1, WEB2, etc.
        col_letter = chr(65 + category_columns[category] + criterion_num - 1)
        
        # Update the cell with retry logic
        max_retries = 3
        for attempt in range(max_retries):
            try:
                service.spreadsheets().values().update(
                    spreadsheetId=SHEET_ID,
                    range=f'Checklist Detail!{col_letter}{stakeholder_id}',
                    valueInputOption='USER_ENTERED',
                    body={'values': [[value]]}
                ).execute()
                return jsonify({'success': True})
            except Exception as e:
                if attempt == max_retries - 1:
                    print(f"Failed to update after {max_retries} attempts: {e}")
                    return jsonify({'success': False, 'error': str(e)}), 500
                else:
                    print(f"Attempt {attempt + 1} failed, retrying: {e}")
                    import time
                    time.sleep(1)
                    
    except Exception as e:
        print(f"Error in update_scores: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    print("=" * 80)
    print("🎯 INTERACTIVE ASSESSMENT DASHBOARD")
    print("=" * 80)
    print()
    print("Starting web server...")
    print("Dashboard will be available at: http://localhost:8080")
    print()
    print("Features:")
    print("✅ Browse all stakeholders")
    print("✅ Click to assess individual stakeholders")
    print("✅ See social media and platform links")
    print("✅ Interactive checkboxes for each criterion")
    print("✅ Real-time updates to Google Sheets")
    print("✅ Clear descriptions for each assessment point")
    print()
    print("Press Ctrl+C to stop the server")
    print("=" * 80)
    
    app.run(debug=True, host='0.0.0.0', port=8080)
