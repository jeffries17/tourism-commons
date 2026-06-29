# CBT Monitoring - Testing Checklist

**Complete testing guide for finalizing the CBT Monitoring system**

---

## ✅ Pre-Testing Setup

### 1. Google Sheet Configuration

- [ ] **Verify Sheet Structure**
  - [ ] Tab "Responses" exists with headers: Timestamp | Staff Name | Community | Date of Interaction | Engagement Type | Update Summary | Content Produced | Support Needed | Next Planned Visit
  - [ ] Tab "Communities" exists with headers: Community Name | Region | Contact Person | Contact Info | Responsible Staff | Last Update Date | Status | Next Visit Date
  - [ ] Tab "Dashboard Data" exists with formulas:
    - Column A: Community Name
    - Column B: `=MAXIFS(Responses!$A:$A, Responses!$C:$C, A2)` (Last Update)
    - Column C: `=TODAY()-B2` (Days Since Update)
    - Column D: `=IF(C2<=14, "🟢", IF(C2<=28, "🟡", "🔴"))` (Status)
    - Column E: `=COUNTIFS(Responses!$C:$C, A2, Responses!$A:$A, ">="&TODAY()-30)` (Engagement Count)
    - Column F: `=COUNTIFS(Responses!$C:$C, A2, Responses!$A:$A, ">="&TODAY()-30, Responses!$F:$F, "<>")` (Content Count)

- [ ] **Set Sheet Permissions**
  - [ ] Service account has edit access to Sheet
  - [ ] ETA staff have view access
  - [ ] Sheet ID matches environment variable: `CBT_SHEET_ID`

### 2. API Configuration

- [ ] **Firebase Functions**
  - [ ] Functions deployed: `api` endpoint
  - [ ] Environment variable `CBT_SHEET_ID` set (or defaults to hardcoded value)
  - [ ] Google Service Account JSON configured
  - [ ] CORS enabled for API routes

- [ ] **Test API Endpoints**
  - [ ] `GET /api/cbt/communities` returns JSON array
  - [ ] `POST /api/cbt/update` accepts form data and writes to Sheet

### 3. Frontend Configuration

- [ ] **Build & Deploy**
  - [ ] `npm run build` completes without errors
  - [ ] Dashboard accessible at: `https://tourismcommons.org/cbt-monitoring/eswatini`
  - [ ] Form accessible at: `https://tourismcommons.org/cbt-monitoring/eswatini/update`

---

## 🧪 Test 1: Complete Link Between Form + Sheet + Dashboard

### Test Form Submission → Sheet

- [ ] **Submit Test Update**
  1. Navigate to Update Form
  2. Fill out all required fields:
     - Staff Name: "Test User"
     - Community: Select "Ejubukweni" (or any test community)
     - Date of Interaction: Today's date
     - Engagement Type: Select "Visit" and "WhatsApp"
     - Update Summary: "Test update for system verification"
     - Content Produced: Select "Instagram Post"
  3. Click "Submit Update"
  4. Verify success message appears

- [ ] **Verify Sheet Update**
  1. Open Google Sheet "Responses" tab
  2. Verify new row appears at bottom
  3. Check all fields match form submission:
     - Timestamp is recent
     - Staff Name matches
     - Community matches
     - Engagement Type shows "Visit, WhatsApp"
     - Update Summary matches
     - Content Produced shows "Instagram Post"

### Test Sheet → Dashboard Data

- [ ] **Verify Dashboard Data Tab Updates**
  1. Open Google Sheet "Dashboard Data" tab
  2. Find the community you submitted update for
  3. Verify:
     - Last Update column shows today's date
     - Days Since Update shows 0 or 1
     - Status shows 🟢 (green)
     - Engagement Count increased by 1
     - Content Count increased by 1 (if content was marked)

### Test Dashboard Display

- [ ] **Verify Dashboard Shows Updated Data**
  1. Refresh dashboard page
  2. Find the community card you updated
  3. Verify:
     - Status indicator is 🟢 (green)
     - "Days Since Update" shows 0 or 1
     - Engagement count increased
     - Content count increased (if applicable)
  4. Check that stats cards updated:
     - Green count increased
     - Total count unchanged (if community already existed)

### Test End-to-End Flow

- [ ] **Complete Flow Test**
  1. Submit update via form → Verify in Sheet → Verify in Dashboard
  2. Wait 1-2 minutes (for any caching)
  3. Submit another update for different community
  4. Verify both updates appear correctly
  5. Test with different engagement types
  6. Test with multiple content types selected

**Expected Result**: Form submission → Sheet update → Dashboard refresh (within 1-2 minutes)

---

## 🧪 Test 2: Auto-PDF Generation & Color Status

### Test PDF Generation

- [ ] **Generate PDF from Dashboard**
  1. On dashboard, click "Download PDF" button
  2. Verify PDF opens in new window/tab
  3. Check PDF content:
     - [ ] Title: "CBT Monitoring Dashboard Report"
     - [ ] Date generated shown
     - [ ] Statistics cards visible with correct counts
     - [ ] All communities listed in table
     - [ ] Status badges show correct colors (🟢🟡🔴)
     - [ ] Last update dates shown
     - [ ] Days since update shown
     - [ ] Engagement and content counts shown

- [ ] **Test PDF Print Functionality**
  1. Use browser print (Ctrl+P / Cmd+P)
  2. Select "Save as PDF"
  3. Verify PDF saves correctly
  4. Open saved PDF and verify formatting

- [ ] **Test PDF with Different Status Colors**
  1. Ensure dashboard has communities with all three statuses:
     - At least one 🟢 (green) community
     - At least one 🟡 (yellow) community
     - At least one 🔴 (red) community
  2. Generate PDF
  3. Verify all three status colors appear correctly
  4. Check that color coding matches dashboard

### Test Color Status Logic

- [ ] **Verify Status Calculation**
  1. Check communities updated ≤14 days ago → Should be 🟢
  2. Check communities updated 15-28 days ago → Should be 🟡
  3. Check communities updated 29+ days ago → Should be 🔴
  4. Submit new update for a 🔴 community
  5. Verify status changes to 🟢 after refresh

- [ ] **Test Status Updates Automatically**
  1. Note current status of a community
  2. Wait for date to cross threshold (or manually adjust date in Sheet)
  3. Refresh dashboard
  4. Verify status updates correctly

**Expected Result**: PDF generates with all data, color status indicators work correctly, status updates automatically based on dates

---

## 🧪 Test 3: Baseline Entries for 3 Communities

### Populate Test Data

- [ ] **Add 3 Test Communities**
  1. Use the baseline data script or manually add:
     - **Ejubukweni** (Hhohho) - 5 days ago (🟢)
     - **Lobamba** (Hhohho) - 20 days ago (🟡)
     - **Malkerns** (Manzini) - 35 days ago (🔴)
  2. Add to "Communities" tab with:
     - Community Name
     - Region
     - Contact Person
     - Contact Info
     - Responsible Staff
     - Last Update Date
     - Next Visit Date (optional)

- [ ] **Add Sample Responses**
  1. Add 2-3 sample responses to "Responses" tab for each community
  2. Use dates that match the status colors:
     - Ejubukweni: Recent dates (within 14 days)
     - Lobamba: Dates 15-28 days ago
     - Malkerns: Dates 29+ days ago

- [ ] **Verify Dashboard Data Formulas**
  1. Check "Dashboard Data" tab formulas calculate correctly
  2. Verify status colors match expected:
     - Ejubukweni: 🟢
     - Lobamba: 🟡
     - Malkerns: 🔴

### Verify Dashboard Display

- [ ] **Check All 3 Communities Appear**
  1. Open dashboard
  2. Verify all 3 communities show as cards
  3. Check status colors:
     - Ejubukweni card shows 🟢
     - Lobamba card shows 🟡
     - Malkerns card shows 🔴
  4. Verify stats cards show:
     - Total: 3
     - Green: 1
     - Yellow: 1
     - Red: 1

- [ ] **Test Filtering**
  1. Filter by region "Hhohho" → Should show Ejubukweni and Lobamba
  2. Filter by status "Red" → Should show only Malkerns
  3. Search for "Ejubukweni" → Should show only that community
  4. Clear filters → Should show all 3

**Expected Result**: All 3 communities appear with correct status colors, filtering works, stats are accurate

---

## 🧪 Test 4: Staff How-To Guide

### Review Documentation

- [ ] **Guide Completeness**
  - [ ] Guide exists at: `tools/cbt-monitoring/docs/STAFF_HOW_TO_GUIDE.md`
  - [ ] All sections present:
    - Quick Start
    - Submitting Updates
    - Viewing Data
    - Email Reminders
    - PDF Generation
    - Troubleshooting
    - Weekly Checklist
  - [ ] Instructions are clear and easy to follow
  - [ ] Screenshots or examples included (if applicable)

### Test Guide Accuracy

- [ ] **Verify Instructions Match System**
  1. Follow "Quick Start" section step-by-step
  2. Verify all URLs are correct
  3. Test "Submitting an Update" instructions
  4. Verify form fields match guide descriptions
  5. Test "Generating Reports" instructions
  6. Verify PDF generation works as described

- [ ] **Test Troubleshooting Section**
  1. Review common issues listed
  2. Verify solutions are accurate
  3. Test suggested fixes

**Expected Result**: Guide is complete, accurate, and helpful for staff

---

## 🧪 Test 5: Edge Cases & Error Handling

### Form Validation

- [ ] **Test Required Fields**
  - [ ] Submit without Staff Name → Error shown
  - [ ] Submit without Community → Error shown
  - [ ] Submit without Engagement Type → Error shown
  - [ ] Submit without Update Summary → Error shown
  - [ ] Submit with all required fields → Success

- [ ] **Test Field Limits**
  - [ ] Update Summary > 500 characters → Character count shows
  - [ ] Submit with valid data → Success

### API Error Handling

- [ ] **Test API Errors**
  - [ ] Disconnect internet → Form shows error message
  - [ ] Submit with invalid data → API returns error
  - [ ] Check error messages are user-friendly

### Sheet Errors

- [ ] **Test Sheet Access Issues**
  - [ ] Temporarily remove Sheet permissions → Error handled gracefully
  - [ ] Verify error messages don't expose technical details

---

## 🧪 Test 6: Performance & Reliability

### Load Testing

- [ ] **Test with Multiple Updates**
  1. Submit 5 updates in quick succession
  2. Verify all appear in Sheet
  3. Verify dashboard updates correctly
  4. Check no data loss

### Refresh Testing

- [ ] **Test Dashboard Refresh**
  1. Submit update via form
  2. Wait 30 seconds
  3. Refresh dashboard
  4. Verify update appears
  5. Check auto-refresh works (if implemented)

---

## ✅ Final Verification

### Complete System Test

- [ ] **End-to-End Test**
  1. Start with empty Sheet (or known state)
  2. Add 3 baseline communities
  3. Submit updates via form
  4. Verify Sheet updates
  5. Verify Dashboard shows updates
  6. Generate PDF report
  7. Verify PDF contains all data with correct colors
  8. Test filtering and search
  9. Verify stats are accurate

### Documentation Review

- [ ] **All Documentation Complete**
  - [ ] Staff How-To Guide
  - [ ] Implementation Plan
  - [ ] Testing Checklist (this document)
  - [ ] API Documentation (if needed)

### Sign-Off

- [ ] **Ready for Staff Use**
  - [ ] All tests passed
  - [ ] Documentation reviewed
  - [ ] System stable
  - [ ] Staff training scheduled (if needed)

---

## 📝 Notes

**Test Date**: _______________  
**Tester**: _______________  
**Issues Found**: _______________  
**Resolution**: _______________  

---

## 🚀 Next Steps After Testing

1. **Address any issues found**
2. **Schedule staff training session**
3. **Share how-to guide with ETA staff**
4. **Set up monitoring for first week**
5. **Gather feedback and iterate**

---

**Last Updated**: [Current Date]

