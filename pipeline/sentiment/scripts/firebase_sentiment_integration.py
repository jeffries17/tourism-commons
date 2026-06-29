#!/usr/bin/env python3
"""
Firebase integration for sentiment analysis data
Automatically uploads sentiment analysis results to Firebase
"""

import json
import os
from datetime import datetime
from firebase_admin import credentials, firestore, initialize_app
import firebase_admin

class FirebaseSentimentIntegration:
    def __init__(self, credentials_path=None):
        """Initialize Firebase connection"""
        try:
            if not firebase_admin._apps:
                if credentials_path and os.path.exists(credentials_path):
                    cred = credentials.Certificate(credentials_path)
                else:
                    # Try to find credentials file
                    potential_paths = [
                        '../tourism-development-d620c-5c9db9e21301.json',
                        '../../tourism-development-d620c-5c9db9e21301.json',
                        'tourism-development-d620c-5c9db9e21301.json'
                    ]
                    cred = None
                    for path in potential_paths:
                        if os.path.exists(path):
                            cred = credentials.Certificate(path)
                            break
                    
                    if not cred:
                        raise FileNotFoundError("Firebase credentials not found")
                
                initialize_app(cred)
            
            self.db = firestore.client()
            print("✅ Firebase connection initialized")
            
        except Exception as e:
            print(f"❌ Firebase initialization failed: {e}")
            raise
    
    def upload_sentiment_analysis(self, analysis_data, project_id):
        """Upload sentiment analysis results to Firebase"""
        try:
            # Create project-specific collection
            collection_name = f"projects/{project_id}/sentiment_analysis"
            
            # Upload summary data
            summary_doc = self.db.collection(collection_name).document('summary')
            summary_doc.set({
                'total_stakeholders': analysis_data['summary']['total_stakeholders'],
                'total_reviews': analysis_data['summary']['total_reviews'],
                'overall_sentiment_avg': analysis_data['summary']['overall_sentiment_avg'],
                'language_distribution': analysis_data['summary']['language_distribution'],
                'top_themes': analysis_data['summary']['top_themes'],
                'last_updated': datetime.now(),
                'analysis_date': analysis_data.get('generated_at', datetime.now().isoformat())
            })
            
            # Upload individual stakeholder data
            for stakeholder_data in analysis_data['stakeholder_data']:
                stakeholder_doc = self.db.collection(collection_name).document('stakeholders').collection('data').document(stakeholder_data['stakeholder_name'].lower().replace(' ', '_'))
                stakeholder_doc.set({
                    **stakeholder_data,
                    'last_updated': datetime.now(),
                    'project_id': project_id
                })
            
            print(f"✅ Sentiment analysis data uploaded to Firebase project: {project_id}")
            return True
            
        except Exception as e:
            print(f"❌ Firebase upload failed: {e}")
            return False
    
    def get_sentiment_data(self, project_id):
        """Retrieve sentiment analysis data from Firebase"""
        try:
            collection_name = f"projects/{project_id}/sentiment_analysis"
            
            # Get summary
            summary_doc = self.db.collection(collection_name).document('summary').get()
            summary_data = summary_doc.to_dict() if summary_doc.exists else None
            
            # Get stakeholder data
            stakeholders_docs = self.db.collection(collection_name).document('stakeholders').collection('data').stream()
            stakeholder_data = [doc.to_dict() for doc in stakeholders_docs]
            
            return {
                'summary': summary_data,
                'stakeholder_data': stakeholder_data
            }
            
        except Exception as e:
            print(f"❌ Firebase retrieval failed: {e}")
            return None

def main():
    """Main function to upload sentiment analysis to Firebase"""
    # Load analysis results
    with open('sentiment_analysis_results.json', 'r') as f:
        analysis_data = json.load(f)
    
    # Initialize Firebase
    try:
        firebase_integration = FirebaseSentimentIntegration()
        
        # Upload to Firebase (you can specify different project IDs)
        project_id = "gambia_tourism_2025"  # Change this to your project ID
        success = firebase_integration.upload_sentiment_analysis(analysis_data, project_id)
        
        if success:
            print(f"🎉 Sentiment analysis successfully uploaded to Firebase project: {project_id}")
            print("📊 Data is now available for Google Sheets integration")
        else:
            print("❌ Upload failed")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
