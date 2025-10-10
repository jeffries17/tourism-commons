# Authentication Implementation Plan

## Overview
Simple Google Sheets-based authentication system for the Digital Assessment Dashboard providing privacy-gated access to participant data and full platform access for ITC team members.

**Priority:** Privacy over security - this is an access control mechanism, not a security system.

---

## 1. Google Sheets Setup

### Sheet Structure
**Sheet Name:** `dashboard_users` (or similar)

| Column | Header | Example Value | Description |
|--------|--------|---------------|-------------|
| A | full_name | John Smith | Display name |
| B | username | johnsmith | Login identifier (2-3 words, no spaces) |
| C | role | participant | Either "participant" or "admin" |
| D | participant_id | PART_001 | Unique ID linking to their data (empty for admins) |

### Example Data
```
full_name          | username    | role        | participant_id
-------------------|-------------|-------------|---------------
John Smith         | johnsmith   | participant | PART_001
Alex Jeffries      | ajeffries   | admin       | 
Ruat [Last]        | r[last]     | admin       |
Frederic [Last]    | f[last]     | admin       |
Jane Doe           | janedoe     | participant | PART_002
```

### Google Sheets API Setup
1. Create/use existing Google Cloud Project
2. Enable Google Sheets API
3. Create API credentials:
   - **Option A (Simple):** API Key with HTTP referrer restrictions
   - **Option B (Better):** OAuth 2.0 Client ID
4. Share sheet with appropriate permissions
5. Get Sheet ID from URL

---

## 2. Architecture Overview

### Authentication Flow
```
User visits site
    ↓
Login page (if not authenticated)
    ↓
Enter username → Query Google Sheets
    ↓
Valid username?
    ├─ No → Error message
    └─ Yes → Store auth in localStorage
        ↓
    Check role
        ├─ admin → Full dashboard access
        └─ participant → Filtered view of their data only
```

### State Management
- **Auth Context:** React Context for global auth state
- **Local Storage:** Persist login session
- **Protected Routes:** Wrapper components for route protection

---

## 3. Technical Implementation

### 3.1 New Files to Create

```
digital_assessment/dashboard/
├── src/
│   ├── contexts/
│   │   └── AuthContext.tsx          # Auth state & Google Sheets integration
│   ├── components/
│   │   ├── Login.tsx                # Login form component
│   │   └── ProtectedRoute.tsx       # Route wrapper for auth
│   ├── services/
│   │   └── googleSheetsAuth.ts      # Google Sheets API calls
│   ├── types/
│   │   └── auth.ts                  # TypeScript types for auth
│   └── utils/
│       └── authHelpers.ts           # Helper functions
```

### 3.2 Modified Files

```
digital_assessment/dashboard/
├── src/
│   ├── App.tsx                      # Wrap with AuthProvider, add routes
│   ├── pages/
│   │   ├── ReviewsSentiment.tsx     # Add participant filtering
│   │   └── [other pages]            # Add participant filtering
│   └── components/
│       └── Navigation.tsx           # Add role-based menu items
├── .env.local                       # Add Google API credentials
└── package.json                     # Add dependencies if needed
```

---

## 4. Detailed Implementation Steps

### Step 1: Google Cloud Setup
- [ ] Create Google Cloud project (or use existing)
- [ ] Enable Google Sheets API
- [ ] Create credentials (API Key or OAuth)
- [ ] Set up restrictions (HTTP referrers)
- [ ] Document Sheet ID and API key

### Step 2: Google Sheet Creation
- [ ] Create authentication sheet
- [ ] Set up column headers
- [ ] Add ITC team members (ajeffries, etc.)
- [ ] Add test participant entries
- [ ] Set appropriate sharing permissions
- [ ] Test API access manually

### Step 3: Core Auth Service
**File:** `src/services/googleSheetsAuth.ts`
- [ ] Create Google Sheets API client
- [ ] Implement `validateUsername(username: string)` function
- [ ] Implement `getUserData(username: string)` function
- [ ] Add error handling and rate limiting
- [ ] Add caching layer (optional, recommended)

### Step 4: Auth Context
**File:** `src/contexts/AuthContext.tsx`
- [ ] Create AuthContext with:
  - `user: User | null`
  - `login(username: string): Promise<void>`
  - `logout(): void`
  - `isAuthenticated: boolean`
  - `isAdmin: boolean`
  - `participantId: string | null`
- [ ] Implement localStorage persistence
- [ ] Add loading states
- [ ] Export AuthProvider and useAuth hook

### Step 5: Login Component
**File:** `src/components/Login.tsx`
- [ ] Create login form (username input only)
- [ ] Call auth context login method
- [ ] Show loading state during validation
- [ ] Display error messages
- [ ] Redirect on success

### Step 6: Protected Routes
**File:** `src/components/ProtectedRoute.tsx`
- [ ] Create wrapper component
- [ ] Check authentication status
- [ ] Check role-based permissions
- [ ] Redirect to login if not authenticated
- [ ] Show "Access Denied" for wrong role

### Step 7: Update App Router
**File:** `src/App.tsx`
- [ ] Wrap app with AuthProvider
- [ ] Add login route
- [ ] Wrap existing routes with ProtectedRoute
- [ ] Add role checks for admin-only pages
- [ ] Add redirect logic

### Step 8: Add Participant Filtering
**Files:** `src/pages/*.tsx`
- [ ] Update data queries to filter by participant_id
- [ ] Add "viewing as" indicator for admins
- [ ] Hide admin features from participants
- [ ] Update navigation based on role

### Step 9: UI Enhancements
- [ ] Add logout button to navigation
- [ ] Show current user name
- [ ] Add role indicator (Admin/Participant)
- [ ] Create welcome message on first login
- [ ] Style login page

### Step 10: Testing & Documentation
- [ ] Test login flow with various usernames
- [ ] Test admin access to all pages
- [ ] Test participant access (filtered views)
- [ ] Test logout functionality
- [ ] Test session persistence
- [ ] Create user guide for ITC team
- [ ] Document how to add new users to sheet

---

## 5. Configuration

### Environment Variables
Create/update `.env.local`:
```
VITE_GOOGLE_SHEETS_API_KEY=your_api_key_here
VITE_AUTH_SHEET_ID=your_sheet_id_here
VITE_AUTH_SHEET_NAME=dashboard_users
```

### TypeScript Types
```typescript
// src/types/auth.ts
export interface User {
  fullName: string;
  username: string;
  role: 'admin' | 'participant';
  participantId?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  participantId: string | null;
}
```

---

## 6. Data Linking Strategy

### Participant Data Identification
To filter data by participant, we need to ensure all data sources have a participant identifier:

1. **Review existing data structure:**
   - Identify participant ID field in current data
   - May be: `participant_id`, `user_id`, `business_id`, etc.

2. **Update data queries:**
   - Add participant filter to API calls
   - Update Firestore queries with where clause
   - Filter local data arrays

3. **Admin override:**
   - Admins see all data (no filter applied)
   - Optional: Admin can "view as" specific participant

---

## 7. Security Considerations

### What This Provides
✅ Privacy gate - users need valid username to access
✅ Role-based access control
✅ Simple user management via Google Sheets
✅ Easy to add/remove users

### What This Does NOT Provide
❌ Password protection
❌ Protection against determined attackers
❌ Session timeouts/expiration
❌ Audit logging
❌ Account lockouts

### Recommendations
1. **Use HTTPS** - ensure dashboard is served over HTTPS
2. **API Key Restrictions** - restrict by HTTP referrer in Google Cloud
3. **Sheet Permissions** - only ITC team can edit the auth sheet
4. **Session Duration** - consider adding session expiration (optional)
5. **Disclaimer** - add note about privacy-only nature on login page

---

## 8. Future Enhancements (Optional)

### Phase 2 Features
- [ ] Session timeout (auto-logout after inactivity)
- [ ] Password field (optional, simple password check)
- [ ] Email notifications on login
- [ ] Activity logging
- [ ] "Remember me" functionality
- [ ] Multi-language support for login page
- [ ] Forgot username feature (email lookup)

### Phase 3 Features
- [ ] Move to proper authentication service (Firebase Auth, Auth0)
- [ ] Two-factor authentication
- [ ] SSO integration
- [ ] Granular permissions system

---

## 9. Timeline Estimate

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Setup | Google Cloud + Sheet creation | 1-2 hours |
| Core Auth | Service + Context + Types | 3-4 hours |
| UI Components | Login + Protected Routes | 2-3 hours |
| Integration | Update existing pages | 3-4 hours |
| Testing | All scenarios + fixes | 2-3 hours |
| Documentation | User guide + code docs | 1-2 hours |
| **Total** | | **12-18 hours** |

---

## 10. Testing Checklist

### Authentication Flow
- [ ] Login with valid participant username
- [ ] Login with valid admin username
- [ ] Login with invalid username (error handling)
- [ ] Login with empty username (validation)
- [ ] Logout functionality
- [ ] Session persistence (refresh page)
- [ ] Session cleared after logout

### Access Control
- [ ] Participant sees only their data
- [ ] Participant cannot access admin routes
- [ ] Admin sees all data
- [ ] Admin can access all routes
- [ ] Unauthenticated user redirected to login
- [ ] Direct URL access blocked when not authenticated

### Edge Cases
- [ ] Google Sheets API unavailable (error handling)
- [ ] Multiple tabs (session sync)
- [ ] Browser back button
- [ ] Clear localStorage (logout state)
- [ ] Network errors during login
- [ ] Sheet data format errors

---

## 11. Rollout Plan

### Pre-Launch
1. Set up Google Sheet with ITC team accounts
2. Deploy authentication system to staging
3. Test with ITC team members
4. Create user onboarding guide
5. Add participant accounts to sheet

### Launch
1. Deploy to production
2. Notify ITC team of new login requirement
3. Send credentials to participants
4. Monitor for issues

### Post-Launch
1. Gather feedback from users
2. Fix any issues
3. Add participants as they join
4. Regular sheet maintenance

---

## 12. Support & Maintenance

### Adding New Users
1. Open Google Sheet
2. Add row with: full_name, username, role, participant_id
3. User can login immediately (no deployment needed)

### Removing Users
1. Delete row from Google Sheet
2. User is logged out on next page load

### Troubleshooting
- Check Google Cloud Console for API errors
- Verify Sheet ID in environment variables
- Check browser console for errors
- Verify sheet sharing permissions
- Check API key restrictions

---

## Contact & Questions

**Implementation Lead:** Alex Jeffries (ajeffries)

**Questions to Resolve Before Starting:**
1. Confirm participant_id field name in existing data
2. Confirm full names for Ruat and Frederic
3. Confirm which pages should be admin-only vs participant-accessible
4. Decide on session persistence duration
5. Confirm staging environment for testing

---

*Last Updated: October 10, 2025*


