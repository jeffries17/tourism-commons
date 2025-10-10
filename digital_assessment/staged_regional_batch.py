#!/usr/bin/env python3
"""
Staged Regional Competitor Analysis - Batch of 5 with Manual Review
Process 5 competitors, pause for manual verification, then continue
"""

import json
import os
from datetime import datetime
from regional_competitor_analyzer import RegionalCompetitorAnalyzer

BATCH_SIZE = 10
PROGRESS_FILE = 'regional_batch_progress.json'

def load_progress():
    """Load progress from previous sessions"""
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, 'r') as f:
            return json.load(f)
    return {
        'completed': [],
        'current_batch': 0,
        'total_processed': 0,
        'started_at': datetime.now().isoformat()
    }

def save_progress(progress):
    """Save progress for resume capability"""
    with open(PROGRESS_FILE, 'w') as f:
        json.dump(progress, f, indent=2)

def display_batch_results(results):
    """Display summary of batch results for manual review"""
    print("\n" + "="*80)
    print("📊 BATCH RESULTS - MANUAL REVIEW REQUIRED")
    print("="*80)
    print()
    
    for i, result in enumerate(results, 1):
        name = result['stakeholder_name']
        scores = result['category_scores']
        total = result['total_score']
        presence = result['digital_presence']
        
        print(f"{i}. {name}")
        print(f"   Sector: {result['sector']} | Country: {result['country']}")
        print(f"   Total Score: {total}/60 ({result['percentage']}%) - {result['maturity_level']}")
        print(f"   Category Scores: SM={scores['social_media']}, Web={scores['website']}, Vis={scores['visual_content']}, Disc={scores['discoverability']}, Sales={scores['digital_sales']}, Plat={scores['platform_integration']}")
        print(f"   Discovered:")
        print(f"     Website: {presence.get('website') or 'NOT FOUND'}")
        print(f"     Facebook: {'✓' if presence.get('facebook') else '✗'}")
        print(f"     Instagram: {'✓' if presence.get('instagram') else '✗'}")
        print(f"     TripAdvisor: {'✓' if presence.get('tripadvisor') else '✗'}")
        print()

def get_review_feedback():
    """Get manual review feedback"""
    print("="*80)
    print("🔍 MANUAL REVIEW")
    print("="*80)
    print()
    print("Please review the above results in your Google Sheet:")
    print("  1. Check if websites are correct")
    print("  2. Check if social media accounts are correct")
    print("  3. Verify scores look reasonable")
    print()
    print("Options:")
    print("  'c' or 'continue' - Results look good, continue to next batch")
    print("  'r' or 'rerun' - Found issues, want to refine and re-run this batch")
    print("  'notes' - Add notes about issues found")
    print("  'stop' - Stop here, will resume from this point next time")
    print()
    
    while True:
        response = input("Your choice: ").strip().lower()
        
        if response in ['c', 'continue']:
            return 'continue', None
        elif response in ['r', 'rerun']:
            notes = input("What needs improvement? (brief notes): ").strip()
            return 'rerun', notes
        elif response == 'notes':
            notes = input("Notes about this batch: ").strip()
            print(f"✅ Notes recorded: {notes}")
            continue
        elif response == 'stop':
            return 'stop', None
        else:
            print("Invalid choice. Please enter 'continue', 'rerun', 'notes', or 'stop'")

def main():
    """Main staged batch processor"""
    
    print("="*80)
    print("STAGED REGIONAL COMPETITOR ANALYSIS")
    print("Batch size: 5 competitors per batch")
    print("="*80)
    print()
    
    # Load progress
    progress = load_progress()
    
    if progress['total_processed'] > 0:
        print(f"📊 Resuming from previous session")
        print(f"   Completed: {progress['total_processed']} competitors")
        print(f"   Current batch: {progress['current_batch'] + 1}")
        print()
    
    # Initialize analyzer
    analyzer = RegionalCompetitorAnalyzer(verbose=True)
    
    # Get all competitors
    all_competitors = analyzer.get_regional_assessment_data()
    print(f"📋 Found {len(all_competitors)} total competitors in Regional Assessment")
    print()
    
    # Filter out already completed
    remaining = [c for c in all_competitors if c['name'] not in progress['completed']]
    print(f"📌 {len(remaining)} competitors remaining to process")
    print()
    
    if len(remaining) == 0:
        print("✅ All competitors have been processed!")
        return
    
    # Ask which country/sector to focus on (optional filter)
    print("Filter options (optional):")
    filter_country = input("  Country (or press Enter for all): ").strip()
    filter_sector = input("  Sector (or press Enter for all): ").strip()
    print()
    
    if filter_country:
        remaining = [c for c in remaining if c['country'].lower() == filter_country.lower()]
        print(f"📍 Filtered to {len(remaining)} competitors in {filter_country}")
    
    if filter_sector:
        remaining = [c for c in remaining if filter_sector.lower() in c['sector'].lower()]
        print(f"🎯 Filtered to {len(remaining)} competitors in sector matching '{filter_sector}'")
    
    if len(remaining) == 0:
        print("❌ No competitors match your filters")
        return
    
    print()
    confirm = input(f"Ready to process {min(BATCH_SIZE, len(remaining))} competitors? (y/n): ").strip().lower()
    
    if confirm != 'y':
        print("❌ Cancelled")
        return
    
    # Process in batches of 5
    batch_num = progress['current_batch']
    
    while remaining:
        batch = remaining[:BATCH_SIZE]
        batch_num += 1
        
        print("\n" + "="*80)
        print(f"📦 BATCH {batch_num}: Processing {len(batch)} competitors")
        print("="*80)
        print()
        
        batch_results = []
        
        for i, comp in enumerate(batch, 1):
            print(f"\n[Batch {batch_num}, Item {i}/{len(batch)}]")
            
            try:
                # Analyze
                result = analyzer.analyze_competitor(
                    comp['name'],
                    comp['country'],
                    comp['sector']
                )
                
                # Save to sheets
                analyzer.save_to_checklist_detail(result)
                analyzer.save_to_sheet(result)
                
                batch_results.append(result)
                progress['completed'].append(comp['name'])
                progress['total_processed'] += 1
                
                # Save checkpoint after each competitor
                save_progress(progress)
                
            except Exception as e:
                print(f"❌ Error analyzing {comp['name']}: {e}")
                continue
        
        # Display results for manual review
        display_batch_results(batch_results)
        
        # Save batch results to file
        batch_file = f"regional_batch_{batch_num}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(batch_file, 'w') as f:
            json.dump(batch_results, f, indent=2)
        print(f"💾 Batch results saved to: {batch_file}")
        print()
        
        # Get review feedback
        action, notes = get_review_feedback()
        
        if action == 'stop':
            print("\n⏸️  Paused. Run this script again to resume from batch", batch_num + 1)
            save_progress(progress)
            return
        
        elif action == 'rerun':
            print(f"\n🔄 Improvement needed: {notes}")
            print("Next steps:")
            print("  1. Make adjustments to the analyzer code")
            print("  2. Re-run this script")
            print("  3. Select option to re-run this batch")
            print()
            
            # Save notes to progress
            if 'improvement_notes' not in progress:
                progress['improvement_notes'] = []
            progress['improvement_notes'].append({
                'batch': batch_num,
                'notes': notes,
                'timestamp': datetime.now().isoformat()
            })
            save_progress(progress)
            
            rerun = input("Re-run this batch now? (y/n): ").strip().lower()
            if rerun == 'y':
                # Reset completed for this batch
                for result in batch_results:
                    if result['stakeholder_name'] in progress['completed']:
                        progress['completed'].remove(result['stakeholder_name'])
                progress['total_processed'] -= len(batch_results)
                save_progress(progress)
                continue
            else:
                print("\n⏸️  Stopping. Re-run script when ready to retry this batch.")
                return
        
        elif action == 'continue':
            print("\n✅ Batch approved! Moving to next batch...")
            progress['current_batch'] = batch_num
            save_progress(progress)
            
            # Remove processed from remaining
            remaining = remaining[BATCH_SIZE:]
            
            if remaining:
                print(f"\n📊 {len(remaining)} competitors remaining")
                print()
                cont = input("Continue to next batch? (y/n): ").strip().lower()
                if cont != 'y':
                    print("\n⏸️  Paused. Run this script again to continue.")
                    return
            else:
                print("\n🎉 All filtered competitors processed!")
                return
    
    print("\n" + "="*80)
    print("🎉 ALL COMPETITORS PROCESSED!")
    print("="*80)
    print(f"Total processed: {progress['total_processed']}")
    print(f"Started: {progress['started_at']}")
    print(f"Completed: {datetime.now().isoformat()}")
    
    # Archive progress
    archive_file = f"regional_batch_complete_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(archive_file, 'w') as f:
        json.dump(progress, f, indent=2)
    
    print(f"\n📁 Progress archived to: {archive_file}")
    
    # Clean up progress file
    if os.path.exists(PROGRESS_FILE):
        os.remove(PROGRESS_FILE)

if __name__ == '__main__':
    main()

