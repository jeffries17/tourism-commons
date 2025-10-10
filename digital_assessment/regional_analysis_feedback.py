#!/usr/bin/env python3
"""
Regional Analysis Feedback & Refinement System
Allows you to compare AI scores with manual review and iteratively improve accuracy
"""

import json
import os
from datetime import datetime
from typing import Dict, List
from collections import defaultdict

class FeedbackAnalyzer:
    """Analyze AI vs manual scores and suggest improvements"""
    
    def __init__(self):
        self.feedback_data = []
        self.patterns = defaultdict(list)
    
    def load_ai_results(self, json_file: str) -> List[Dict]:
        """Load AI-generated results from JSON"""
        with open(json_file, 'r') as f:
            data = json.load(f)
        
        # Handle both single result and array of results
        if isinstance(data, dict):
            return [data]
        return data
    
    def collect_manual_feedback(self, ai_result: Dict) -> Dict:
        """Interactively collect manual review scores"""
        
        print("\n" + "="*80)
        print(f"MANUAL REVIEW: {ai_result['stakeholder_name']}")
        print(f"Country: {ai_result['country']} | Sector: {ai_result['sector']}")
        print("="*80)
        
        print("\n📊 AI SCORES:")
        for cat, score in ai_result['category_scores'].items():
            reasoning = ai_result['detailed_analysis'].get(cat.replace('_', ' ').title(), {}).get('reasoning', '')
            print(f"  {cat:25} {score}/10")
            print(f"    Reasoning: {reasoning}")
        
        print("\n" + "-"*80)
        print("ENTER YOUR MANUAL SCORES (or press Enter to skip this competitor):")
        print("-"*80)
        
        manual_scores = {}
        categories = [
            ('social_media', 'Social Media'),
            ('website', 'Website'),
            ('visual_content', 'Visual Content'),
            ('discoverability', 'Discoverability'),
            ('digital_sales', 'Digital Sales'),
            ('platform_integration', 'Platform Integration')
        ]
        
        skip = False
        for key, display_name in categories:
            ai_score = ai_result['category_scores'][key]
            
            while True:
                manual_input = input(f"  {display_name:25} (AI: {ai_score}/10) → Your score (0-10, or Enter to skip): ").strip()
                
                if manual_input == '':
                    print("  Skipping this competitor...")
                    skip = True
                    break
                
                try:
                    manual_score = int(manual_input)
                    if 0 <= manual_score <= 10:
                        manual_scores[key] = manual_score
                        
                        # Show difference
                        diff = manual_score - ai_score
                        if diff > 0:
                            print(f"    ↑ AI under-scored by {diff}")
                        elif diff < 0:
                            print(f"    ↓ AI over-scored by {abs(diff)}")
                        else:
                            print(f"    ✓ Exact match!")
                        break
                    else:
                        print("    Please enter 0-10")
                except ValueError:
                    print("    Please enter a number 0-10")
        
        if skip:
            return None
        
        # Ask for notes
        print("\n" + "-"*80)
        notes = input("Any notes on what the AI got wrong? (optional): ").strip()
        
        feedback = {
            'stakeholder_name': ai_result['stakeholder_name'],
            'country': ai_result['country'],
            'sector': ai_result['sector'],
            'ai_scores': ai_result['category_scores'],
            'manual_scores': manual_scores,
            'differences': {k: manual_scores[k] - ai_result['category_scores'][k] 
                           for k in manual_scores},
            'notes': notes,
            'timestamp': datetime.now().isoformat()
        }
        
        return feedback
    
    def analyze_patterns(self, feedback_list: List[Dict]):
        """Analyze patterns in AI vs manual differences"""
        
        print("\n" + "="*80)
        print("PATTERN ANALYSIS")
        print("="*80)
        
        # Category-level analysis
        category_errors = defaultdict(list)
        
        for feedback in feedback_list:
            for cat, diff in feedback['differences'].items():
                category_errors[cat].append(diff)
        
        print("\n📊 CATEGORY ACCURACY:")
        print("-"*80)
        
        for cat in ['social_media', 'website', 'visual_content', 'discoverability', 'digital_sales', 'platform_integration']:
            if cat in category_errors:
                errors = category_errors[cat]
                avg_error = sum(errors) / len(errors)
                abs_errors = [abs(e) for e in errors]
                avg_abs_error = sum(abs_errors) / len(abs_errors)
                
                over_scored = sum(1 for e in errors if e < 0)
                under_scored = sum(1 for e in errors if e > 0)
                exact = sum(1 for e in errors if e == 0)
                
                display_name = cat.replace('_', ' ').title()
                
                print(f"\n{display_name}:")
                print(f"  Average error: {avg_error:+.2f} points")
                print(f"  Average absolute error: {avg_abs_error:.2f} points")
                print(f"  Over-scored: {over_scored}/{len(errors)} ({over_scored/len(errors)*100:.0f}%)")
                print(f"  Under-scored: {under_scored}/{len(errors)} ({under_scored/len(errors)*100:.0f}%)")
                print(f"  Exact matches: {exact}/{len(errors)} ({exact/len(errors)*100:.0f}%)")
                
                # Diagnosis
                if avg_error > 1:
                    print(f"  ⚠️  BIAS: AI tends to UNDER-score by ~{avg_error:.1f} points")
                    print(f"      → Suggestion: Make AI more generous / lower evidence threshold")
                elif avg_error < -1:
                    print(f"  ⚠️  BIAS: AI tends to OVER-score by ~{abs(avg_error):.1f} points")
                    print(f"      → Suggestion: Make AI more conservative / raise evidence threshold")
                elif avg_abs_error > 1.5:
                    print(f"  ⚠️  INCONSISTENT: High variation in errors")
                    print(f"      → Suggestion: Clarify scoring criteria in prompts")
                else:
                    print(f"  ✅ GOOD: Relatively accurate")
        
        # Sector analysis
        print("\n\n📊 SECTOR ACCURACY:")
        print("-"*80)
        
        sector_errors = defaultdict(list)
        for feedback in feedback_list:
            for cat, diff in feedback['differences'].items():
                sector_errors[feedback['sector']].append(diff)
        
        for sector, errors in sector_errors.items():
            if len(errors) >= 3:  # Only show if 3+ samples
                avg_error = sum(errors) / len(errors)
                print(f"\n{sector}:")
                print(f"  Samples: {len(errors)//6}")  # 6 categories per sample
                print(f"  Average error: {avg_error:+.2f} points")
                
                if abs(avg_error) > 1:
                    if avg_error > 0:
                        print(f"  ⚠️  AI under-scores {sector} businesses")
                    else:
                        print(f"  ⚠️  AI over-scores {sector} businesses")
        
        # Country analysis
        print("\n\n📊 COUNTRY ACCURACY:")
        print("-"*80)
        
        country_errors = defaultdict(list)
        for feedback in feedback_list:
            for cat, diff in feedback['differences'].items():
                country_errors[feedback['country']].append(diff)
        
        for country, errors in country_errors.items():
            if len(errors) >= 3:
                avg_error = sum(errors) / len(errors)
                print(f"\n{country}:")
                print(f"  Samples: {len(errors)//6}")
                print(f"  Average error: {avg_error:+.2f} points")
                
                if abs(avg_error) > 1:
                    if avg_error > 0:
                        print(f"  ⚠️  AI under-scores {country} businesses")
                        print(f"      → Possible cause: Less discoverable online")
                    else:
                        print(f"  ⚠️  AI over-scores {country} businesses")
        
        # Overall accuracy
        print("\n\n📊 OVERALL ACCURACY:")
        print("-"*80)
        
        all_errors = []
        all_abs_errors = []
        exact_matches = 0
        total_scores = 0
        
        for feedback in feedback_list:
            for diff in feedback['differences'].values():
                all_errors.append(diff)
                all_abs_errors.append(abs(diff))
                if diff == 0:
                    exact_matches += 1
                total_scores += 1
        
        avg_error = sum(all_errors) / len(all_errors)
        avg_abs_error = sum(all_abs_errors) / len(all_abs_errors)
        accuracy = (1 - (avg_abs_error / 10)) * 100
        
        print(f"\nTotal assessments reviewed: {len(feedback_list)}")
        print(f"Total scores compared: {total_scores}")
        print(f"\nAverage error: {avg_error:+.2f} points")
        print(f"Average absolute error: {avg_abs_error:.2f} points")
        print(f"Exact matches: {exact_matches}/{total_scores} ({exact_matches/total_scores*100:.1f}%)")
        print(f"\n🎯 OVERALL ACCURACY: {accuracy:.1f}%")
        
        if accuracy >= 85:
            print("✅ EXCELLENT - Ready for production")
        elif accuracy >= 75:
            print("✅ GOOD - Minor refinements recommended")
        elif accuracy >= 65:
            print("⚠️  MODERATE - Refinement needed before scaling")
        else:
            print("❌ LOW - Significant improvements needed")
    
    def generate_prompt_improvements(self, feedback_list: List[Dict]) -> str:
        """Generate specific prompt improvements based on patterns"""
        
        category_errors = defaultdict(list)
        for feedback in feedback_list:
            for cat, diff in feedback['differences'].items():
                category_errors[cat].append(diff)
        
        improvements = []
        
        print("\n" + "="*80)
        print("RECOMMENDED PROMPT IMPROVEMENTS")
        print("="*80)
        
        for cat, errors in category_errors.items():
            avg_error = sum(errors) / len(errors)
            display_name = cat.replace('_', ' ').title()
            
            if avg_error > 1:
                suggestion = f"""
{display_name}:
  Issue: AI under-scores by ~{avg_error:.1f} points
  Fix: Reduce evidence requirements. Change prompt to:
       "Award 1 point if there is ANY indication of this criterion, 
        even if not fully confirmed. Be generous with partial evidence."
"""
                improvements.append(suggestion)
                print(suggestion)
                
            elif avg_error < -1:
                suggestion = f"""
{display_name}:
  Issue: AI over-scores by ~{abs(avg_error):.1f} points
  Fix: Increase evidence requirements. Change prompt to:
       "Only award 1 point if there is CLEAR, DIRECT evidence of this criterion.
        Be conservative - when in doubt, score 0."
"""
                improvements.append(suggestion)
                print(suggestion)
        
        if not improvements:
            print("\n✅ No major systematic biases detected!")
            print("   Current prompts appear well-calibrated.")
        
        return '\n'.join(improvements)
    
    def save_feedback(self, feedback_list: List[Dict], filename: str = None):
        """Save feedback data for future reference"""
        
        if not filename:
            filename = f"feedback_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        with open(filename, 'w') as f:
            json.dump(feedback_list, f, indent=2)
        
        print(f"\n💾 Feedback saved to: {filename}")


def main():
    """Main feedback collection workflow"""
    
    print("="*80)
    print("REGIONAL ANALYSIS FEEDBACK SYSTEM")
    print("Compare AI scores with manual review to improve accuracy")
    print("="*80)
    
    analyzer = FeedbackAnalyzer()
    
    # Ask for AI results file
    print("\n📁 Enter the path to your AI results JSON file:")
    print("   (e.g., regional_analysis_checkpoint_10.json)")
    json_file = input("\nFile path: ").strip()
    
    if not os.path.exists(json_file):
        print(f"❌ File not found: {json_file}")
        return
    
    # Load results
    ai_results = analyzer.load_ai_results(json_file)
    print(f"\n✅ Loaded {len(ai_results)} AI assessments")
    
    # Ask how many to review
    print(f"\nHow many would you like to review?")
    print(f"  (Recommend: 10-20 for good pattern detection)")
    
    num_to_review = input(f"\nNumber to review (1-{len(ai_results)}): ").strip()
    try:
        num_to_review = int(num_to_review)
        num_to_review = min(num_to_review, len(ai_results))
    except ValueError:
        print("Invalid number, reviewing first 10")
        num_to_review = min(10, len(ai_results))
    
    # Collect feedback
    feedback_list = []
    
    for i, ai_result in enumerate(ai_results[:num_to_review], 1):
        print(f"\n\n[{i}/{num_to_review}]")
        feedback = analyzer.collect_manual_feedback(ai_result)
        
        if feedback:
            feedback_list.append(feedback)
        
        # Option to stop early
        if i < num_to_review:
            continue_review = input("\nContinue to next? (y/n): ").strip().lower()
            if continue_review != 'y':
                break
    
    if not feedback_list:
        print("\n❌ No feedback collected")
        return
    
    # Save feedback
    analyzer.save_feedback(feedback_list)
    
    # Analyze patterns
    analyzer.analyze_patterns(feedback_list)
    
    # Generate improvements
    analyzer.generate_prompt_improvements(feedback_list)
    
    print("\n" + "="*80)
    print("NEXT STEPS:")
    print("="*80)
    print("""
1. Review the pattern analysis above
2. Note which categories need improvement
3. Apply suggested prompt changes to regional_competitor_analyzer.py
4. Re-run analysis on same sample
5. Compare new accuracy
6. Iterate until 85%+ accuracy
7. Scale to full dataset

TIP: Focus on fixing the biggest biases first (avg error > 1.5 points)
""")


if __name__ == '__main__':
    main()

