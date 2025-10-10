#!/usr/bin/env python3
"""
Visual Content Analysis - ALL Entities
Processes all entities from Regional Assessment sheet
Saves results to Regional Checklist Detail after each entity
"""

import sys
sys.path.append('.')
from visual_analyzer_combined import CombinedVisualAnalyzer
import json
from datetime import datetime
import time

def main():
    print("="*80)
    print("VISUAL CONTENT ANALYSIS - ALL ENTITIES")
    print("Combined Approach: Instagram Stats + Website Images")
    print("="*80)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*80)
    
    analyzer = CombinedVisualAnalyzer()
    
    # Get all entities from the sheet
    print("\n📋 Fetching all entities from Regional Assessment...")
    from visual_analyzer_combined import SHEET_ID
    result = analyzer.sheets_service.spreadsheets().values().get(
        spreadsheetId=SHEET_ID,
        range='Regional Assessment!A:C'
    ).execute()
    
    rows = result.get('values', [])
    
    # Extract entity names (skip header)
    entities = []
    for i, row in enumerate(rows[1:], start=2):
        if row and len(row) > 0 and row[0].strip():
            entities.append({
                'name': row[0].strip(),
                'row': i
            })
    
    print(f"   Found {len(entities)} entities to analyze")
    
    # Track already completed (in case we need to resume)
    already_completed = set([
        "Burna Boy (artist)",
        "Adama Paris (Adama Amanda Ndiaye)",
        "Musée des Civilisations Noires",
        "Festival international de Jazz de Saint-Louis",
        "Galerie Cécile Fakhoury (Dakar)",
        "Village des Arts de Dakar",
        "Canal 3 Bénin",
        "Alliance Media Senegal",
        "Village artisanal de Soumbédioune",
        "RTS – Radio Télévision Sénégalaise",
    ])
    
    entities_to_process = [e for e in entities if e['name'] not in already_completed]
    
    print(f"   Already completed: {len(already_completed)}")
    print(f"   Remaining to process: {len(entities_to_process)}")
    
    if len(entities_to_process) == 0:
        print("\n✅ All entities already processed!")
        return
    
    # Confirm before proceeding
    print(f"\n{'='*80}")
    print(f"Ready to process {len(entities_to_process)} entities")
    print(f"Estimated time: ~{len(entities_to_process) * 0.5:.0f} minutes")
    print(f"Estimated cost: ~${len(entities_to_process) * 8 * 0.0015:.2f}")
    print(f"{'='*80}")
    
    # Process all entities
    results = []
    successful = 0
    failed = 0
    skipped = 0
    
    start_time = datetime.now()
    
    for i, entity_data in enumerate(entities_to_process, 1):
        entity_name = entity_data['name']
        
        print(f"\n{'#'*80}")
        print(f"ENTITY {i + len(already_completed)}/{len(entities)} ({i}/{len(entities_to_process)} remaining)")
        print(f"Progress: {((i + len(already_completed)) / len(entities) * 100):.1f}%")
        print(f"{'#'*80}")
        
        try:
            # Analyze
            result = analyzer.analyze_entity(entity_name)
            
            if result and 'criteria_scores' in result:
                # Save to sheet immediately
                success = analyzer.save_scores_to_sheet(entity_name, result['criteria_scores'])
                
                if success:
                    results.append(result)
                    successful += 1
                    print(f"✅ {entity_name}: {result['total_score']}/10 - Saved")
                else:
                    failed += 1
                    print(f"⚠️  {entity_name}: {result['total_score']}/10 - Analysis OK, Save Failed")
            else:
                skipped += 1
                print(f"⚠️  {entity_name}: Skipped (not found)")
        
        except Exception as e:
            failed += 1
            print(f"❌ Error on {entity_name}: {e}")
        
        # Progress update every 10 entities
        if i % 10 == 0:
            elapsed = (datetime.now() - start_time).total_seconds() / 60
            rate = i / elapsed if elapsed > 0 else 0
            remaining = (len(entities_to_process) - i) / rate if rate > 0 else 0
            
            print(f"\n{'='*80}")
            print(f"PROGRESS UPDATE")
            print(f"{'='*80}")
            print(f"   Processed: {i + len(already_completed)}/{len(entities)}")
            print(f"   Successful: {successful + len(already_completed)}")
            print(f"   Failed/Skipped: {failed + skipped}")
            print(f"   Elapsed time: {elapsed:.1f} minutes")
            print(f"   Rate: {rate:.1f} entities/minute")
            print(f"   Est. remaining: {remaining:.1f} minutes")
            print(f"{'='*80}\n")
        
        # Brief pause to avoid rate limiting
        time.sleep(2)
    
    # Final summary
    total_time = (datetime.now() - start_time).total_seconds() / 60
    
    print(f"\n\n{'='*80}")
    print("FINAL SUMMARY")
    print(f"{'='*80}")
    
    print(f"\n📊 Processing Results:")
    print(f"   Total entities in sheet: {len(entities)}")
    print(f"   Previously completed: {len(already_completed)}")
    print(f"   Newly processed: {len(entities_to_process)}")
    print(f"   Successful: {successful}")
    print(f"   Failed/Skipped: {failed + skipped}")
    print(f"   Total completed: {successful + len(already_completed)}")
    
    if results:
        scores = [r['total_score'] for r in results]
        print(f"\n📈 Score Statistics (newly processed):")
        print(f"   Range: {min(scores)}-{max(scores)}/10")
        print(f"   Average: {sum(scores)/len(scores):.1f}/10")
        
        # Score distribution
        score_counts = {}
        for score in scores:
            score_counts[score] = score_counts.get(score, 0) + 1
        
        print(f"\n   Distribution:")
        for score in sorted(score_counts.keys(), reverse=True):
            bar = "█" * score_counts[score]
            print(f"      {score}/10: {score_counts[score]:3d} {bar}")
    
    print(f"\n⏱️  Time Statistics:")
    print(f"   Total time: {total_time:.1f} minutes")
    print(f"   Average: {total_time/len(entities_to_process):.1f} min/entity")
    
    # Save comprehensive results
    output_file = f'visual_all_results_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
    with open(output_file, 'w') as f:
        json.dump({
            'completed_at': datetime.now().isoformat(),
            'total_entities': len(entities),
            'previously_completed': len(already_completed),
            'newly_processed': len(entities_to_process),
            'successful': successful,
            'failed': failed + skipped,
            'total_time_minutes': total_time,
            'results': results
        }, f, indent=2)
    
    print(f"\n📄 Results saved to: {output_file}")
    
    print(f"\n{'='*80}")
    print(f"Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*80}")
    
    print("\n✅ ANALYSIS COMPLETE!")
    print(f"   {successful + len(already_completed)}/{len(entities)} entities now have visual content scores")
    print(f"   Check Regional Assessment column AL for totals")
    print(f"   Check Regional Checklist Detail columns AB-AK for details")


if __name__ == '__main__':
    main()

