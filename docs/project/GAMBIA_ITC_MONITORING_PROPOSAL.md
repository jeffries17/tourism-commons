# Gambia ITC Dashboard - Monitoring & Updating Framework
## Implementation Proposal

**Date:** January 2025  
**Project:** Creative Industries Digital Visibility – Monitoring & Updating Framework  
**Dashboard:** gambia-itc (tourismcommons.org/gambia-itc)

---

## Executive Summary

This proposal outlines the technical implementation needed to transform the existing Gambia ITC dashboard from a static assessment tool into an active monitoring system. The system will enable monthly participant check-ins, automatic engagement scoring, quarterly verification workflows, and continuous dashboard updates—creating a "living framework" for digital visibility tracking.

**Current State:** Dashboard with authentication, participant login, and view-only assessment data  
**Target State:** Interactive monitoring platform with monthly submissions, engagement tracking, and automated reporting

---

## 1. Existing Infrastructure Assessment

### ✅ What We Already Have

1. **Authentication System**
   - Google Sheets-based user management (`dashboard_auth` tab)
   - Login tracking (`login_count`, `last_login` timestamps)
   - Role-based access (admin vs participant)
   - Participant access to their own detail pages

2. **Backend API (Firebase Functions)**
   - Google Sheets read/write capabilities
   - Participant data endpoints
   - Authentication endpoints (`/api/auth/login`)
   - Existing write endpoints (`/feedback`, participant management)

3. **Frontend Dashboard**
   - React/TypeScript application
   - Participant detail pages
   - Admin dashboard views
   - Protected routes and access control

4. **Data Infrastructure**
   - Google Sheets as central data store
   - Spreadsheet ID: `1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM`
   - Existing tabs: `dashboard_auth`, `Participants`, `Survey Responses`

### 📋 Reference Implementation

The **CBT Monitoring System** (`tools/cbt-monitoring/`) provides a similar pattern:
- Monthly update forms (`UpdateForm.tsx`)
- Google Sheets integration
- Engagement tracking
- Can be adapted for this use case

---

## 2. Required Functionality

### 2.1 Monthly Check-In Form (Digital Health Check)

**User Story:** Participants submit a 60-90 second monthly form answering 10 questions across 6 digital dimensions plus support needs.

**Questionnaire Structure (10 Questions):**

**Format:** Monthly (sent during first week of each month)  
**Time Required:** 60-90 seconds  
**Response Scale:** Yes / No / Not yet / Unsure (scores: 1 / 0 / 0 / 0.5 points)

#### Questions by Digital Dimension:

**1. Social Media Presence (2 questions)**
- **Q1:** Did you post on your main business page at least once this month? (Yes/No/Not yet/Unsure)
- **Q2:** Did you reply to any customer comments or messages? (Yes/No/Not yet/Unsure)

**2. Website / Profile Maintenance (1 question)**
- **Q3:** Did you update or verify any information on your website or online directory profile (hours, prices, contact)? (Yes/No/Not yet/Unsure)

**3. Visual Content Quality (1 question)**
- **Q4:** Did you add at least one new photo or short video showing your work or event? (Yes/No/Not yet/Unsure)

**4. Discoverability & Reputation (2 questions)**
- **Q5:** Did you check or respond to a review on Google / TripAdvisor this month? (Yes/No/Not yet/Unsure)
- **Q6:** Is your Google Business listing still accurate? (Yes/No/Not yet/Unsure)

**5. Digital Sales & Transactions (1 question)**
- **Q7:** Did you receive or process any digital payments (mobile money, online booking, WhatsApp order)? (Yes/No/Not yet/Unsure)

**6. Platform Integration & Collaboration (2 questions)**
- **Q8:** Did you share or tag another creative business or event in your online posts? (Yes/No/Not yet/Unsure)
- **Q9:** Did you participate in any joint campaign or training session this month? (Yes/No/Not yet/Unsure)

**7. Self-Reflection / Support Needs (1 question)**
- **Q10:** Do you need any help this month (technical issue, photo support, training topic)? (Yes/No/Not yet/Unsure)
  - *Note: This question is for feedback but doesn't contribute to Engagement Score (0-9 range from Q1-Q9)*

**Technical Requirements:**

1. **Enhanced Participant Profile Page (Transformation of `ParticipantDetail.tsx`)**
   - **Current:** Shows 2025 assessment scores, digital presence, sentiment data
   - **New Approach:** Transform into tabbed/sectioned "Participant Profile" with:
     - **Tab 1: "My Assessment"** (existing assessment data)
       - 2025 assessment scores
       - Digital presence & links
       - Sentiment analysis
       - Recommendations
     - **Tab 2: "Monthly Check-In"** (new monitoring functionality)
       - Monthly Digital Health Check form (10 questions)
       - One-click submission
       - Success confirmation with Engagement Score
       - "Already submitted this month" indicator (if submitted)
     - **Tab 3: "My Engagement"** (new tracking section)
       - Current Engagement Score (0-9) with badge (Low/Moderate/High)
       - Monthly trend chart (last 6 months)
       - Sector comparison (Digital Health Index)
       - Recognition badges (if applicable)
       - Support needs status (if Q10=Yes)
   - Mobile-responsive design (for WhatsApp users)
   - Navigation tabs at top of page

2. **New Backend Endpoint: `POST /api/monitoring/checkin`**
   - Accepts: `participantUsername`, `responses` (array of 10 answers), `supportNeeds` (optional text), `timestamp`
   - Validates: Only one submission per month per participant
   - Writes to new Google Sheet tab: `Monthly_CheckIns`
   - Automatically calculates and stores Engagement Score (0-9, from Q1-Q9 only)
   - Updates participant's current engagement score in dashboard data
   - Stores support needs for GT Board follow-up

3. **Google Sheets Structure: `Monthly_CheckIns` Tab**
   ```
   Columns:
   A: Timestamp
   B: Participant Username
   C: Participant Name
   D: Sector
   E: Month (YYYY-MM)
   F: Q1 - Posted on main page (Yes/No/Not yet/Unsure)
   G: Q2 - Replied to comments (Yes/No/Not yet/Unsure)
   H: Q3 - Updated website/profile (Yes/No/Not yet/Unsure)
   I: Q4 - Added new visuals (Yes/No/Not yet/Unsure)
   J: Q5 - Checked/responded reviews (Yes/No/Not yet/Unsure)
   K: Q6 - Google Business accurate (Yes/No/Not yet/Unsure)
   L: Q7 - Digital payments (Yes/No/Not yet/Unsure)
   M: Q8 - Shared/tagged other business (Yes/No/Not yet/Unsure)
   N: Q9 - Joint campaign/training (Yes/No/Not yet/Unsure)
   O: Q10 - Support needs (Yes/No/Not yet/Unsure)
   P: Support Needs Details (text, if Q10=Yes)
   Q: Engagement Score (0-9)
   R: Submission Date
   ```

### 2.2 Engagement Score Calculation

**User Story:** System automatically calculates a 0-10 engagement score based on monthly responses (Q1-Q9 only; Q10 is for support feedback).

**Scoring Algorithm:**

1. **Scoring Function: `calculateEngagementScore()`**
   - **Response Scoring:**
     - Yes = 1 point
     - No = 0 points
     - Not yet = 0 points
     - Unsure = 0.5 points
   
   - **Question Weights (Sum of Q1-Q9 = Engagement Score):**
     - Q1 (Posted on main page): 0-1 points
     - Q2 (Replied to comments): 0-1 points
     - Q3 (Updated website/profile): 0-1 points
     - Q4 (Added new visuals): 0-1 points
     - Q5 (Checked/responded reviews): 0-1 points
     - Q6 (Google Business accurate): 0-1 points
     - Q7 (Digital payments): 0-1 points
     - Q8 (Shared/tagged business): 0-1 points
     - Q9 (Joint campaign/training): 0-1 points
     - **Q10 (Support needs):** Excluded from score (feedback only)
   
   - **Total:** Sum of Q1-Q9 = 0-9 possible points (with Unsure = 0.5, max is 9)
   - **Note:** With Yes/No/Not yet only (no Unsure), max score = 9
   - Runs server-side on form submission

2. **Score Interpretation & Follow-up Logic:**
   - **0-3 points:** Low engagement → Association follow-up, check barriers
   - **4-6 points:** Moderate engagement → Encourage participation, share quick wins
   - **7-9 points:** High engagement → Feature in quarterly "Digital Visibility Highlights"

3. **Score Storage**
   - Store in `Monthly_CheckIns` tab (Column Q)
   - Maintain current score per participant in dashboard data
   - Historical tracking (can show trends over time)
   - Calculate sector averages for "Digital Health Index"

### 2.3 Dashboard Updates & Visualization

**User Story:** Dashboard automatically updates to show engagement scores, sector averages (Digital Health Index), and highlights.

**Technical Requirements:**

1. **New "My Engagement" Tab on Participant Profile**
   - **Location:** Third tab on transformed ParticipantDetail page
   - Current engagement score (0-9) with interpretation badge:
     - 🔴 Low (0-3) → "Association follow-up recommended"
     - 🟡 Moderate (4-6) → "Keep up the good work!"
     - 🟢 High (7-9) → "Great engagement!"
   - Monthly trend chart (last 6 months) - line graph
   - Sector average comparison (Digital Health Index) - comparison card
   - Personal best / improvement indicators
   - Support needs alert banner (if Q10=Yes in current month)
   - "Submit This Month's Check-In" quick link button

2. **Admin Dashboard Enhancements**
   - Sector-level Digital Health Index (average engagement score per sector)
   - Top performers by engagement score
   - Monthly submission rate (% of participants who submitted)
   - Engagement trends over time (line charts by sector)
   - Support needs summary (who needs help, from Q10 responses)
   - Low engagement alerts (0-3 points) for follow-up

3. **New API Endpoints:**
   - `GET /api/monitoring/engagement/:username` - Get participant's engagement history
   - `GET /api/monitoring/sector-averages` - Get sector-level averages
   - `GET /api/monitoring/top-performers` - Get top performers (admin only)
   - `GET /api/monitoring/submission-rate` - Get monthly submission statistics

### 2.4 Participant Onboarding System

**User Story:** New participants not included in the 2025 assessment can register, select their sector, request assessment, and join the monitoring system.

**Use Cases:**
- New creative enterprises wanting to join
- Organizations that missed the initial 2025 assessment
- Ongoing enrollment for the monitoring program
- Sector associations referring new members

**Technical Requirements:**

1. **Public Registration Form: `ParticipantOnboarding.tsx`**
   - **Route:** `/register` or `/join` (public, no login required)
   - **Form Fields:**
     - Organization/Individual Name (required)
     - Sector Selection (dropdown with all sectors) (required)
     - Contact Email (required)
     - Contact Phone/WhatsApp (required)
     - Region (optional)
     - Website/Social Media Links (optional)
     - Assessment Request Checkbox: "I would like to request a digital assessment" (optional)
     - Notes/Additional Info (optional textarea)
   - Submit button → sends registration request
   - Success message: "Thank you! Your registration is pending approval. You'll receive an email when your account is ready."

2. **Admin Approval Workflow:**
   - **New Google Sheet Tab: `Registration_Requests`**
     ```
     Columns:
     A: Timestamp
     B: Organization Name
     C: Sector
     D: Contact Email
     E: Contact Phone/WhatsApp
     F: Region
     G: Website
     H: Assessment Requested (Yes/No)
     I: Status (Pending/Approved/Rejected)
     J: Assigned Username
     K: Approved By (admin username)
     L: Approval Date
     M: Notes
     ```
   - Admin sees pending registrations in dashboard
   - Admin can approve → automatically:
     - Generates username (or admin can set custom)
     - Adds to `dashboard_auth` sheet
     - Sends welcome email with username/login instructions
     - If assessment requested: Adds to assessment queue
   - Admin can reject with notes

3. **Backend Endpoints:**
   - `POST /api/onboarding/register` - Submit registration request
   - `GET /api/onboarding/requests` - Admin: list pending requests
   - `POST /api/onboarding/approve/:requestId` - Admin: approve registration
     - Accepts: `username` (optional, auto-generate if not provided), `notes`
     - Auto-generates username if not provided: `firstname+lastname` or `orgname` (lowercase, no spaces)
   - `POST /api/onboarding/reject/:requestId` - Admin: reject with reason
   - `GET /api/sectors` - List all available sectors (for dropdown)

4. **Auto-Username Generation:**
   - If organization name: `orgname` → lowercase, remove spaces/special chars
   - If individual name: `firstname+lastname` → lowercase, remove spaces
   - Check for duplicates, append number if needed (e.g., `johnsmith2`)

5. **Welcome Email/Template:**
   - Sent upon approval
   - Contains:
     - Username
     - Login link
     - Brief instructions
     - Next steps (assessment if requested, or start monthly check-ins)

6. **Integration with Monitoring:**
   - Upon approval, new participant:
     - Gets initial Engagement Score: 0 (or baseline after assessment)
     - Can immediately start monthly check-ins (no waiting period)
     - Appears in admin monitoring dashboard
     - If assessment requested: appears in assessment queue for GT Board

7. **Admin Interface: `Admin/Onboarding.tsx`**
   - Route: `/admin/onboarding` (admin only)
   - Shows table of pending/approved/rejected requests
   - Filter by status, sector
   - Quick actions: Approve/Reject buttons
   - Bulk approve option
   - Export to CSV

8. **Assessment Queue Integration:**
   - If participant requests assessment:
     - Added to `Assessment_Queue` tab in Google Sheet
     - Flagged for GT Board digital desk to schedule
     - Appears in admin "Assessment Queue" view
     - Participant can start monitoring immediately (engagement score = 0 until assessed)

9. **Initial Setup for New Participants:**
   - **In `dashboard_auth` sheet:**
     - Full Name: Organization/Individual name
     - Username: Generated or admin-assigned
     - Role: "participant"
     - Notes: "Registered [date], Sector: [sector], Assessment: [Requested/Pending]"
     - login_count: 0
     - last_login: (empty)
   - **In `Monthly_CheckIns` sheet:**
     - No initial entries (starts fresh)
     - Can submit first check-in immediately
   - **In assessment data:**
     - Added to participant list (scores = 0 or empty if assessment not done yet)

**User Flow:**

1. **New Participant Visits Site:**
   - Sees "Join the Program" or "Register" button on homepage
   - Clicks → `/register` page

2. **Fills Registration Form:**
   - Enters organization name, selects sector, contact info
   - Optionally checks "Request Assessment"
   - Submits

3. **Confirmation:**
   - Sees: "Thank you! Your registration is pending approval."
   - Receives email confirmation (with tracking ID)

4. **Admin Reviews:**
   - Sees pending request in `/admin/onboarding`
   - Reviews details, optionally sets custom username
   - Clicks "Approve"

5. **System Auto-Setup:**
   - Adds to `dashboard_auth` sheet
   - Generates username (if not set)
   - If assessment requested: Adds to assessment queue
   - Sends welcome email with login instructions

6. **New Participant Can Login:**
   - Receives email with username
   - Logs in → sees their profile page
   - If assessment requested: Sees "Assessment Pending" in "My Assessment" tab
   - Can immediately start monthly check-ins in "Monthly Check-In" tab

### 2.5 Quarterly Verification Workflow

**User Story:** Sector focal points verify 10% of submissions each quarter and compile quarterly reports.

**Technical Requirements:**

1. **Verification Interface (Admin/Sector Focal Points)**
   - New route: `/admin/verification`
   - List of submissions for current quarter
   - Random 10% selection algorithm (or manual selection)
   - Verification form: checkbox to verify, notes field
   - Save verification status to `Monthly_CheckIns` tab (new column: `Verified`)

2. **Quarterly Report Generation**
   - New component: `QuarterlyReportGenerator.tsx` (admin only)
   - Generates PDF report with:
     - Progress by sector
     - Top improvers (engagement score increase)
     - New collaborations
     - Submission statistics
   - Option to export as PDF (using browser print or PDF library)

3. **Google Sheets: `Quarterly_Verifications` Tab**
   ```
   Columns:
   A: Quarter (YYYY-Q)
   B: Participant Username
   C: Check-In Month
   D: Verifier Name
   E: Verification Status (Verified/Pending/Issue)
   F: Verification Notes
   G: Verification Date
   ```

### 2.6 Monthly Creative Pulse & Quarterly Visibility Snapshot

**User Story:** Automated messages and reports sent to participants each month/quarter.

**Technical Requirements:**

1. **Creative Pulse (Monthly Email/WhatsApp)**
   - Backend function: `sendMonthlyPulse()`
   - **Triggered:** First week of each month (or via manual admin trigger)
   - **Content:**
     - Friendly reminder to submit monthly Digital Health Check
     - Link to check-in form (web + Google Form options)
     - Personal engagement score (if available from previous month)
     - Sector highlights (top performers)
     - Interpretation of their score range (Low/Moderate/High)
   - **Delivery Methods:**
     - **Option A:** WhatsApp Broadcast (preferred - mentioned in plan)
     - **Option B:** Email via SendGrid/SMTP
     - **Option C:** Google Apps Script email triggers
     - **Option D:** Paper form during meetings (for those without digital access)

2. **Visibility Snapshot (Quarterly)**
   - Automated quarterly report generation
   - Send to all participants (PDF or web link)
   - Include: sector progress, top performers, collaboration highlights
   - Admin dashboard: "Generate Quarterly Report" button

### 2.7 Recognition System

**User Story:** "Most Improved" and "Consistency Champion" features each quarter.

**Technical Requirements:**

1. **Recognition Badges Component**
   - Display on participant detail page
   - Badges: "Most Improved", "Consistency Champion", "Top Performer"
   - Algorithm:
     - **Most Improved:** Highest engagement score increase (current - baseline)
     - **Consistency Champion:** Submitted all months in quarter
     - **Top Performer:** Highest average engagement score

2. **Recognition Display on Dashboard**
   - Featured section on main dashboard
   - Links to participant pages
   - Quarterly rotation

3. **Visibility on tourismcommons.org**
   - API endpoint to fetch top performers
   - Can be embedded in partner platforms

---

## 3. Integration Options

### 3.1 Google Forms Integration (Alternative to Web Form)

**Option:** Allow participants to submit via Google Form (especially for WhatsApp users).

**Implementation:**
- Create Google Form with 10 questions (matching web form structure)
- Questions organized by digital dimension (section headers)
- Response options: Yes / No / Not yet / Unsure (radio buttons)
- Q10 includes optional text field for support needs
- Google Apps Script on form submission:
  - Validates participant (matches email/phone to username OR collects username in form)
  - Calculates engagement score (Q1-Q9 only)
  - Appends to `Monthly_CheckIns` sheet
  - Same data structure as web form

**Advantages:**
- Works on any device (mobile-friendly)
- No app login required
- Can be shared via WhatsApp link
- Paper form option (offline collection, later entered into sheet)

**Disadvantages:**
- Less integrated UX
- Requires participant identification (username collection in form)

### 3.2 WhatsApp Integration

**Option:** Submit check-in via WhatsApp bot or broadcast.

**Implementation:**
- **WhatsApp Broadcast (Preferred - mentioned in plan):**
  - Send monthly reminder message with link to Google Form or web form
  - Low technical complexity
  - Uses existing WhatsApp Business account
  - Participants click link to submit form
  
- **WhatsApp Bot (Advanced option):**
  - WhatsApp Business API setup
  - Bot collects 10 questions sequentially via chat
  - Submits to same backend endpoint
  - More complex, but very accessible for users
  - Can send engagement score back immediately

**Recommendation:** Start with WhatsApp Broadcast (link to form) + web form + Google Form options, add WhatsApp Bot later if needed.

---

## 4. Data Architecture

### 4.1 New Google Sheets Tabs

1. **`Monthly_CheckIns`** (Primary data store)
   - All monthly submissions
   - Engagement scores
   - Historical tracking

2. **`Registration_Requests`** (Onboarding - new)
   - Pending/approved/rejected registration requests
   - Assigned usernames
   - Approval status

3. **`Assessment_Queue`** (Onboarding - new)
   - Participants requesting assessments
   - Assessment status (Pending/Scheduled/Completed)

4. **`Quarterly_Verifications`** (Verification tracking)
   - 10% sample verifications
   - Verifier notes

5. **`Digital_Health_Index`** (Aggregated view - replaces "Engagement_Scores")
   - Current scores per participant
   - Sector averages (Digital Health Index per sector)
   - Monthly trends
   - Calculated fields (formulas)
   - Support needs summary

6. **`Recognition_History`** (Optional)
   - Quarterly badges/awards
   - Historical winners

### 4.2 Database Schema (Alternative to Sheets)

If moving to Firebase/Firestore in future:
```
collections/
  monthly_checkins/
    {checkinId}:
      participantId: string
      month: string (YYYY-MM)
      responses: object
      engagementScore: number
      timestamp: timestamp
  
  engagement_scores/
    {participantId}:
      currentScore: number
      history: array
      lastUpdated: timestamp
```

---

## 5. Implementation Phases

### Phase 1: Core Check-In System (Weeks 1-2)
- ✅ Transform ParticipantDetail page into tabbed profile:
  - Keep existing "My Assessment" tab (2025 data)
  - Add "Monthly Check-In" tab (form)
  - Add "My Engagement" tab (tracking)
- ✅ Monthly check-in form component
- ✅ Backend API endpoint
- ✅ Google Sheets integration
- ✅ Engagement score calculation
- ✅ Basic engagement display in "My Engagement" tab

### Phase 1.5: Participant Onboarding (Week 2-3)
- ✅ Public registration form (`/register` route)
- ✅ Sector selection dropdown
- ✅ Assessment request option
- ✅ Admin approval interface (`/admin/onboarding`)
- ✅ Auto-username generation
- ✅ Welcome email system
- ✅ Integration with auth sheet
- ✅ Assessment queue tracking

### Phase 2: Dashboard Enhancements (Weeks 2-3)
- ✅ Engagement visualization (charts)
- ✅ Sector averages
- ✅ Admin dashboard enhancements
- ✅ Top performers view

### Phase 3: Verification & Reporting (Weeks 3-4)
- ✅ Quarterly verification interface
- ✅ Report generation (PDF)
- ✅ Recognition system

### Phase 4: Automation & Integration (Weeks 4-5)
- ✅ Google Form integration (optional)
- ✅ Monthly pulse emails/WhatsApp
- ✅ Quarterly snapshot automation
- ✅ Visibility feed for tourismcommons.org

---

## 6. Technical Specifications

### 6.1 Frontend Components (New)

```
tools/digital-assessment/src/
  components/
    monitoring/
      MonthlyCheckInForm.tsx          # Form component (used in participant profile)
      EngagementChart.tsx              # Trend chart for engagement history
      RecognitionBadges.tsx            # Badge display component
      EngagementScoreBadge.tsx         # Score interpretation badge
      QuarterlyReportGenerator.tsx     # Admin report generator
    onboarding/
      ParticipantRegistrationForm.tsx  # Public registration form
      SectorSelector.tsx                # Sector dropdown component
  pages/
    ParticipantDetail.tsx             # UPDATED: Transform into tabbed profile
      - Tabs: "My Assessment" | "Monthly Check-In" | "My Engagement"
    Register.tsx                       # NEW: Public registration page
    admin/
      Verification.tsx                # Verification interface
      MonitoringDashboard.tsx          # Admin monitoring overview
      Onboarding.tsx                  # NEW: Admin approval interface
      AssessmentQueue.tsx              # NEW: Assessment request queue
```

### 6.2 Backend Endpoints (New)

```typescript
POST   /api/monitoring/checkin
GET    /api/monitoring/engagement/:username
GET    /api/monitoring/sector-averages
GET    /api/monitoring/top-performers
GET    /api/monitoring/submission-rate
POST   /api/monitoring/verify/:checkinId
GET    /api/monitoring/quarterly-report/:quarter

# Onboarding endpoints (new)
POST   /api/onboarding/register           # Submit registration request
GET    /api/onboarding/requests           # Admin: list pending requests
POST   /api/onboarding/approve/:requestId # Admin: approve registration
POST   /api/onboarding/reject/:requestId  # Admin: reject registration
GET    /api/sectors                      # List all sectors (for dropdown)
GET    /api/onboarding/queue             # Admin: assessment queue
```

### 6.3 Google Apps Script (Optional)

For email/WhatsApp automation:
- Monthly pulse trigger
- Form submission handler (if using Google Form)
- Report generation helpers

---

## 7. User Experience Flow

### Participant Profile Page Layout

After login, participants land on their profile page with **3 tabs**:

```
┌─────────────────────────────────────────────────────────┐
│  [My Assessment] [Monthly Check-In] [My Engagement]    │  ← Tab Navigation
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Tab Content (changes based on selected tab)           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Tab 1: "My Assessment"** (Default - existing data)
- ✅ 2025 Assessment Scores
- ✅ Digital Presence & Links  
- ✅ Sentiment Analysis
- ✅ Recommendations
- *(All existing ParticipantDetail content)*

**Tab 2: "Monthly Check-In"** (New - form submission)
- If **not submitted this month:**
  - 📋 Monthly Digital Health Check form (10 questions)
  - ⏱️ "Takes 60-90 seconds" indicator
  - 📅 Current month indicator
  - Submit button
- If **already submitted:**
  - ✅ "Already submitted for [Month]" confirmation
  - 📊 Last month's Engagement Score displayed
  - 🔗 "View My Engagement" link button

**Tab 3: "My Engagement"** (New - tracking & trends)
- 🎯 Current Engagement Score (0-9) with badge
- 📈 Monthly trend chart (line graph, last 6 months)
- 📊 Sector comparison card (Digital Health Index)
- 🏆 Recognition badges (if applicable)
- ⚠️ Support needs alert (if Q10=Yes)
- 🔗 "Submit This Month's Check-In" button

### Participant Flow:
1. **Login** → Automatically redirected to `/participant/{name}` (their profile page)
2. **Land on Profile** → Default tab: "My Assessment" (shows 2025 data)
3. **First Visit This Month:**
   - Navigate to "Monthly Check-In" tab
   - See form with 10 questions (organized by digital dimension)
   - Complete form (60-90 seconds)
   - Submit → See success confirmation with calculated Engagement Score
4. **After Submission:**
   - Switch to "My Engagement" tab
   - See current score with badge (Low/Moderate/High)
   - View monthly trend chart
   - Compare to sector average (Digital Health Index)
   - See any recognition badges
5. **Return Visits:**
   - "Monthly Check-In" tab shows "Already submitted" message
   - Can view assessment data anytime in "My Assessment" tab
   - Can track progress in "My Engagement" tab

### New Participant Onboarding Flow:
1. **Visit Site** → Sees "Join the Program" button on homepage
2. **Click Register** → `/register` page (public, no login required)
3. **Fill Registration Form:**
   - Organization/Individual Name
   - Select Sector (dropdown)
   - Contact Email & Phone/WhatsApp
   - Optionally check "Request Assessment"
   - Submit
4. **Confirmation** → "Thank you! Registration pending approval. You'll receive an email when ready."
5. **Admin Reviews** → (Admin sees pending request in `/admin/onboarding`)
6. **Approval** → System auto-generates username, adds to auth sheet
7. **Welcome Email** → Participant receives email with username and login link
8. **Login** → Participant logs in, sees their profile page
9. **Start Monitoring** → Can immediately submit monthly check-in (if assessment not requested) or wait for assessment (if requested)

### Admin Flow:
1. **Login** → Monitoring dashboard
2. **View** → Sector averages, submission rates, top performers
3. **Onboarding Management:**
   - Check `/admin/onboarding` for pending registrations
   - Review, approve/reject with custom username option
   - Monitor assessment queue for requested assessments
4. **Quarter End** → Generate quarterly report, verify 10% sample
5. **Recognition** → Select and feature top performers

---

## 8. Sustainability Considerations

✅ **Free Tools:** All using Google Sheets + Firebase (free tier)  
✅ **No New Infrastructure:** Builds on existing auth and API  
✅ **Manageable:** Existing GT Board Digital Desk can maintain  
✅ **Scalable:** Can handle growth in participants

---

## 9. Success Metrics

- **Monthly Submission Rate:** Target 70%+ of participants
- **Engagement Score Average:** Track sector-wide trends
- **Quarterly Verification:** 100% of 10% sample verified
- **User Adoption:** Participant login frequency

---

## 10. Open Questions & Decisions Needed

1. **Form Submission Method:** Web form only, or also Google Form/WhatsApp? (Plan mentions WhatsApp broadcast + Google Form)
2. **Question Consistency:** Keep same 10 questions for at least 6 months (as per plan) - ✅ Confirmed
3. **Verification Selection:** Random 10% or manual selection by sector focal points?
4. **WhatsApp Contact Info:** Need WhatsApp numbers in `dashboard_auth` sheet for broadcast (add column?)
5. **Historical Data:** Import any existing baseline engagement data?
6. **Recognition Display:** Public (tourismcommons.org) or dashboard-only?
7. **Paper Forms:** How to handle paper form submissions (during meetings)? Manual entry by GT Board?
8. **Engagement Score Interpretation:** Automatically flag low engagement (0-3) for association follow-up?
9. **Q10 Scoring:** The original plan says "Sum of 10 questions = Engagement Score (10 = highly active)". Should Q10 (support needs) contribute to score? Current proposal excludes it (max = 9). If Q10 counts, max = 10.
10. **Onboarding Approval:** Auto-approve registrations or require manual admin approval? (Recommendation: Manual approval for quality control)
11. **Username Assignment:** Auto-generate usernames or let participants choose? (Recommendation: Auto-generate, admin can override)
12. **Welcome Email:** Use email service (SendGrid) or Google Apps Script email triggers?

---

## 11. Next Steps

1. **Review & Approve** this proposal with stakeholders
2. **Answer open questions** (Section 10)
3. **Prioritize phases** (may want to start with Phase 1 only)
4. **Assign development** tasks
5. **Set up Google Sheets** tabs (can be done immediately)
6. **Begin Phase 1** implementation

---

## Appendix: Similar Systems Reference

**CBT Monitoring System** (`tools/cbt-monitoring/`):
- Similar form submission pattern
- Google Sheets integration
- Can be referenced for form component structure

**Files to Review:**
- `tools/cbt-monitoring/src/pages/UpdateForm.tsx` (form structure)
- `tools/cbt-monitoring/docs/IMPLEMENTATION_PLAN.md` (implementation approach)

---

**Document Status:** Draft Proposal  
**Next Review:** Stakeholder feedback required  
**Estimated Implementation:** 4-5 weeks for full system, 2 weeks for MVP (Phase 1)

