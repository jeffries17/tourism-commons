# Quick Testing Guide - CBT Monitoring

**Fast track to test the 4 main requirements**

---

## 🚀 Quick Start (15 minutes)

### 1. Test Form → Sheet → Dashboard Link (5 min)

**Steps:**
1. Open dashboard: `https://tourismcommons.org/cbt-monitoring/eswatini`
2. Click "Add Update"
3. Fill form:
   - Community: Select any community
   - Engagement Type: Check "Visit"
   - Update Summary: "Test update"
   - Click "Submit Update"
4. Open Google Sheet → "Responses" tab
5. ✅ Verify new row appears
6. Refresh dashboard
7. ✅ Verify community card shows updated status

**Expected**: Form → Sheet → Dashboard updates within 1-2 minutes

---

### 2. Test PDF Generation & Color Status (3 min)

**Steps:**
1. On dashboard, click "Download PDF"
2. ✅ PDF opens in new window
3. ✅ Verify:
   - Statistics cards visible
   - Communities listed in table
   - Status colors shown (🟢🟡🔴)
   - All data present
4. Save PDF or print

**Expected**: PDF generates with color-coded status indicators

---

### 3. Populate Baseline Data (5 min)

**Option A: Use Script**
```bash
cd tools/cbt-monitoring
export CBT_SHEET_ID="1qYVMz5aUsoQZZXgt7kKI4Gw0C-MHIqBLTt4wTdZ0rCE"
export GOOGLE_SERVICE_ACCOUNT_JSON="/path/to/service-account.json"
node scripts/populateBaselineData.js
```

**Option B: Manual Entry**
1. Open Google Sheet
2. Copy data from `scripts/populateBaselineData.ts` CSV functions
3. Paste into "Communities" and "Responses" tabs
4. Verify "Dashboard Data" tab calculates correctly

**Expected**: 3 communities appear:
- Ejubukweni (🟢 Green)
- Lobamba (🟡 Yellow)  
- Malkerns (🔴 Red)

---

### 4. Review Staff Guide (2 min)

**Steps:**
1. Open `docs/STAFF_HOW_TO_GUIDE.md`
2. ✅ Verify all sections present
3. ✅ Check instructions match system
4. ✅ Test one instruction (e.g., "Submitting an Update")

**Expected**: Guide is complete and accurate

---

## ✅ All Tests Pass?

If all 4 tests pass, system is ready! 

**Next Steps:**
- Share staff guide with ETA team
- Schedule training session
- Monitor first week of usage
- Gather feedback

---

## ❌ Issues Found?

**Common Issues:**

1. **Form won't submit**
   - Check API is deployed: `GET /api/cbt/communities`
   - Check browser console for errors
   - Verify Google Sheet permissions

2. **Dashboard shows no data**
   - Check API endpoint returns data
   - Verify Google Sheet has data
   - Check "Dashboard Data" tab formulas

3. **PDF won't generate**
   - Check browser allows pop-ups
   - Try browser print (Ctrl+P / Cmd+P)
   - Verify PDF utility is imported

4. **Baseline data script fails**
   - Check service account credentials
   - Verify Sheet ID is correct
   - Check Sheet permissions

**Full troubleshooting**: See `docs/TESTING_CHECKLIST.md`

---

## 📋 Full Testing

For comprehensive testing, follow: `docs/TESTING_CHECKLIST.md`

---

**Quick Reference**: This guide | **Full Guide**: `docs/STAFF_HOW_TO_GUIDE.md` | **Testing**: `docs/TESTING_CHECKLIST.md`

