# CBT Monitoring - Testing & Finalization Summary

**Status**: Ready for Testing with Dummy Data

---

## ✅ Completed Components

### 1. Complete Link Between Form + Sheet + Visual Dashboard

**Status**: ✅ **COMPLETE**

**Implementation:**
- ✅ API endpoint `/api/cbt/update` - Accepts form submissions and writes to Google Sheet
- ✅ API endpoint `/api/cbt/communities` - Reads from Google Sheet and returns dashboard data
- ✅ Form component (`UpdateForm.tsx`) - Submits to API endpoint
- ✅ Dashboard component (`Dashboard.tsx`) - Fetches and displays data from API
- ✅ Google Sheets integration - Form submissions append to "Responses" tab
- ✅ Dashboard reads from "Dashboard Data" tab (with formulas)

**How It Works:**
1. User fills form → Submits to `/api/cbt/update`
2. API writes row to Google Sheet "Responses" tab
3. Google Sheet formulas in "Dashboard Data" tab calculate status
4. Dashboard fetches from `/api/cbt/communities` → Displays cards

**Files:**
- `digital_assessment/functions/src/app.ts` (lines 1752-1889) - API endpoints
- `tools/cbt-monitoring/src/pages/UpdateForm.tsx` - Form component
- `tools/cbt-monitoring/src/pages/Dashboard.tsx` - Dashboard component
- `tools/cbt-monitoring/src/hooks/useCommunities.ts` - Data fetching hook

---

### 2. Auto-PDF Generation & Color Status

**Status**: ✅ **COMPLETE**

**Implementation:**
- ✅ PDF generator utility (`pdfGenerator.ts`) - Creates formatted PDF reports
- ✅ "Download PDF" button on dashboard
- ✅ Color-coded status indicators (🟢🟡🔴) in PDF
- ✅ Statistics summary included
- ✅ Community table with all details

**Features:**
- Browser-based PDF generation (uses print dialog)
- Color-coded status badges (green/yellow/red)
- Statistics cards with percentages
- Complete community listing table
- Professional formatting for reports

**Files:**
- `tools/cbt-monitoring/src/utils/pdfGenerator.ts` - PDF generation utility
- `tools/cbt-monitoring/src/pages/Dashboard.tsx` - PDF button integration

**Usage:**
- Click "Download PDF" button on dashboard
- PDF opens in new window with print dialog
- Save as PDF or print directly

---

### 3. Baseline Entries for 3 Communities

**Status**: ✅ **COMPLETE**

**Implementation:**
- ✅ Baseline data script (`populateBaselineData.js`) - Populates test data
- ✅ TypeScript version (`populateBaselineData.ts`) - Type definitions
- ✅ 3 test communities with different statuses:
  - **Ejubukweni** (Hhohho) - 🟢 Green (5 days ago)
  - **Lobamba** (Hhohho) - 🟡 Yellow (20 days ago)
  - **Malkerns** (Manzini) - 🔴 Red (35 days ago)
- ✅ Sample responses for each community

**Files:**
- `tools/cbt-monitoring/scripts/populateBaselineData.js` - Node.js script
- `tools/cbt-monitoring/scripts/populateBaselineData.ts` - TypeScript definitions

**Usage:**
```bash
# Set environment variables
export CBT_SHEET_ID="1qYVMz5aUsoQZZXgt7kKI4Gw0C-MHIqBLTt4wTdZ0rCE"
export GOOGLE_SERVICE_ACCOUNT_JSON="/path/to/service-account.json"

# Run script
node tools/cbt-monitoring/scripts/populateBaselineData.js
```

**Alternative (Manual):**
- Use CSV export from script
- Copy/paste into Google Sheet tabs
- See `populateBaselineData.ts` for CSV generation functions

---

### 4. Short Internal "How-To" Guide for ETA Staff

**Status**: ✅ **COMPLETE**

**Implementation:**
- ✅ Comprehensive staff guide (`STAFF_HOW_TO_GUIDE.md`)
- ✅ Quick start section (5 minutes)
- ✅ Step-by-step instructions for:
  - Accessing dashboard
  - Understanding status colors
  - Submitting updates
  - Viewing data
  - Generating PDFs
  - Troubleshooting
- ✅ Weekly checklist
- ✅ Best practices

**Files:**
- `tools/cbt-monitoring/docs/STAFF_HOW_TO_GUIDE.md` - Complete guide

**Sections:**
1. What is This System?
2. Quick Start (5 Minutes)
3. Submitting an Update
4. Viewing Data
5. Email Reminders
6. Generating Reports (PDF)
7. Troubleshooting
8. Getting Help
9. Weekly Checklist
10. Best Practices
11. Mobile Access

---

## 🧪 Testing Checklist

**Status**: ✅ **READY FOR TESTING**

**Documentation:**
- ✅ Complete testing checklist created (`TESTING_CHECKLIST.md`)
- ✅ Covers all 4 main requirements
- ✅ Includes edge cases and error handling
- ✅ Performance and reliability tests

**Files:**
- `tools/cbt-monitoring/docs/TESTING_CHECKLIST.md` - Complete test plan

**Test Categories:**
1. ✅ Pre-Testing Setup
2. ✅ Test 1: Form + Sheet + Dashboard Link
3. ✅ Test 2: PDF Generation & Color Status
4. ✅ Test 3: Baseline Entries
5. ✅ Test 4: Staff Guide
6. ✅ Test 5: Edge Cases & Error Handling
7. ✅ Test 6: Performance & Reliability

---

## 📋 Next Steps for Testing

### Step 1: Set Up Google Sheet

1. **Verify Sheet Structure**
   - Open: `https://docs.google.com/spreadsheets/d/1qYVMz5aUsoQZZXgt7kKI4Gw0C-MHIqBLTt4wTdZ0rCE/edit`
   - Check tabs exist: "Responses", "Communities", "Dashboard Data"
   - Verify formulas in "Dashboard Data" tab

2. **Set Permissions**
   - Ensure service account has edit access
   - Verify ETA staff have view access

### Step 2: Populate Baseline Data

**Option A: Use Script (Recommended)**
```bash
cd tools/cbt-monitoring
node scripts/populateBaselineData.js
```

**Option B: Manual Entry**
- Use CSV data from `populateBaselineData.ts`
- Copy into Google Sheet tabs

### Step 3: Deploy API

1. **Deploy Firebase Functions**
   ```bash
   cd digital_assessment/functions
   firebase deploy --only functions:api
   ```

2. **Verify Endpoints**
   - Test: `GET /api/cbt/communities`
   - Test: `POST /api/cbt/update`

### Step 4: Test Dashboard

1. **Build Frontend**
   ```bash
   cd tools/cbt-monitoring
   npm run build
   ```

2. **Deploy Dashboard**
   - Deploy to hosting
   - Access: `https://tourismcommons.org/cbt-monitoring/eswatini`

3. **Run Tests**
   - Follow `TESTING_CHECKLIST.md`
   - Test form submission
   - Verify dashboard display
   - Test PDF generation

### Step 5: Share with Staff

1. **Review Staff Guide**
   - Read `STAFF_HOW_TO_GUIDE.md`
   - Verify all instructions are accurate

2. **Schedule Training**
   - Share guide with ETA staff
   - Walk through dashboard together
   - Practice submitting updates

---

## 🔧 Configuration Required

### Environment Variables

**Firebase Functions:**
- `CBT_SHEET_ID` - Google Sheet ID (defaults to hardcoded value)
- `GOOGLE_SERVICE_ACCOUNT_JSON` - Service account credentials

**Google Sheet:**
- Sheet ID: `1qYVMz5aUsoQZZXgt7kKI4Gw0C-MHIqBLTt4wTdZ0rCE`
- Tabs: "Responses", "Communities", "Dashboard Data"

### Google Sheet Formulas

**Dashboard Data Tab:**
- Column A: Community Name
- Column B: `=MAXIFS(Responses!$A:$A, Responses!$C:$C, A2)` (Last Update)
- Column C: `=TODAY()-B2` (Days Since Update)
- Column D: `=IF(C2<=14, "🟢", IF(C2<=28, "🟡", "🔴"))` (Status)
- Column E: `=COUNTIFS(Responses!$C:$C, A2, Responses!$A:$A, ">="&TODAY()-30)` (Engagement Count)
- Column F: `=COUNTIFS(Responses!$C:$C, A2, Responses!$A:$A, ">="&TODAY()-30, Responses!$F:$F, "<>")` (Content Count)

---

## 📁 File Structure

```
tools/cbt-monitoring/
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx          # Main dashboard (with PDF button)
│   │   └── UpdateForm.tsx         # Form component
│   ├── utils/
│   │   └── pdfGenerator.ts        # PDF generation utility
│   └── hooks/
│       └── useCommunities.ts      # Data fetching hook
├── scripts/
│   ├── populateBaselineData.js    # Node.js script to populate data
│   └── populateBaselineData.ts    # TypeScript definitions
└── docs/
    ├── STAFF_HOW_TO_GUIDE.md      # Staff guide
    ├── TESTING_CHECKLIST.md       # Testing checklist
    └── TESTING_SUMMARY.md         # This file

digital_assessment/functions/src/
└── app.ts                         # API endpoints (lines 1752-1889)
```

---

## ✅ Verification Checklist

Before considering testing complete, verify:

- [ ] API endpoints deployed and accessible
- [ ] Google Sheet has correct structure and formulas
- [ ] Baseline data populated (3 communities)
- [ ] Dashboard displays all communities correctly
- [ ] Form submission works end-to-end
- [ ] PDF generation works with color status
- [ ] Staff guide reviewed and accurate
- [ ] All tests from checklist passed

---

## 🎯 Success Criteria

**System is ready when:**
1. ✅ Form submissions appear in Google Sheet within seconds
2. ✅ Dashboard updates show new data within 1-2 minutes
3. ✅ PDF generates with correct colors and data
4. ✅ All 3 baseline communities display with correct statuses
5. ✅ Staff can follow guide and use system independently

---

## 📞 Support

**For Issues:**
- Check `TESTING_CHECKLIST.md` for troubleshooting
- Review `STAFF_HOW_TO_GUIDE.md` for user questions
- Check API logs in Firebase Console
- Verify Google Sheet permissions

**For Questions:**
- Technical: [Your technical contact]
- Process: [Your supervisor]

---

**Last Updated**: [Current Date]  
**Version**: 1.0  
**Status**: Ready for Testing

