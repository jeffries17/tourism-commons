# Authentication System - Testing Guide

## Overview

The authentication system is now fully implemented with:
- ✅ Google Sheets-based user management
- ✅ Login tracking (counts and timestamps)
- ✅ Role-based access control (Admin vs Participant)
- ✅ Protected routes
- ✅ Participant data isolation

---

## What's Been Built

### Backend (Firebase Functions)
- **POST `/api/auth/login`** - Validates username and returns user data
- Automatically updates login count and last login timestamp in Google Sheets
- Reads from `dashboard_auth` tab in your Google Sheet

### Frontend (React Dashboard)
- **Login Page** (`/login`) - Username-only authentication
- **Auth Context** - Global authentication state management
- **Protected Routes** - All routes now require login
- **Role-based Navigation** - Admins see full menu, participants see only their page
- **Access Control** - Participants can only view their own data

### Google Sheet Structure
**Tab:** `dashboard_auth`

| Column | Name | Type | Description |
|--------|------|------|-------------|
| A | Name of User/Organization | string | Full name/org name |
| B | User Name | string | Login username (lowercase, no spaces) |
| C | Role | string | "admin" or "participant" |
| D | Notes | string | Optional notes (sector, source) |
| E | login_count | number | Number of times logged in |
| F | last_login | datetime | ISO timestamp of last login |

**Current Users:**
- 3 ITC Team Admins (ajeffries, fthomas, rcira)
- 61 CI Assessment Participants
- 23 TO Assessment Participants
- **Total: 87 users**

---

## Testing Instructions

### Prerequisites

1. **Start the Firebase Functions backend:**
   ```bash
   cd digital_assessment/functions
   npm run dev
   # Should run on http://localhost:5001
   ```

2. **Start the React dashboard:**
   ```bash
   cd digital_assessment/dashboard
   npm run dev
   # Should run on http://localhost:5173
   ```

### Test Cases

#### ✅ Test 1: Admin Login
1. Navigate to `http://localhost:5173` (should redirect to `/login`)
2. Enter username: `ajeffries`
3. Click "Login"
4. **Expected:**
   - Redirected to Dashboard (`/`)
   - See full navigation menu (Dashboard, Participants, Sectors, etc.)
   - See "Alex Jeffries" and "Administrator" in top-right
   - See "Logout" button

#### ✅ Test 2: Participant Login
1. Logout (click Logout button)
2. Login again with username: `capitalfm`
3. **Expected:**
   - Redirected to `/participant/Capital%20FM`
   - See only "Capital FM" organization page
   - No navigation menu visible (only logo/header)
   - See "Capital FM" and "Participant" in top-right
   - See "Logout" button

#### ✅ Test 3: Invalid Username
1. Logout
2. Try to login with username: `invaliduser`
3. **Expected:**
   - Error message: "Invalid username"
   - Stay on login page

#### ✅ Test 4: Route Protection (Logged Out)
1. Make sure you're logged out
2. Try to navigate to `http://localhost:5173/participants`
3. **Expected:**
   - Redirected to `/login`

#### ✅ Test 5: Admin-Only Routes (Participant Access)
1. Login as participant: `capitalfm`
2. Try to navigate to `http://localhost:5173/participants`
3. **Expected:**
   - See "Access Denied" page
   - Message: "This page is only accessible to administrators"

#### ✅ Test 6: Participant Data Isolation
1. Login as participant: `capitalfm`
2. Try to navigate to another org: `http://localhost:5173/participant/Paradise%20FM`
3. **Expected:**
   - See "Access Denied" page
   - Message: "You can only view your own organization's data"

#### ✅ Test 7: Login Count Tracking
1. Login as any user (e.g., `ajeffries`)
2. Check the Google Sheet `dashboard_auth` tab
3. Find the user's row
4. **Expected:**
   - Column E (login_count) incremented by 1
   - Column F (last_login) updated with current timestamp

#### ✅ Test 8: Session Persistence
1. Login as any user
2. Refresh the page
3. **Expected:**
   - Still logged in (don't get redirected to login)
   - User info still shows in header

#### ✅ Test 9: Logout
1. While logged in, click "Logout" button
2. **Expected:**
   - Redirected to `/login`
   - Try to go to `/` - should redirect back to login

---

## Test User Credentials

### Admins (ITC Team)
- `ajeffries` - Alex Jeffries
- `fthomas` - Frederic Thomas
- `rcira` - Ruat Cira

### Sample Participants (CI Assessment)
- `capitalfm` - Capital FM
- `kerrfatou` - Kerr Fatou
- `paradisefm` - Paradise FM
- `abukopotterycen` - Abuko Pottery Center
- `tanjivillagemus` - Tanji Village Museum

### Sample Participants (TO Assessment)
- `westafricantou` - West African Tours
- `timotoursgambi` - Timo Tours Gambia
- `fatoutours` - Fatou Tours
- `archtours` - Arch Tours

**Full list:** See Column B in `dashboard_auth` tab of your Google Sheet

---

## Checking Login Analytics

### View Login Counts
1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM/edit
2. Go to `dashboard_auth` tab
3. Column E shows login counts for each user
4. Column F shows last login timestamp

### Create a Simple Report
You can sort or filter the sheet to see:
- Most active users (sort by Column E, descending)
- Recent logins (sort by Column F, descending)
- Users who never logged in (Column E = 0)

---

## Troubleshooting

### Issue: "Invalid username" but username is correct
- Check that username is lowercase and has no spaces
- Check Column B in `dashboard_auth` tab for exact username

### Issue: Backend not responding
- Make sure Firebase Functions are running: `cd functions && npm run dev`
- Check terminal for errors
- Verify backend is on `http://localhost:5001`

### Issue: Frontend can't reach backend
- Check `dashboard/vite.config.ts` for proxy configuration
- Make sure proxy points to `http://localhost:5001`

### Issue: Login count not updating
- Check that service account has write permissions to the sheet
- Check backend terminal for errors
- The count update is asynchronous - check sheet after ~2 seconds

### Issue: Participant sees admin menu
- Clear browser localStorage: 
  - Open DevTools → Application → Local Storage → Clear
  - Refresh page
  - Login again

---

## Next Steps (Optional Enhancements)

### Phase 2 Features
- [ ] Add password field (optional simple password)
- [ ] Session timeout (auto-logout after inactivity)
- [ ] Email notifications on first login
- [ ] Welcome message for first-time users
- [ ] Download login analytics report

### Phase 3 Features
- [ ] Move to Firebase Authentication
- [ ] Add two-factor authentication
- [ ] Granular permissions (view-only, edit, etc.)
- [ ] User self-service password reset

---

## Security Notes

**What this provides:**
- ✅ Privacy gate - valid username required
- ✅ Role-based access control
- ✅ Data isolation for participants
- ✅ Usage analytics

**What this does NOT provide:**
- ❌ Password protection
- ❌ Protection against determined attackers
- ❌ Session expiration
- ❌ Audit logging beyond login counts

**Recommendation:** This is suitable for a privacy-gated internal dashboard. For public-facing or sensitive data, upgrade to Firebase Authentication or similar.

---

## Support

For issues or questions:
- **Technical:** Alex Jeffries (ajeffries)
- **Sheet Access:** Update permissions in Google Sheet
- **Add/Remove Users:** Edit `dashboard_auth` tab directly

---

*Last Updated: October 10, 2025*

