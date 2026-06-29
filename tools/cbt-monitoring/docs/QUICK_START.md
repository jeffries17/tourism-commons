# CBT Monitoring - Quick Start Guide

## 5-Day MVP Setup

### Day 1: Google Form & Sheet ✅
- [ ] Create Google Form with 8 fields (see Implementation Plan)
- [ ] Link Form to existing Google Sheet
- [ ] Add formulas to "Dashboard Data" tab
- [ ] Test: Submit one form entry, verify data appears

**Time: 2-3 hours**

---

### Day 2: Google Apps Script Email Setup ✅
- [ ] Create Apps Script project in Google Sheet
- [ ] Copy email reminder scripts (from Implementation Plan)
- [ ] Populate "Email Recipients" tab with staff emails
- [ ] Test: Send manual reminder email

**Time: 2-3 hours**

---

### Day 3-4: Basic Dashboard ✅
- [ ] Add `CbtMonitor.tsx` page to React app
- [ ] Create `CommunityCard.tsx` component
- [ ] Add route `/cbt-monitor` to App.tsx
- [ ] Test: View dashboard (can use mock data initially)

**Time: 4-6 hours**

---

### Day 5: Firebase Integration ✅
- [ ] Create Firestore collection `communities`
- [ ] Set up Cloud Function for webhook sync
- [ ] Test Apps Script sync function
- [ ] Connect dashboard to Firestore
- [ ] Test: Full flow from Form → Sheet → Firebase → Dashboard

**Time: 3-4 hours**

---

## Essential Links to Configure

1. **Google Sheet**: `https://docs.google.com/spreadsheets/d/1qYVMz5aUsoQZZXgt7kKI4Gw0C-MHIqBLTt4wTdZ0rCE/edit`
2. **Google Form**: [Create and link to sheet]
3. **Dashboard URL**: `https://tourismcommons.org/cbt-monitor`
4. **Firebase Project**: [eswatini-cbt-monitor or existing]

---

## What Users Will See

### Dashboard Features
- **Community Cards**: Color-coded (🟢🟡🔴) showing status
- **Engagement Metrics**: Percentage bar for recent activity
- **Filtering**: By region and status
- **Quick Actions**: "Add Update" button (opens form), "View Sheet" button

### Email Reminders
- **Bi-weekly**: Every Monday, reminder to update communities
- **Alert**: Every Monday, alert for inactive communities (>21 days)

---

## Next Steps After MVP

1. Schedule automated email triggers (Week 2)
2. Add monthly snapshot export feature
3. Create user training materials
4. Gather feedback from first users

---

**Questions?** See full [Implementation Plan](./IMPLEMENTATION_PLAN.md)

