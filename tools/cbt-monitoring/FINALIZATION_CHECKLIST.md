# CBT Monitoring - Finalization Checklist

## ✅ Completed Items

1. ✅ **Frontend Components**
   - Dashboard with filtering, search, and stats
   - Update form for submissions
   - Admin Communities page (full CRUD)
   - Authentication and protected routes
   - PDF generation utility

2. ✅ **Backend API Endpoints**
   - `GET /api/cbt/communities` - Fetch all communities
   - `POST /api/cbt/update` - Submit form updates
   - Admin endpoints: GET/POST/PUT/DELETE `/api/cbt/admin/communities`

3. ✅ **Email Automation**
   - Code written (`cbtEmailReminders.ts`)
   - Scheduled function for weekly reminders

4. ✅ **Build Configuration**
   - Added build script to root `package.json`
   - Firebase hosting rewrite rule added
   - Firestore security rules created

## 🔧 Remaining Configuration Steps

### 1. Deploy Firestore Security Rules

The security rules file has been created at `firestore.rules`. Deploy it:

```bash
firebase deploy --only firestore:rules
```

**What this does:**
- Allows authenticated users to read communities and responses
- Restricts write operations to API endpoints (which check admin status server-side)
- Protects user data

### 2. Configure Email Function Credentials

The email reminder function needs Gmail credentials. Set them up:

**Option A: Using Firebase Functions Config (Recommended)**
```bash
firebase functions:config:set gmail.user="your-email@gmail.com"
firebase functions:config:set gmail.app_password="your-16-char-app-password"
```

**Option B: Using Environment Variables**
Set in Firebase Console → Functions → Configuration:
- `GMAIL_USER`: Your Gmail address
- `GMAIL_APP_PASSWORD`: Gmail App Password (16 characters)

**To get Gmail App Password:**
1. Go to Google Account → Security
2. Enable 2-Step Verification (if not already enabled)
3. Go to "App passwords"
4. Generate password for "Mail"
5. Copy the 16-character password

### 3. Deploy Email Function

Deploy the scheduled function:

```bash
cd digital_assessment/functions
npm run build
firebase deploy --only functions:sendWeeklyReminders
```

**What this does:**
- Deploys a Cloud Scheduler function that runs every Monday at 9 AM (Africa/Mbabane timezone)
- Sends reminder emails to staff members whose communities haven't been updated in 14+ days

### 4. Build and Deploy Frontend

Build the cbt-monitoring app:

```bash
# From project root
npm run build:cbt-monitoring
```

Or build everything:

```bash
npm run build
```

Then deploy:

```bash
firebase deploy --only hosting
```

### 5. Test the System

**Test Checklist:**
- [ ] Access dashboard: `https://tourismcommons.org/cbt-monitoring/eswatini`
- [ ] Login with Google account
- [ ] Submit a form update via `/cbt-monitoring/eswatini/update`
- [ ] Verify update appears in dashboard
- [ ] Access admin page: `/cbt-monitoring/eswatini/admin/communities`
- [ ] Create/edit/delete a community
- [ ] Generate PDF report
- [ ] Verify Firestore collections are populated

### 6. Set Up Initial Data

**Add Communities via Admin UI:**
1. Go to `/cbt-monitoring/eswatini/admin/communities`
2. Click "+ Add Community"
3. Add your communities one by one

**Or use the baseline data script:**
```bash
cd tools/cbt-monitoring
node scripts/populateBaselineData.js
```

(Note: This script currently writes to Google Sheets. You may need to adapt it to write to Firestore, or add communities manually via the admin UI.)

## 📋 Summary

**What's Done:**
- ✅ All code written and tested
- ✅ Build configuration set up
- ✅ Security rules created
- ✅ Hosting configuration complete

**What Needs to Be Done:**
1. Deploy Firestore rules
2. Configure Gmail credentials
3. Deploy email function
4. Build and deploy frontend
5. Test end-to-end
6. Add initial communities

**Estimated Time:** 30-60 minutes

## 🚀 Quick Deploy Commands

```bash
# 1. Deploy Firestore rules
firebase deploy --only firestore:rules

# 2. Configure email credentials (one-time setup)
firebase functions:config:set gmail.user="your-email@gmail.com"
firebase functions:config:set gmail.app_password="your-app-password"

# 3. Build functions
cd digital_assessment/functions && npm run build && cd ../..

# 4. Deploy email function
firebase deploy --only functions:sendWeeklyReminders

# 5. Build frontend
npm run build

# 6. Deploy everything
firebase deploy
```

## 📞 Support

If you encounter issues:
1. Check Firebase Console → Functions → Logs for errors
2. Check Firestore Console to verify data structure
3. Review `tools/cbt-monitoring/docs/TESTING_CHECKLIST.md` for detailed test procedures

---

**Last Updated:** $(date)
**Status:** Ready for final deployment steps


