#!/usr/bin/env python3
"""
Technical Performance Audit for Stakeholder Websites
Systematically analyzes websites from CI Assessment and TO Assessment for:
- Website Speed (PageSpeed Insights scores)
- Mobile Responsiveness
- SEO Technical Issues
- Priority Fix Recommendations
"""

import json
import os
import time
from datetime import datetime
from typing import Dict, List, Any, Optional
import requests
from google.oauth2 import service_account
from googleapiclient.discovery import build

# Configuration
SHEET_ID = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
CREDS_FILE = '../tourism-development-d620c-5c9db9e21301.json'
PAGESPEED_API_KEY = os.getenv('PAGESPEED_API_KEY', '')
USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'

def get_sheets_service():
    """Initialize Google Sheets API service"""
    with open(CREDS_FILE, 'r') as f:
        creds_dict = json.load(f)
    
    credentials = service_account.Credentials.from_service_account_info(
        creds_dict,
        scopes=['https://www.googleapis.com/auth/spreadsheets']
    )
    return build('sheets', 'v4', credentials=credentials)

def extract_stakeholders_with_websites(service) -> List[Dict[str, Any]]:
    """Extract all stakeholders that have websites from both assessments"""
    stakeholders = []
    
    # CI Assessment
    print("📊 Reading CI Assessment...")
    ci_result = service.spreadsheets().values().get(
        spreadsheetId=SHEET_ID,
        range='CI Assessment!A2:AL600'
    ).execute()
    
    ci_rows = ci_result.get('values', [])
    for i, row in enumerate(ci_rows, start=2):
        if row and len(row) > 0 and row[0].strip():
            name = row[0].strip()
            website = row[29].strip() if len(row) > 29 and row[29] else ''  # Column AD
            
            # Clean and validate website URL
            if website and website not in ['', '0', 'N/A', 'n/a', 'None']:
                # Ensure URL has protocol
                if not website.startswith('http'):
                    website = 'https://' + website
                
                stakeholders.append({
                    'name': name,
                    'sector': row[1] if len(row) > 1 else 'Unknown',
                    'assessment_type': 'Creative Industries',
                    'website': website,
                    'row_number': i,
                    'sheet': 'CI Assessment'
                })
    
    print(f"   Found {len(stakeholders)} CI stakeholders with websites")
    
    # TO Assessment
    print("📊 Reading TO Assessment...")
    to_result = service.spreadsheets().values().get(
        spreadsheetId=SHEET_ID,
        range='TO Assessment!A2:AL50'
    ).execute()
    
    to_rows = to_result.get('values', [])
    ci_count = len(stakeholders)
    for i, row in enumerate(to_rows, start=2):
        if row and len(row) > 0 and row[0].strip():
            name = row[0].strip()
            website = row[29].strip() if len(row) > 29 and row[29] else ''  # Column AD
            
            # Clean and validate website URL
            if website and website not in ['', '0', 'N/A', 'n/a', 'None']:
                # Ensure URL has protocol
                if not website.startswith('http'):
                    website = 'https://' + website
                
                stakeholders.append({
                    'name': name,
                    'sector': row[1] if len(row) > 1 else 'Tour Operator',
                    'assessment_type': 'Tour Operators',
                    'website': website,
                    'row_number': i,
                    'sheet': 'TO Assessment'
                })
    
    print(f"   Found {len(stakeholders) - ci_count} TO stakeholders with websites")
    print(f"✅ Total: {len(stakeholders)} stakeholders with websites to audit\n")
    
    return stakeholders

def run_pagespeed_insights(url: str, strategy: str = "mobile") -> Dict[str, Any]:
    """Run PageSpeed Insights API analysis"""
    if not PAGESPEED_API_KEY:
        print("⚠️  Warning: PAGESPEED_API_KEY not set. Using basic analysis only.")
        return {'error': 'No API key', 'basic_check': True}
    
    try:
        api_url = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"
        params = {
            'url': url,
            'strategy': strategy,
            'key': PAGESPEED_API_KEY,
            'category': ['performance', 'accessibility', 'best-practices', 'seo']
        }
        
        response = requests.get(api_url, params=params, timeout=60)
        
        if response.status_code == 200:
            return response.json()
        else:
            return {'error': f'API returned {response.status_code}', 'message': response.text[:200]}
    
    except requests.exceptions.Timeout:
        return {'error': 'Request timeout', 'message': 'PageSpeed API request timed out'}
    except Exception as e:
        return {'error': str(e)}

def analyze_pagespeed_results(psi_data: Dict[str, Any]) -> Dict[str, Any]:
    """Extract key metrics from PageSpeed Insights results"""
    if 'error' in psi_data:
        return {
            'error': psi_data.get('error'),
            'scores': {},
            'metrics': {},
            'issues': []
        }
    
    try:
        lighthouse = psi_data.get('lighthouseResult', {})
        categories = lighthouse.get('categories', {})
        audits = lighthouse.get('audits', {})
        
        # Extract category scores (0-100)
        scores = {
            'performance': int(categories.get('performance', {}).get('score', 0) * 100),
            'accessibility': int(categories.get('accessibility', {}).get('score', 0) * 100),
            'best_practices': int(categories.get('best-practices', {}).get('score', 0) * 100),
            'seo': int(categories.get('seo', {}).get('score', 0) * 100)
        }
        
        # Extract key metrics
        metrics = {}
        if 'metrics' in audits:
            metric_items = audits['metrics'].get('details', {}).get('items', [{}])[0]
            metrics = {
                'first_contentful_paint': metric_items.get('firstContentfulPaint', 0),
                'largest_contentful_paint': metric_items.get('largestContentfulPaint', 0),
                'total_blocking_time': metric_items.get('totalBlockingTime', 0),
                'cumulative_layout_shift': metric_items.get('cumulativeLayoutShift', 0),
                'speed_index': metric_items.get('speedIndex', 0)
            }
        
        # Identify critical issues
        issues = []
        
        # Mobile responsiveness
        if 'viewport' in audits and audits['viewport'].get('score', 1) < 1:
            issues.append({
                'category': 'Mobile Responsiveness',
                'severity': 'High',
                'issue': 'Missing or invalid viewport meta tag',
                'recommendation': 'Add <meta name="viewport" content="width=device-width, initial-scale=1">'
            })
        
        # Image optimization
        if 'uses-optimized-images' in audits and audits['uses-optimized-images'].get('score', 1) < 0.9:
            savings_ms = audits['uses-optimized-images'].get('details', {}).get('overallSavingsMs', 0)
            if savings_ms > 1000:
                issues.append({
                    'category': 'Performance',
                    'severity': 'Medium',
                    'issue': f'Images not optimized (potential savings: {savings_ms/1000:.1f}s)',
                    'recommendation': 'Compress images and use modern formats (WebP, AVIF)'
                })
        
        # SEO issues
        if 'document-title' in audits and audits['document-title'].get('score', 1) < 1:
            issues.append({
                'category': 'SEO',
                'severity': 'High',
                'issue': 'Missing or empty page title',
                'recommendation': 'Add descriptive <title> tag with business name and key services'
            })
        
        if 'meta-description' in audits and audits['meta-description'].get('score', 1) < 1:
            issues.append({
                'category': 'SEO',
                'severity': 'Medium',
                'issue': 'Missing or empty meta description',
                'recommendation': 'Add compelling meta description (150-160 characters)'
            })
        
        # HTTPS
        if 'is-on-https' in audits and audits['is-on-https'].get('score', 1) < 1:
            issues.append({
                'category': 'Security',
                'severity': 'High',
                'issue': 'Website not using HTTPS',
                'recommendation': 'Install SSL certificate and redirect HTTP to HTTPS'
            })
        
        # Mobile tap targets
        if 'tap-targets' in audits and audits['tap-targets'].get('score', 1) < 0.9:
            issues.append({
                'category': 'Mobile Responsiveness',
                'severity': 'Medium',
                'issue': 'Tap targets too small or too close together',
                'recommendation': 'Ensure buttons and links are at least 48x48px with adequate spacing'
            })
        
        return {
            'scores': scores,
            'metrics': metrics,
            'issues': issues
        }
    
    except Exception as e:
        return {
            'error': f'Failed to parse results: {str(e)}',
            'scores': {},
            'metrics': {},
            'issues': []
        }

def basic_website_check(url: str) -> Dict[str, Any]:
    """Basic website accessibility check when API is not available"""
    try:
        response = requests.get(url, headers={'User-Agent': USER_AGENT}, timeout=15)
        
        # Basic checks
        is_https = url.startswith('https://')
        has_title = '<title>' in response.text.lower()
        has_meta_desc = 'meta name="description"' in response.text.lower()
        has_viewport = 'viewport' in response.text.lower()
        
        issues = []
        if not is_https:
            issues.append({
                'category': 'Security',
                'severity': 'High',
                'issue': 'Website not using HTTPS',
                'recommendation': 'Install SSL certificate'
            })
        
        if not has_title:
            issues.append({
                'category': 'SEO',
                'severity': 'High',
                'issue': 'Missing page title',
                'recommendation': 'Add <title> tag'
            })
        
        if not has_meta_desc:
            issues.append({
                'category': 'SEO',
                'severity': 'Medium',
                'issue': 'Missing meta description',
                'recommendation': 'Add meta description tag'
            })
        
        if not has_viewport:
            issues.append({
                'category': 'Mobile Responsiveness',
                'severity': 'High',
                'issue': 'Missing viewport meta tag',
                'recommendation': 'Add viewport meta tag for mobile'
            })
        
        return {
            'accessible': True,
            'status_code': response.status_code,
            'is_https': is_https,
            'has_basic_seo': has_title and has_meta_desc,
            'issues': issues
        }
    
    except requests.exceptions.SSLError:
        return {
            'accessible': False,
            'error': 'SSL certificate error',
            'issues': [{
                'category': 'Security',
                'severity': 'Critical',
                'issue': 'Invalid or expired SSL certificate',
                'recommendation': 'Fix SSL certificate configuration'
            }]
        }
    except requests.exceptions.Timeout:
        return {
            'accessible': False,
            'error': 'Request timeout',
            'issues': [{
                'category': 'Performance',
                'severity': 'High',
                'issue': 'Website loading timeout (>15s)',
                'recommendation': 'Optimize server response time and reduce page size'
            }]
        }
    except Exception as e:
        return {
            'accessible': False,
            'error': str(e),
            'issues': [{
                'category': 'Accessibility',
                'severity': 'Critical',
                'issue': f'Website not accessible: {str(e)}',
                'recommendation': 'Check domain configuration and hosting'
            }]
        }

def prioritize_recommendations(analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Prioritize fix recommendations based on impact and difficulty"""
    issues = analysis.get('issues', [])
    scores = analysis.get('scores', {})
    
    # Categorize by severity
    critical = [i for i in issues if i.get('severity') == 'Critical']
    high = [i for i in issues if i.get('severity') == 'High']
    medium = [i for i in issues if i.get('severity') == 'Medium']
    low = [i for i in issues if i.get('severity') == 'Low']
    
    # Add score-based recommendations
    if scores.get('performance', 100) < 50:
        high.append({
            'category': 'Performance',
            'severity': 'High',
            'issue': f'Poor performance score ({scores["performance"]}/100)',
            'recommendation': 'Optimize images, enable caching, minify CSS/JS, use CDN'
        })
    
    if scores.get('seo', 100) < 70:
        medium.append({
            'category': 'SEO',
            'severity': 'Medium',
            'issue': f'SEO score needs improvement ({scores["seo"]}/100)',
            'recommendation': 'Improve meta tags, heading structure, and content quality'
        })
    
    # Compile prioritized list
    prioritized = []
    
    if critical:
        prioritized.append({
            'priority': 'CRITICAL',
            'fixes': critical,
            'impact': 'Website may be inaccessible or severely broken'
        })
    
    if high:
        prioritized.append({
            'priority': 'HIGH',
            'fixes': high,
            'impact': 'Major impact on user experience and search rankings'
        })
    
    if medium:
        prioritized.append({
            'priority': 'MEDIUM',
            'fixes': medium,
            'impact': 'Moderate improvements to performance and SEO'
        })
    
    if low:
        prioritized.append({
            'priority': 'LOW',
            'fixes': low,
            'impact': 'Minor optimizations for better user experience'
        })
    
    return prioritized

def audit_stakeholder(stakeholder: Dict[str, Any], use_api: bool = True) -> Dict[str, Any]:
    """Run complete technical audit on a single stakeholder's website"""
    url = stakeholder['website']
    name = stakeholder['name']
    
    print(f"🔍 Auditing: {name}")
    print(f"   URL: {url}")
    
    audit_result = {
        'stakeholder': name,
        'sector': stakeholder['sector'],
        'assessment_type': stakeholder['assessment_type'],
        'website': url,
        'timestamp': datetime.now().isoformat()
    }
    
    # Basic check first
    basic_check = basic_website_check(url)
    audit_result['basic_check'] = basic_check
    
    if not basic_check.get('accessible', False):
        print(f"   ❌ Website not accessible: {basic_check.get('error')}\n")
        audit_result['status'] = 'inaccessible'
        audit_result['issues'] = basic_check.get('issues', [])
        audit_result['recommendations'] = prioritize_recommendations(audit_result)
        return audit_result
    
    # Run PageSpeed Insights if API key available
    if use_api and PAGESPEED_API_KEY:
        print(f"   ⏳ Running PageSpeed Insights (mobile)...")
        mobile_results = run_pagespeed_insights(url, strategy='mobile')
        time.sleep(2)  # Rate limiting
        
        print(f"   ⏳ Running PageSpeed Insights (desktop)...")
        desktop_results = run_pagespeed_insights(url, strategy='desktop')
        time.sleep(2)  # Rate limiting
        
        audit_result['mobile'] = analyze_pagespeed_results(mobile_results)
        audit_result['desktop'] = analyze_pagespeed_results(desktop_results)
        
        # Combine issues from both
        all_issues = basic_check.get('issues', [])
        all_issues.extend(audit_result['mobile'].get('issues', []))
        
        audit_result['status'] = 'complete'
        
        # Print scores
        if 'scores' in audit_result['mobile']:
            scores = audit_result['mobile']['scores']
            print(f"   📊 Scores (Mobile):")
            print(f"      Performance: {scores.get('performance', 'N/A')}/100")
            print(f"      Accessibility: {scores.get('accessibility', 'N/A')}/100")
            print(f"      Best Practices: {scores.get('best_practices', 'N/A')}/100")
            print(f"      SEO: {scores.get('seo', 'N/A')}/100")
    else:
        # Use basic check only
        audit_result['status'] = 'basic_only'
        all_issues = basic_check.get('issues', [])
        print(f"   ✓ Basic check complete")
    
    # Deduplicate issues
    seen = set()
    unique_issues = []
    for issue in all_issues:
        key = (issue['category'], issue['issue'])
        if key not in seen:
            seen.add(key)
            unique_issues.append(issue)
    
    audit_result['issues'] = unique_issues
    audit_result['recommendations'] = prioritize_recommendations(audit_result)
    
    print(f"   ⚠️  Found {len(unique_issues)} issues\n")
    
    return audit_result

def generate_audit_report(results: List[Dict[str, Any]], output_file: str):
    """Generate comprehensive audit report"""
    
    # Separate by status
    complete_audits = [r for r in results if r.get('status') == 'complete']
    basic_audits = [r for r in results if r.get('status') == 'basic_only']
    inaccessible = [r for r in results if r.get('status') == 'inaccessible']
    
    # Generate summary statistics
    summary = {
        'total_audited': len(results),
        'fully_analyzed': len(complete_audits),
        'basic_check_only': len(basic_audits),
        'inaccessible': len(inaccessible),
        'generated_at': datetime.now().isoformat()
    }
    
    # Calculate average scores for those with full analysis
    if complete_audits:
        perf_scores = [r['mobile']['scores'].get('performance', 0) for r in complete_audits if 'mobile' in r and 'scores' in r['mobile']]
        seo_scores = [r['mobile']['scores'].get('seo', 0) for r in complete_audits if 'mobile' in r and 'scores' in r['mobile']]
        
        if perf_scores:
            summary['average_performance_score'] = sum(perf_scores) / len(perf_scores)
        if seo_scores:
            summary['average_seo_score'] = sum(seo_scores) / len(seo_scores)
    
    # Compile report
    report = {
        'summary': summary,
        'audits': results,
        'inaccessible_websites': [
            {
                'name': r['stakeholder'],
                'url': r['website'],
                'error': r['basic_check'].get('error', 'Unknown')
            }
            for r in inaccessible
        ]
    }
    
    # Save to JSON
    with open(output_file, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\n✅ Audit report saved to: {output_file}")
    return report

def print_summary_report(report: Dict[str, Any]):
    """Print human-readable summary of audit results"""
    summary = report['summary']
    
    print("\n" + "="*80)
    print("TECHNICAL AUDIT SUMMARY")
    print("="*80)
    print(f"\n📊 Overview:")
    print(f"   Total websites audited: {summary['total_audited']}")
    print(f"   Fully analyzed (PageSpeed): {summary['fully_analyzed']}")
    print(f"   Basic checks only: {summary['basic_check_only']}")
    print(f"   Inaccessible: {summary['inaccessible']}")
    
    if 'average_performance_score' in summary:
        print(f"\n⚡ Average Performance Score: {summary['average_performance_score']:.1f}/100")
    if 'average_seo_score' in summary:
        print(f"🔍 Average SEO Score: {summary['average_seo_score']:.1f}/100")
    
    # Top issues across all sites
    all_issues = []
    for audit in report['audits']:
        all_issues.extend(audit.get('issues', []))
    
    if all_issues:
        issue_counts = {}
        for issue in all_issues:
            key = issue['issue']
            issue_counts[key] = issue_counts.get(key, 0) + 1
        
        print(f"\n⚠️  Most Common Issues:")
        for issue, count in sorted(issue_counts.items(), key=lambda x: x[1], reverse=True)[:5]:
            print(f"   • {issue} ({count} sites)")
    
    # Inaccessible websites
    if report['inaccessible_websites']:
        print(f"\n❌ Inaccessible Websites ({len(report['inaccessible_websites'])}):")
        for site in report['inaccessible_websites'][:10]:
            print(f"   • {site['name']}: {site['error']}")
    
    print("\n" + "="*80)

def main():
    """Main execution function"""
    print("="*80)
    print("TECHNICAL PERFORMANCE AUDIT")
    print("Analyzing stakeholder websites from CI & TO Assessments")
    print("="*80 + "\n")
    
    # Check for API key
    if not PAGESPEED_API_KEY:
        print("⚠️  WARNING: PAGESPEED_API_KEY environment variable not set.")
        print("   Running basic checks only. For full analysis, set the API key:")
        print("   export PAGESPEED_API_KEY='your_key_here'\n")
        use_api = False
    else:
        print("✓ PageSpeed Insights API key found\n")
        use_api = True
    
    # Get stakeholders
    service = get_sheets_service()
    stakeholders = extract_stakeholders_with_websites(service)
    
    if not stakeholders:
        print("❌ No stakeholders with websites found")
        return
    
    # Run audits
    print(f"Starting audit of {len(stakeholders)} websites...\n")
    results = []
    
    for i, stakeholder in enumerate(stakeholders, 1):
        print(f"[{i}/{len(stakeholders)}]", end=" ")
        try:
            result = audit_stakeholder(stakeholder, use_api=use_api)
            results.append(result)
        except Exception as e:
            print(f"   ❌ Error auditing {stakeholder['name']}: {str(e)}\n")
            results.append({
                'stakeholder': stakeholder['name'],
                'website': stakeholder['website'],
                'status': 'error',
                'error': str(e)
            })
    
    # Generate report
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    output_file = f'technical_audit_report_{timestamp}.json'
    report = generate_audit_report(results, output_file)
    
    # Print summary
    print_summary_report(report)
    
    print(f"\n📄 Full detailed report available in: {output_file}")
    print("   This includes:")
    print("   • PageSpeed Insights scores (Performance, SEO, Accessibility, Best Practices)")
    print("   • Mobile responsiveness analysis")
    print("   • SEO technical issues inventory")
    print("   • Prioritized fix recommendations by stakeholder")

if __name__ == '__main__':
    main()

