# 🎯 Interactive Assessment Dashboard

## 🚀 Quick Start

The dashboard is now running! Access it at: **http://localhost:8080**

## ✨ Features

### 📊 Dashboard Overview
- **Visual Grid**: See all stakeholders in an easy-to-scan grid
- **Smart Filtering**: Filter by sector, score range, or search by name
- **Real-time Stats**: See high/medium/low performers at a glance
- **Progress Tracking**: Visual progress bars for each stakeholder

### 🔍 Individual Assessment
- **Click "Assess"** on any stakeholder card
- **See All Links**: Facebook, Instagram, YouTube, TripAdvisor, Website
- **Interactive Checkboxes**: Click to score each criterion
- **Clear Descriptions**: Every criterion has a helpful description
- **Real-time Updates**: Scores update as you check boxes
- **Auto-save**: Click "Save [Category]" to update Google Sheets

## 📋 Assessment Categories

### 1. **Social Media Presence** (SM1-SM10)
- Primary/Secondary/Tertiary platforms
- Regular posting, quality content
- Visual content, engagement
- Business info, call-to-action

### 2. **Website Quality** (WEB1-WEB10)
- Exists & loads, mobile-friendly
- Services described, contact visible
- Contact forms, recently updated
- Modern design, social links

### 3. **Visual Content Quality** (VIS1-VIS10)
- High quality photos, variety
- Recent photos, brand consistency
- Product showcase, professional lighting
- Video content, user-generated content

### 4. **Online Discoverability** (DIS1-DIS10)
- Google search results, GMB listing
- Directory listings, first page results
- GMB photos, multiple directories
- Positive reviews, review response

### 5. **Digital Sales Capability** (DIG1-DIG10)
- Online booking, payment processing
- Product catalog, pricing information
- Booking calendar, customer accounts
- Order tracking, email marketing

### 6. **Platform Integration** (PLAT1-PLAT10)
- Booking platforms, TripAdvisor
- Tourism websites, travel agencies
- Hotel partnerships, event platforms
- Social commerce, API integration

## 🎯 How to Use

1. **Browse Stakeholders**: Use filters to find specific groups
2. **Click "Assess"**: Open individual assessment page
3. **Check Links**: Review their social media and website links
4. **Score Criteria**: Check boxes for criteria they meet
5. **Save Changes**: Click "Save [Category]" to update Google Sheets
6. **Move to Next**: Use "Back to Dashboard" to continue

## 🔄 Data Flow

- **Reads from**: CI Assessment, TO Assessment, Checklist Detail sheets
- **Updates**: Checklist Detail sheet in real-time
- **Auto-calculates**: Raw totals and weighted scores
- **Syncs**: Changes appear immediately in your Google Sheets

## 🛠️ Technical Details

- **Framework**: Flask web application
- **Templates**: HTML/CSS/JavaScript
- **API**: Google Sheets API v4
- **Authentication**: Service account JSON
- **Port**: 5000 (localhost)

## 🚨 Troubleshooting

### Dashboard won't load?
- Check if port 5000 is available
- Verify Google Sheets API credentials
- Check internet connection

### Can't save changes?
- Verify Google Sheets permissions
- Check if service account has edit access
- Look for rate limiting errors

### Missing stakeholders?
- Check if Checklist Detail sheet has data
- Verify stakeholder names match between sheets
- Check Google Sheets API quota

## 📈 Next Steps

1. **Complete Manual Assessment**: Use dashboard to score remaining criteria
2. **Review Results**: Check high/low performers
3. **Generate Reports**: Export data for analysis
4. **Improve Low Performers**: Use results to help stakeholders improve

## 🎉 Success!

You now have a powerful, interactive tool for manual assessment that:
- ✅ Pulls data from your Google Sheets
- ✅ Shows all relevant links and information
- ✅ Provides clear criteria descriptions
- ✅ Updates scores in real-time
- ✅ Makes manual assessment efficient and accurate

**Happy Assessing!** 🎯
