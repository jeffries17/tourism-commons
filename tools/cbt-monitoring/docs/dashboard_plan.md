Overview
This implementation connects an online form Forms → Google Sheets → Firebase → tourismcommons.org dashboard, creating a simple, real-time monitoring ecosystem for ETA’s CBT promotion activities.
 The system will:
Collect staff updates via a short Google Form (same fields described in the report).


Sync data to Google Sheets (as central database).


Mirror those records to Firebase (for secure storage, API access, and live dashboard display).


Render data through a dashboard on tourismcommons.org for internal tracking and ITC visibility.



1. System Architecture
User (ETA Staff)
   ↓
Google Form (bi-weekly updates)
   ↓
Google Sheet (raw data + colour logic)
   ↓
Firebase (real-time sync, API layer)
   ↓
TourismCommons Dashboard (React/Next.js or similar)

Each layer can function independently, so the system remains operational even if one component is offline.

2. Components and Setup
(a) Google Form
Create a Form with these fields:


Staff Name (auto-collected if logged in)


Community (dropdown, populated dynamically from Sheet/Firebase)


Date of Interaction (default = today)


Engagement Type (checkboxes: Visit / Phone / WhatsApp / No contact)


Update Summary (short text)


Content Produced (checkboxes)


Support Needed (text)


Next Planned Visit (date)


Responses automatically append to the linked Google Sheet.


Pro Tip: Use Google Apps Script to auto-populate the “Community” dropdown from Firebase or Sheet’s “Communities” tab so it always stays current.

(b) Google Sheet
Acts as the master ledger for all community updates.
Sheet Tabs:
Responses – auto-filled from Form.


Communities – list of all communities with contact info, last update date, responsible staff.


Dashboard Data – formulas summarising metrics (contact frequency, active %).


Email Alerts – triggers for “no update in 21+ days.”


Key Formulas / Conditional Logic
=MAXIFS(Responses!B:B, Responses!C:C, A2)

(find last update per community)
Colour logic for status:
=TODAY()-[LastUpdate]<=14 → Green


=TODAY()-[LastUpdate]<=28 → Yellow


Else → Red


Use a script to send email alerts weekly to responsible staff for “Red” communities.

(c) Firebase Backend
Purpose: Serve the same data to the tourismcommons.org dashboard and allow secure adds/edits.
Setup
Create a new Firebase project: eswatini-cbt-monitor


Enable Cloud Firestore and Firebase Authentication (Google sign-in for ETA staff).


Use Google Apps Script or a lightweight Node.js Cloud Function to sync Google Sheets → Firestore every 15 minutes:


Each community record stores:

 {
  "community": "Ejubukweni",
  "staff": "Jane Dlamini",
  "lastUpdate": "2025-10-24",
  "status": "green",
  "lastSummary": "Produced new story post for Instagram",
  "nextVisit": "2025-11-10"
}


This ensures the dashboard always reflects the latest Google Form entries.

(d) Dashboard on tourismcommons.org
Host a React or Next.js front end (since your team already works in modern frameworks) under a route like:
https://tourismcommons.org/dashboard/cbt-monitor

Core Features:
Live Status View


Cards or table for each community.


Colour-coded indicator (Green / Yellow / Red).


Search + filter by region or staff.


“Last contact” and “Next visit” fields visible.


Add / Edit Communities


Simple form modal that writes to Firebase and appends to Google Sheet (via Apps Script webhook).


Auto-refreshes dropdowns in Google Form.


Monthly Snapshot Button


One-click export (CSV or PDF) summarising monthly activity (mirroring the dashboard PDF described in Section 5.5).


Optional: add a “Download PDF” route using jsPDF or Puppeteer.


Embed Google Form


Either as a modal pop-up (iframe embed) or an “Add Update” button that redirects to the live Form.


Tech Stack Suggestion:
Front end: React or Next.js (with Tailwind CSS for styling).


Data: Firebase Firestore SDK (real-time sync).


Authentication: Google OAuth (Firebase Auth).


Charts: Recharts or Chart.js for monthly activity graph.



3. Automation & Notifications
Google Apps Script Functions
sendReminderEmails()


Runs on 1st and 3rd Monday → sends “Please complete your CBT update” message.


checkInactiveCommunities()


Runs every Monday → identifies communities with >21 days no contact → sends alert email.


generateMonthlySnapshot()


Runs last day of month → exports dashboard summary PDF and stores in Drive /CBT Monthly Reports/.


Scripts can run from the Sheet container or Firebase Cloud Functions, depending on preference.

4. Security and Access
Firebase Authentication restricts dashboard to ETA users (Google Workspace accounts).


Google Sheet restricted to same domain; Form accessible only to logged-in ETA staff.


All communication uses HTTPS and Google’s APIs—no external server needed.



5. Implementation Timeline
Phase
Tasks
Lead
Duration
1. Setup (Week 1)
Create Google Form + linked Sheet, test entries, basic formulas.
ETA Marketing Manager / ITC tech
2 days
2. Firebase Integration (Week 2)
Create Firebase project, sync Sheet to Firestore (Apps Script).
Developer
3 days
3. Dashboard Build (Weeks 3–4)
Build basic UI on tourismcommons.org with live status cards and Form embed.
Developer
1 week
4. Testing & Launch (Week 5)
Internal dry run with 2 communities; verify alerts, PDF export.
Team
1 week
5. Go-Live (Start Month 2)
Deploy for all pilot communities; begin first 1–3–4 rhythm.
All
Ongoing


6. Scalability
Future upgrades could include:
Community feedback portal: a simple visitor form feeding to the same database.


Mobile-friendly PWA: for offline data entry and later sync.


Regional map view: using Google Maps API to visualize activity hotspots.


AI summarization: automatically generate short “monthly report highlights” from form text (via Gemini or GPT API).



This setup hits the sweet spot between automated and lightweight.
 You get a live dashboard, institutional transparency, and reliable monitoring—all without adding new software subscriptions or workflows.

