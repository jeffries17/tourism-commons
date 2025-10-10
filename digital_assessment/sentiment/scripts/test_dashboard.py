#!/usr/bin/env python3
"""
Test dashboard with mock data to verify it's working
"""

from flask import Flask, render_template, request, jsonify
import json

app = Flask(__name__)

# Mock data for testing
MOCK_STAKEHOLDERS = [
    {
        'id': 2,
        'name': 'West African Tours',
        'sector': 'Tour Operator',
        'date': '2025-10-01',
        'method': 'Automated',
        'assessor': 'Python Script',
        'social_media_raw': 0,
        'website_raw': 3,
        'visual_content_raw': 0,
        'discoverability_raw': 2,
        'digital_sales_raw': 0,
        'platform_integration_raw': 0,
        'total_raw': 5,
        'notes': 'Test data',
        'confidence': 'medium',
        'manual_review': 'Yes'
    },
    {
        'id': 3,
        'name': 'Abuko Nature Reserve',
        'sector': 'Creative Industries',
        'date': '2025-10-01',
        'method': 'Automated',
        'assessor': 'Python Script',
        'social_media_raw': 0,
        'website_raw': 7,
        'visual_content_raw': 0,
        'discoverability_raw': 4,
        'digital_sales_raw': 0,
        'platform_integration_raw': 0,
        'total_raw': 11,
        'notes': 'Test data',
        'confidence': 'high',
        'manual_review': 'Yes'
    }
]

# Assessment criteria definitions
CRITERIA_DEFINITIONS = {
    'social_media': {
        'name': 'Social Media Presence',
        'description': 'Digital engagement and content quality across social platforms',
        'criteria': {
            'SM1': {'name': 'Primary Platform', 'description': 'Has at least one active social media account'},
            'SM2': {'name': 'Secondary Platform', 'description': 'Has two or more social media platforms'},
            'SM3': {'name': 'Tertiary Platform', 'description': 'Has three or more social media platforms'},
            'SM4': {'name': 'Regular Posting', 'description': 'Posts content at least weekly'},
            'SM5': {'name': 'Quality Content', 'description': 'Posts are well-crafted and engaging'},
            'SM6': {'name': 'Visual Content', 'description': 'Uses photos, videos, or graphics'},
            'SM7': {'name': 'Engagement', 'description': 'Gets likes, comments, shares'},
            'SM8': {'name': 'Business Info', 'description': 'Profile includes business details'},
            'SM9': {'name': 'Call to Action', 'description': 'Encourages bookings or contact'},
            'SM10': {'name': 'Professional Branding', 'description': 'Consistent visual identity'}
        }
    },
    'website': {
        'name': 'Website Quality',
        'description': 'Professional web presence and user experience',
        'criteria': {
            'WEB1': {'name': 'Exists & Loads', 'description': 'Website exists and loads without errors'},
            'WEB2': {'name': 'Mobile Friendly', 'description': 'Website works well on mobile devices'},
            'WEB3': {'name': 'No Major Issues', 'description': 'No broken links or technical problems'},
            'WEB4': {'name': 'Services Described', 'description': 'Clearly describes services/products'},
            'WEB5': {'name': 'Contact Visible', 'description': 'Contact information is easy to find'},
            'WEB6': {'name': 'Contact Forms', 'description': 'Has working contact forms'},
            'WEB7': {'name': 'Recently Updated', 'description': 'Content appears current'},
            'WEB8': {'name': 'Modern Design', 'description': 'Professional, attractive appearance'},
            'WEB9': {'name': 'Multiple Pages', 'description': 'Has more than just a homepage'},
            'WEB10': {'name': 'Social Links', 'description': 'Links to social media accounts'}
        }
    }
}

@app.route('/')
def index():
    """Main dashboard page"""
    return render_template('dashboard.html', 
                         stakeholders=MOCK_STAKEHOLDERS, 
                         criteria=CRITERIA_DEFINITIONS)

@app.route('/assess/<int:stakeholder_id>')
def assess_stakeholder(stakeholder_id):
    """Individual stakeholder assessment page"""
    stakeholder = next((s for s in MOCK_STAKEHOLDERS if s['id'] == stakeholder_id), None)
    
    if not stakeholder:
        return "Stakeholder not found", 404
    
    # Mock links
    links = {
        'facebook': 'https://facebook.com/westafricantours',
        'instagram': 'https://instagram.com/westafricantours',
        'youtube': '',
        'tripadvisor': 'https://tripadvisor.com/westafricantours',
        'website': 'https://westafricantours.com'
    }
    
    # Mock scores
    scores = {
        'social_media': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        'website': [1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        'visual_content': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        'discoverability': [1, 0, 1, 0, 0, 0, 0, 0, 0, 0],
        'digital_sales': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        'platform_integration': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
    
    return render_template('assess.html', 
                         stakeholder=stakeholder,
                         links=links,
                         scores=scores,
                         criteria=CRITERIA_DEFINITIONS)

@app.route('/update_scores', methods=['POST'])
def update_scores():
    """Mock update scores - just return success"""
    data = request.json
    print(f"Mock update: {data}")
    return jsonify({'success': True})

if __name__ == '__main__':
    print("=" * 80)
    print("🧪 TEST DASHBOARD WITH MOCK DATA")
    print("=" * 80)
    print()
    print("Starting test server...")
    print("Dashboard will be available at: http://localhost:8081")
    print()
    print("This version uses mock data to test the interface")
    print("=" * 80)
    
    app.run(debug=True, host='0.0.0.0', port=8081)
