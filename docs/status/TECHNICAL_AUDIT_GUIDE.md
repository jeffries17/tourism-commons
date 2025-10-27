# Technical Performance Audit Guide

## Overview

This tool systematically audits all stakeholder websites from both **CI Assessment** and **TO Assessment** sheets, analyzing:

- ⚡ **Website Speed** - PageSpeed Insights scores for mobile and desktop
- 📱 **Mobile Responsiveness** - Viewport configuration, tap targets, mobile optimization
- 🔍 **SEO Technical Issues** - Meta tags, titles, structured data, crawlability
- 🔒 **Security** - HTTPS implementation, SSL certificates
- 🎯 **Priority Recommendations** - Categorized by severity and impact

## Requirements

### 1. Python Dependencies
```bash
pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client requests
```

### 2. Google PageSpeed Insights API Key (Optional but Recommended)

**Without API key:** Basic checks only (HTTPS, basic SEO, accessibility)  
**With API key:** Full analysis including performance metrics, detailed audits

#### Get Your Free API Key:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **PageSpeed Insights API**
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy your API key

#### Set the API Key:
```bash
# Temporary (current session)
export PAGESPEED_API_KEY='your_api_key_here'

# Permanent (add to ~/.zshrc or ~/.bashrc)
echo 'export PAGESPEED_API_KEY="your_api_key_here"' >> ~/.zshrc
source ~/.zshrc
```

## Running the Audit

### Quick Start
```bash
cd digital_assessment
python3 technical_audit.py
```

### With API Key
```bash
export PAGESPEED_API_KEY='your_key_here'
python3 technical_audit.py
```

## Output

### 1. JSON Report
Generated file: `technical_audit_report_YYYYMMDD_HHMMSS.json`

Contains complete details for each website:
```json
{
  "summary": {
    "total_audited": 50,
    "fully_analyzed": 45,
    "inaccessible": 5,
    "average_performance_score": 67.3,
    "average_seo_score": 78.5
  },
  "audits": [
    {
      "stakeholder": "African Adventure Tours",
      "website": "https://www.adventuregambia.com/",
      "mobile": {
        "scores": {
          "performance": 72,
          "accessibility": 89,
          "best_practices": 83,
          "seo": 92
        },
        "metrics": {
          "first_contentful_paint": 1800,
          "largest_contentful_paint": 3200,
          "total_blocking_time": 450,
          "cumulative_layout_shift": 0.12,
          "speed_index": 2900
        },
        "issues": [
          {
            "category": "Performance",
            "severity": "Medium",
            "issue": "Images not optimized (potential savings: 2.3s)",
            "recommendation": "Compress images and use modern formats (WebP, AVIF)"
          }
        ]
      },
      "recommendations": [
        {
          "priority": "HIGH",
          "fixes": [...],
          "impact": "Major impact on user experience and search rankings"
        }
      ]
    }
  ]
}
```

### 2. Console Summary
Real-time output showing:
- Progress through all websites
- Scores for each site
- Issue counts
- Overall statistics

### 3. Priority Recommendations

Issues are categorized by severity:

**🔴 CRITICAL** - Website unusable or severely broken
- Invalid SSL certificates
- Website completely inaccessible
- Major security vulnerabilities

**🟠 HIGH** - Major user experience or SEO impact
- Missing HTTPS
- No mobile viewport
- Missing page titles
- Performance score < 50

**🟡 MEDIUM** - Moderate improvements needed
- Missing meta descriptions
- Image optimization needed
- Tap targets too small

**🟢 LOW** - Nice-to-have optimizations
- Minor performance tweaks
- Accessibility improvements

## Understanding the Scores

### Performance Score (0-100)
- **90-100**: Excellent - Fast loading, well optimized
- **50-89**: Needs Improvement - Some optimization required
- **0-49**: Poor - Significant performance issues

**Key Metrics:**
- **Largest Contentful Paint (LCP)**: Main content load time
  - Good: < 2.5s
  - Needs Improvement: 2.5-4s
  - Poor: > 4s

- **Total Blocking Time (TBT)**: How long page is unresponsive
  - Good: < 200ms
  - Needs Improvement: 200-600ms
  - Poor: > 600ms

- **Cumulative Layout Shift (CLS)**: Visual stability
  - Good: < 0.1
  - Needs Improvement: 0.1-0.25
  - Poor: > 0.25

### SEO Score (0-100)
Checks for:
- Page title presence and quality
- Meta description
- Heading structure (H1, H2, etc.)
- Mobile-friendly configuration
- Crawlability (robots.txt, sitemap)
- Structured data

### Accessibility Score (0-100)
Evaluates:
- Color contrast
- Alt text on images
- ARIA labels
- Keyboard navigation
- Screen reader compatibility

### Best Practices Score (0-100)
Reviews:
- HTTPS usage
- Console errors
- Image aspect ratios
- Browser compatibility

## Common Issues & Quick Fixes

### 1. Missing Viewport Meta Tag
**Issue:** Site not mobile-responsive  
**Fix:** Add to `<head>` section:
```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

### 2. Missing Page Title
**Issue:** Poor SEO, no browser tab title  
**Fix:** Add descriptive title:
```html
<title>Business Name - Tour Operator in The Gambia</title>
```

### 3. Missing Meta Description
**Issue:** Poor search result appearance  
**Fix:** Add compelling description (150-160 chars):
```html
<meta name="description" content="Discover authentic Gambian experiences with [Business Name]. Cultural tours, wildlife safaris, and eco-tourism since 2010.">
```

### 4. Images Not Optimized
**Issue:** Slow loading times  
**Fixes:**
- Compress images (use TinyPNG, ImageOptim, or Squoosh)
- Resize large images (max 1920px width for web)
- Use modern formats (WebP instead of JPEG/PNG)
- Implement lazy loading:
```html
<img src="image.jpg" loading="lazy" alt="Description">
```

### 5. No HTTPS
**Issue:** Security warnings, poor SEO  
**Fix:** 
- Get free SSL from Let's Encrypt
- Or use Cloudflare for free SSL
- Redirect all HTTP to HTTPS

## Analyzing Results for Specific Stakeholder

After running the audit, you can search the JSON file:

```bash
# Pretty print specific stakeholder
cat technical_audit_report_*.json | jq '.audits[] | select(.stakeholder == "Senegambia Birding")'

# List all inaccessible sites
cat technical_audit_report_*.json | jq '.inaccessible_websites'

# Find sites with performance score < 50
cat technical_audit_report_*.json | jq '.audits[] | select(.mobile.scores.performance < 50) | {name: .stakeholder, score: .mobile.scores.performance}'
```

## Integration with Assessment Sheets

The audit results can inform the **Website Raw** scores in your assessments:

| Website Score | PageSpeed Performance | Description |
|---------------|----------------------|-------------|
| 9-10 | 90-100 | Excellent speed, all technical issues resolved |
| 7-8 | 70-89 | Good performance, minor optimizations needed |
| 5-6 | 50-69 | Moderate issues, needs improvement |
| 3-4 | 30-49 | Significant problems affecting usability |
| 0-2 | 0-29 or Inaccessible | Critical issues or website not working |

## Rate Limits

PageSpeed Insights API has rate limits:
- **Free tier**: 25,000 queries per day
- **Script automatically**: Adds 2-second delay between requests
- For large batches (>100 sites), consider running in batches

## Troubleshooting

### "No API key" Warning
**Solution:** Set the PAGESPEED_API_KEY environment variable (see Requirements section)

### "Request timeout" Errors
**Cause:** Website loading too slowly (>60 seconds)  
**Result:** Marked as performance issue in report

### "SSL certificate error"
**Cause:** Invalid or expired HTTPS certificate  
**Result:** Marked as critical security issue

### Rate Limit Exceeded
**Solution:** Wait a few minutes and run again, or reduce batch size

## Generating Recommendations Report

To create a stakeholder-friendly recommendations document:

```python
# Coming soon: recommendations_generator.py
# Will create PDF/Excel with prioritized recommendations per stakeholder
```

## Next Steps

1. **Run the audit** to get current baseline
2. **Review inaccessible sites** - These need immediate attention
3. **Identify quick wins** - Sites with 1-2 critical issues that are easy to fix
4. **Prioritize by business impact** - Tour operators may benefit more from website fixes than some CI sectors
5. **Track progress** - Re-run audit monthly to measure improvements

## Support

For issues or questions:
1. Check the JSON report for detailed error messages
2. Review the console output for specific failures
3. Verify API key is set correctly
4. Ensure internet connectivity for API calls

---

**Note:** This audit provides technical analysis. Human review is still needed for content quality, brand alignment, and business-specific recommendations.

