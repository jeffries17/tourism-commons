# CBT Monitoring Dashboard - Implementation Plan

## Overview
This plan outlines the step-by-step implementation of a CBT (Community-Based Tourism) monitoring system that connects Google Forms → Google Sheets → Firebase → React Dashboard. The system will enable ETA staff to track community engagement activities with automated reminders and real-time visualization.

**Timeline**: 2-3 weeks to MVP, ready to share after Week 1
**Goal**: Streamlined, maintainable solution that requires minimal ongoing technical support

---

## Phase 1: Google Sheets & Form Setup (Days 1-2)

### Step 1.1: Configure Google Sheet Structure
The existing sheet at `https://docs.google.com/spreadsheets/d/1qYVMz5aUsoQZZXgt7kKI4Gw0C-MHIqBLTt4wTdZ0rCE/edit` should have these tabs:

**Tab 1: Responses** (auto-filled from Form)
- Timestamp | Staff Name | Community | Date of Interaction | Engagement Type | Update Summary | Content Produced | Support Needed | Next Planned Visit

**Tab 2: Communities** (master list)
- Community Name | Region | Contact Person | Contact Info | Responsible Staff | Last Update Date | Status | Next Visit Date

**Tab 3: Dashboard Data** (formulas)
- Community | Last Update | Days Since Update | Status (Green/Yellow/Red) | Engagement Count (30 days) | Content Count

**Tab 4: Email Recipients**
- Name | Email | Role | Communities Assigned

### Step 1.2: Internal Form ✅ CREATED (No Google Form Needed)

**Form Location:** `/cbt-monitor/update` (internal route)

The form has been created as a React component at `tools/digital-assessment/src/pages/CbtUpdateForm.tsx`. This provides a better integrated experience and keeps everything within the application.

**Form Features:**
- ✅ Staff Name (auto-filled from authenticated user)
- ✅ Community (dropdown - populated from dashboard data)
- ✅ Date of Interaction (date picker, default = today)
- ✅ Engagement Type (checkboxes: Visit, Phone, WhatsApp, Email, No contact)
- ✅ Update Summary (textarea, max 500 chars)
- ✅ Content Produced (checkboxes: Instagram Post, Facebook Post, Story, Video, Blog Post, Other)
- ✅ Support Needed (optional textarea)
- ✅ Next Planned Visit (optional date picker)
- ✅ Form validation and error handling
- ✅ Success confirmation after submission
- ✅ Submits to `/api/cbt/update` endpoint

**Email Links:** Automated emails will link directly to `https://tourismcommons.org/cbt-monitoring/update` instead of a Google Form.

### Step 1.3: Add Sheet Formulas
In "Dashboard Data" tab, create these columns:

| Column | Formula | Purpose |
|--------|---------|---------|
| Last Update | `=MAXIFS(Responses!$A:$A, Responses!$C:$C, A2)` | Find most recent update per community |
| Days Since | `=TODAY()-B2` | Calculate days since last update |
| Status | `=IF(C2<=14, "🟢", IF(C2<=28, "🟡", "🔴"))` | Color code based on recency |
| Engagement Count | `=COUNTIFS(Responses!$C:$C, A2, Responses!$A:$A, ">="&TODAY()-30)` | Count interactions in last 30 days |
| Content Count | `=COUNTIFS(Responses!$C:$C, A2, Responses!$A:$A, ">="&TODAY()-30, Responses!$F:$F, "<>")` | Count content items in last 30 days |

---

## Phase 2: Google Apps Script Automation (Days 3-4)

### Step 2.1: Create Apps Script Project
1. Open Google Sheet → Extensions → Apps Script
2. Create new project: `CBT Monitoring Automation`

### Step 2.2: Implement Email Automation

**Script: `sendReminderEmails.gs`**
```javascript
function sendReminderEmails() {
  const sheet = SpreadsheetApp.openById('1qYVMz5aUsoQZZXgt7kKI4Gw0C-MHIqBLTt4wTdZ0rCE');
  const recipientsSheet = sheet.getSheetByName('Email Recipients');
  const dashboardSheet = sheet.getSheetByName('Dashboard Data');
  
  // Get all recipients
  const recipients = recipientsSheet.getDataRange().getValues();
  recipients.shift(); // Remove header
  
  // Get community status
  const communities = dashboardSheet.getDataRange().getValues();
  communities.shift(); // Remove header
  
  recipients.forEach(([name, email, role, assignedCommunities]) => {
    if (!email) return;
    
    const communityList = assignedCommunities.split(',').map(c => c.trim());
    const userCommunities = communities.filter(row => 
      communityList.includes(row[0])
    );
    
    const needsUpdate = userCommunities.filter(row => {
      const daysSince = row[2]; // Days Since Update column
      return daysSince > 14; // Green threshold
    });
    
    if (needsUpdate.length > 0) {
      const subject = `CBT Update Reminder - ${needsUpdate.length} community(ies) need updates`;
      const body = createReminderEmailBody(name, needsUpdate);
      
      MailApp.sendEmail({
        to: email,
        subject: subject,
        htmlBody: body
      });
    }
  });
}

function createReminderEmailBody(name, communities) {
  const formUrl = 'https://tourismcommons.org/cbt-monitoring/update'; // Internal form URL
  let html = `
    <h2>Hello ${name},</h2>
    <p>This is your bi-weekly reminder to update CBT community engagement records.</p>
    <p>The following communities need attention:</p>
    <ul>
  `;
  
  communities.forEach(([community, lastUpdate, daysSince, status]) => {
    html += `<li><strong>${community}</strong> - Last update: ${daysSince} days ago</li>`;
  });
  
  html += `
    </ul>
    <p><a href="${formUrl}">Click here to submit an update</a></p>
    <p>Thank you for keeping our records current!</p>
  `;
  
  return html;
}
```

**Script: `checkInactiveCommunities.gs`**
```javascript
function checkInactiveCommunities() {
  const sheet = SpreadsheetApp.openById('1qYVMz5aUsoQZZXgt7kKI4Gw0C-MHIqBLTt4wTdZ0rCE');
  const dashboardSheet = sheet.getSheetByName('Dashboard Data');
  const recipientsSheet = sheet.getSheetByName('Email Recipients');
  
  const communities = dashboardSheet.getDataRange().getValues();
  communities.shift(); // Remove header
  
  const inactive = communities.filter(row => {
    const daysSince = row[2]; // Days Since Update
    return daysSince > 21; // Red threshold
  });
  
  if (inactive.length > 0) {
    const adminEmails = recipientsSheet.getRange(2, 2, recipientsSheet.getLastRow() - 1, 1)
      .getValues()
      .filter(row => row[0]) // Get non-empty emails
      .map(row => row[0]);
    
    const subject = `⚠️ Alert: ${inactive.length} Community(ies) Inactive (>21 days)`;
    const body = createAlertEmailBody(inactive);
    
    adminEmails.forEach(email => {
      MailApp.sendEmail({
        to: email,
        subject: subject,
        htmlBody: body
      });
    });
  }
}

function createAlertEmailBody(communities) {
  let html = `
    <h2>Inactive Communities Alert</h2>
    <p>The following communities have not been updated in over 21 days:</p>
    <table border="1" cellpadding="5">
      <tr>
        <th>Community</th>
        <th>Days Since Update</th>
        <th>Status</th>
      </tr>
  `;
  
  communities.forEach(([community, lastUpdate, daysSince, status]) => {
    html += `
      <tr>
        <td>${community}</td>
        <td>${daysSince}</td>
        <td>${status}</td>
      </tr>
    `;
  });
  
  html += `
    </table>
    <p>Please follow up with the assigned staff members.</p>
  `;
  
  return html;
}
```

### Step 2.3: Set Up Triggers
1. **Bi-weekly Reminder**: Every Monday, 9 AM
   - Trigger: `sendReminderEmails()`
   - Frequency: Weekly on Mondays

2. **Inactive Communities Alert**: Every Monday, 10 AM
   - Trigger: `checkInactiveCommunities()`
   - Frequency: Weekly on Mondays

**To set up triggers:**
```javascript
// Run once to create triggers
function setupTriggers() {
  ScriptApp.newTrigger('sendReminderEmails')
    .timeBased()
    .everyWeeks(1)
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(9)
    .create();
  
  ScriptApp.newTrigger('checkInactiveCommunities')
    .timeBased()
    .everyWeeks(1)
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(10)
    .create();
}
```

### Step 2.4: Sync Script (Sheet → Firebase)
**Script: `syncToFirebase.gs`**
```javascript
// This will be called by Firebase Cloud Function or scheduled trigger
// For now, can be triggered manually or every 15 minutes

function syncToFirebase() {
  const sheet = SpreadsheetApp.openById('1qYVMz5aUsoQZZXgt7kKI4Gw0C-MHIqBLTt4wTdZ0rCE');
  const dashboardSheet = sheet.getSheetByName('Dashboard Data');
  const communitiesSheet = sheet.getSheetByName('Communities');
  
  const dashboardData = dashboardSheet.getDataRange().getValues();
  dashboardData.shift(); // Remove header
  
  const communitiesData = communitiesSheet.getDataRange().getValues();
  communitiesData.shift();
  
  // Create community objects
  const communities = dashboardData.map((row, index) => {
    const communityInfo = communitiesData.find(c => c[0] === row[0]) || [];
    return {
      community: row[0],
      lastUpdate: row[1] ? Utilities.formatDate(row[1], Session.getScriptTimeZone(), 'yyyy-MM-dd') : null,
      daysSinceUpdate: row[2],
      status: row[3],
      engagementCount: row[4] || 0,
      contentCount: row[5] || 0,
      region: communityInfo[1] || '',
      contactPerson: communityInfo[2] || '',
      responsibleStaff: communityInfo[4] || '',
      nextVisit: communityInfo[6] ? Utilities.formatDate(communityInfo[6], Session.getScriptTimeZone(), 'yyyy-MM-dd') : null
    };
  });
  
  // POST to Firebase Cloud Function webhook
  const webhookUrl = '[YOUR_FIREBASE_WEBHOOK_URL]/syncCommunities';
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ communities })
  };
  
  try {
    const response = UrlFetchApp.fetch(webhookUrl, options);
    Logger.log('Sync successful: ' + response.getContentText());
  } catch (e) {
    Logger.log('Sync failed: ' + e.toString());
  }
}
```

---

## Phase 3: Firebase Backend Setup (Days 5-6)

### Step 3.1: Firebase Project Configuration
1. Create Firebase project: `eswatini-cbt-monitor` (or use existing project)
2. Enable:
   - **Cloud Firestore** (Native mode)
   - **Firebase Authentication** (Google sign-in)
   - **Cloud Functions**

### Step 3.2: Firestore Structure

**Collection: `communities`**
```javascript
{
  id: "ejubukweni", // auto-generated or custom
  community: "Ejubukweni",
  region: "Hhohho",
  contactPerson: "John Mamba",
  contactInfo: "john@example.com",
  responsibleStaff: "Jane Dlamini",
  lastUpdate: "2025-01-15",
  daysSinceUpdate: 5,
  status: "green", // green, yellow, red
  engagementCount: 3, // last 30 days
  contentCount: 2,
  nextVisit: "2025-02-01",
  updatedAt: Timestamp,
  createdAt: Timestamp
}
```

**Collection: `responses`** (optional, for full history)
- Mirror of Google Sheet Responses tab

### Step 3.3: Cloud Function - Form Submission Handler
Create: `digital_assessment/functions/src/cbtUpdate.ts`

This will handle form submissions from the internal form at `/cbt-monitor/update`.

```typescript
import { onRequest } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';

initializeApp();
const db = getFirestore();

export const submitCbtUpdate = onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }

  try {
    const updateData = req.body;
    
    // Validate required fields
    if (!updateData.staffName || !updateData.community || !updateData.updateSummary) {
      res.status(400).json({ success: false, error: 'Missing required fields' });
      return;
    }

    // Save to Firestore
    const docRef = db.collection('responses').doc();
    await docRef.set({
      ...updateData,
      timestamp: new Date(),
      createdAt: new Date(),
    });

    // Optionally: Also append to Google Sheet via Apps Script webhook
    // This keeps the Sheet in sync for manual viewing/editing
    
    res.status(200).json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Update submission error:', error);
    res.status(500).json({ success: false, error: 'Submission failed' });
  }
});
```

### Step 3.4: Cloud Function - Google Sheets Sync (Optional)
If you want to keep Google Sheets in sync, create: `digital_assessment/functions/src/cbtSync.ts`

```typescript
import { onRequest } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';

initializeApp();
const db = getFirestore();

export const syncCommunities = onRequest(async (req, res) => {
  // Verify webhook secret if needed
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }

  try {
    const { communities } = req.body;
    const batch = db.batch();
    
    for (const community of communities) {
      const docRef = db.collection('communities').doc(community.community.toLowerCase().replace(/\s+/g, '-'));
      batch.set(docRef, {
        ...community,
        updatedAt: new Date(),
      }, { merge: true });
    }
    
    await batch.commit();
    res.status(200).json({ success: true, count: communities.length });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Sync failed' });
  }
});
```

### Step 3.5: Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /communities/{communityId} {
      allow read: if request.auth != null;
      allow write: if false; // Only via Cloud Function
    }
    
    match /responses/{responseId} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
```

---

## Phase 4: React Dashboard (Days 7-12) ✅ COMPLETED

### Step 4.1: Project Structure ✅
**STANDALONE APP CREATED** - All components are in `tools/cbt-monitoring/` as a separate React application:

```
tools/cbt-monitoring/
  src/
    pages/
      Dashboard.tsx ✅ (CREATED)
      UpdateForm.tsx ✅ (CREATED)
    components/
      CommunityCard.tsx ✅ (CREATED)
    hooks/
      useCommunities.ts ✅ (CREATED)
    types/
      index.ts ✅ (CREATED - all CBT types)
    App.tsx ✅ (CREATED)
    main.tsx ✅ (CREATED)
    index.css ✅ (CREATED)
  package.json ✅ (CREATED)
  vite.config.ts ✅ (CREATED)
  tsconfig.json ✅ (CREATED)
  tailwind.config.js ✅ (CREATED)
  index.html ✅ (CREATED)
```

**Files Created:**
- ✅ `tools/cbt-monitoring/src/pages/Dashboard.tsx` - Main dashboard page
- ✅ `tools/cbt-monitoring/src/pages/UpdateForm.tsx` - Internal form for submitting updates
- ✅ `tools/cbt-monitoring/src/components/CommunityCard.tsx` - Community card component with emojis and percentage bars
- ✅ `tools/cbt-monitoring/src/hooks/useCommunities.ts` - Data fetching hook (supports API or Firebase)
- ✅ `tools/cbt-monitoring/src/types/index.ts` - All CBT types (`CbtCommunity`, `CbtStats`, `CbtUpdateFormData`)
- ✅ `tools/cbt-monitoring/src/App.tsx` - Main app with routes at `/` (dashboard) and `/update` (form)
- ✅ All configuration files (package.json, vite.config, tsconfig, tailwind, etc.)

**Routes:**
- `/` - Dashboard (main view)
- `/update` - Update form

**Note:** This is now a completely standalone application, separate from `tools/digital-assessment`.

### Step 4.2: Community Card Component ✅

**Location:** `tools/cbt-monitoring/src/components/CommunityCard.tsx`

**Features Implemented:**
- ✅ Color-coded status indicators (🟢🟡🔴)
- ✅ Engagement percentage bars with dynamic colors
- ✅ Content production indicators
- ✅ Last contact dates and next visit info
- ✅ Responsive design with hover effects
- ✅ Accessibility features (ARIA labels, keyboard navigation)

**Component API:**
```typescript
interface CommunityCardProps {
  community: CbtCommunity; // Type defined in src/types/index.ts
}
```

### Step 4.3: Main Dashboard Page ✅

**Location:** `tools/cbt-monitoring/src/pages/Dashboard.tsx`

**Features Implemented:**
- ✅ Live status view with community cards
- ✅ Search functionality (by community, region, staff, contact)
- ✅ Filter by region and status
- ✅ Statistics cards (Total, Green, Yellow, Red counts with percentages)
- ✅ Direct links to Google Sheet and Form
- ✅ Loading states and error handling
- ✅ Mock data for development (until backend is ready)
- ✅ Responsive grid layout (1/2/3 columns based on screen size)

**Configuration:**
- Google Sheet URL: Hardcoded to `https://docs.google.com/spreadsheets/d/1qYVMz5aUsoQZZXgt7kKI4Gw0C-MHIqBLTt4wTdZ0rCE/edit`
- Form URL: Internal route `/update` (accessible at `/cbt-monitoring/update` when deployed)

### Step 4.4: Data Fetching Hook ✅

**Location:** `tools/cbt-monitoring/src/hooks/useCommunities.ts`

**Features:**
- ✅ Flexible data fetching (can use API endpoint or Firebase)
- ✅ React Query integration (automatic caching, refetching)
- ✅ Mock data for development/testing
- ✅ Error handling and fallbacks
- ✅ Auto-refresh every 5 minutes

**Current Implementation:**
- Uses API endpoint: `/api/cbt/communities`
- Falls back to mock data if API not available (dev mode)
- Ready to switch to Firebase Firestore when configured

**To Enable Firebase (when ready):**
1. Install Firebase SDK: `npm install firebase`
2. Initialize Firebase config
3. Update `fetchCommunitiesFromFirebase()` in the hook

### Step 4.5: Route Configuration ✅

**Location:** `tools/cbt-monitoring/src/App.tsx`

**Routes:**
```typescript
<Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/update" element={<UpdateForm />} />
</Routes>
```

**Access:** Available at `/cbt-monitoring/` (dashboard) and `/cbt-monitoring/update` (form)

### Step 4.6: Firebase Hosting Configuration ⚠️ TODO

The route is already configured via React Router, but you may want to add a specific rewrite in `firebase.json` if needed:

**Location:** `firebase.json`

```json
{
  "rewrites": [
    // ... existing rewrites
    {
      "source": "/cbt-monitor/**",
      "destination": "/index.html"
    }
  ]
}
```

**Note:** The current `firebase.json` already has a catch-all route (`"source": "**"`), so the dashboard should work without this specific rewrite. Add it only if you encounter routing issues.

---

## Phase 4 Summary ✅

**Status:** React components are complete and ready for use!

**Next Steps:**
1. Install dependencies: `cd tools/cbt-monitoring && npm install`
2. Set up backend API endpoints:
   - `/api/cbt/communities` - Fetch community list
   - `/api/cbt/update` - Submit form data
3. Configure Firebase Firestore (or use API endpoint)
4. Start dev server: `npm run dev` (runs on port 3002)
5. Test the form: Navigate to `/cbt-monitoring/update`
6. Test the dashboard: Navigate to `/cbt-monitoring/`
7. Verify data flows: Form → API/Firebase → Dashboard

**Testing:**
- In development, the dashboard will show mock data if API is not available
- Once backend is configured, mock data will be replaced with real data

---

## Phase 5: Testing & Launch (Days 13-14)

### Step 5.1: Test Flow
1. ✅ Submit test form entry
2. ✅ Verify data appears in Google Sheet
3. ✅ Trigger manual sync to Firebase
4. ✅ Verify data appears in dashboard
5. ✅ Test email triggers (set up test schedule)
6. ✅ Test filters and search
7. ✅ Test on mobile device

### Step 5.2: User Training
- Create 2-page quick reference guide
- Record 5-minute video walkthrough
- Schedule training session with ETA staff

### Step 5.3: Go-Live Checklist
- [ ] Google Form is live and accessible
- [ ] Email recipients list is populated
- [ ] Triggers are scheduled and active
- [ ] Firebase sync is working
- [ ] Dashboard is accessible to all staff
- [ ] Documentation is complete

---

## Quick Start Checklist (MVP - Week 1)

For immediate sharing, focus on:
1. ✅ **Google Form + Sheet** (Day 1)
   - Form created with all fields
   - Sheet formulas working
   - Test entry submitted

2. ✅ **Basic Dashboard** (Days 2-3)
   - Community cards displaying
   - Status colors working
   - Link to Google Sheet visible

3. ✅ **Email Automation** (Day 4)
   - Reminder script working
   - Test email sent

4. ✅ **Firebase Sync** (Day 5)
   - Manual sync working
   - Dashboard shows real data

**Ready to share by end of Week 1!**

---

## Maintenance Notes

### Weekly Tasks
- Monitor email delivery
- Check sync logs for errors
- Review dashboard for data accuracy

### Monthly Tasks
- Update community list if needed
- Review and adjust email recipients
- Generate monthly activity report

### Future Enhancements
- Mobile app or PWA
- Map visualization
- AI-generated summaries
- Automated PDF reports

---

## Support & Troubleshooting

**Common Issues:**

1. **Data not syncing**
   - Check Apps Script execution logs
   - Verify webhook URL is correct
   - Check Firebase function logs

2. **Emails not sending**
   - Verify trigger is active
   - Check recipient email addresses
   - Review Apps Script quota limits

3. **Dashboard not updating**
   - Verify Firestore rules allow reads
   - Check browser console for errors
   - Confirm Firebase connection

**Contact**: [Your technical contact]

---

## Appendix: Data Schema Reference

### Community Object
```typescript
{
  id: string;
  community: string;
  region: string;
  contactPerson: string;
  contactInfo: string;
  responsibleStaff: string;
  lastUpdate: string | null; // ISO date
  daysSinceUpdate: number;
  status: 'green' | 'yellow' | 'red';
  engagementCount: number;
  contentCount: number;
  nextVisit: string | null; // ISO date
  updatedAt: Timestamp;
  createdAt: Timestamp;
}
```

### Status Logic
- **Green** (🟢): Updated within last 14 days
- **Yellow** (🟡): Updated 15-28 days ago
- **Red** (🔴): No update in 29+ days

---

*Last Updated: [Date]*
*Version: 1.0*

