#!/usr/bin/env python3
"""
Automated Sentiment Analysis Pipeline
Runs analysis, uploads to Firebase, and triggers Google Sheets update
"""

import json
import os
import subprocess
from datetime import datetime
from batch_sentiment_analysis import process_all_stakeholders, generate_google_sheets_data
from firebase_sentiment_integration import FirebaseSentimentIntegration

def run_complete_pipeline(project_id="gambia_tourism_2025"):
    """Run the complete automated pipeline"""
    print("🚀 Starting Automated Sentiment Analysis Pipeline")
    print("=" * 60)
    
    try:
        # Step 1: Run sentiment analysis
        print("📊 Step 1: Running sentiment analysis...")
        all_results, summary_stats = process_all_stakeholders()
        
        # Step 2: Generate Google Sheets data
        print("📈 Step 2: Generating Google Sheets data...")
        sheets_data = generate_google_sheets_data(all_results, summary_stats)
        
        # Step 3: Upload to Firebase
        print("🔥 Step 3: Uploading to Firebase...")
        firebase_integration = FirebaseSentimentIntegration()
        
        analysis_data = {
            'summary': summary_stats,
            'stakeholder_data': sheets_data,
            'generated_at': datetime.now().isoformat()
        }
        
        success = firebase_integration.upload_sentiment_analysis(analysis_data, project_id)
        
        if success:
            print("✅ Data successfully uploaded to Firebase")
            
            # Step 4: Trigger Google Sheets update (if you have a webhook)
            print("📊 Step 4: Triggering Google Sheets update...")
            trigger_google_sheets_update(project_id)
            
            print("🎉 Pipeline completed successfully!")
            return True
        else:
            print("❌ Firebase upload failed")
            return False
            
    except Exception as e:
        print(f"❌ Pipeline failed: {e}")
        return False

def trigger_google_sheets_update(project_id):
    """Trigger Google Sheets update via webhook or API"""
    # This would typically call a Google Apps Script webhook
    # or use the Google Sheets API to refresh the data
    
    webhook_url = f"https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?project_id={project_id}"
    
    try:
        import requests
        response = requests.post(webhook_url, timeout=30)
        if response.status_code == 200:
            print("✅ Google Sheets update triggered")
        else:
            print(f"⚠️ Google Sheets update failed: {response.status_code}")
    except Exception as e:
        print(f"⚠️ Could not trigger Google Sheets update: {e}")

def schedule_pipeline():
    """Schedule the pipeline to run automatically"""
    # This could be set up as a cron job or cloud function
    print("⏰ Setting up scheduled pipeline...")
    print("Recommended schedule: Daily at 2 AM")
    print("Cron expression: 0 2 * * *")
    
    # Example cron job setup
    cron_command = "0 2 * * * cd /path/to/project && python3 automated_sentiment_pipeline.py"
    print(f"Add this to your crontab: {cron_command}")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        project_id = sys.argv[1]
    else:
        project_id = "gambia_tourism_2025"
    
    success = run_complete_pipeline(project_id)
    
    if success:
        print("\n🎯 Next Steps:")
        print("1. Check Firebase for uploaded data")
        print("2. Verify Google Sheets integration")
        print("3. Set up automated scheduling")
        print("4. Configure stakeholder-specific access")
    else:
        print("\n❌ Pipeline failed. Check logs for details.")
