# Quick Authentication Test Checklist

## ✅ Test 1: Non-Logged-In User Redirect
**Goal:** Confirm users are redirected to login when not authenticated

1. Open browser to: `http://localhost:5173`
2. **Expected:** Automatically redirected to `/login` page
3. **You should see:** 
   - "Digital Assessment Dashboard" header
   - Username input field
   - "Login" button
   - Footer with `alex.jeffries@gmail.com` for access questions

---

## ✅ Test 2: Admin Login & Full Access
**Goal:** Test admin can access everything

1. On login page, enter username: `ajeffries`
2. Click "Login"
3. **Expected:**
   - Redirected to Dashboard (`/`)
   - See full navigation: Dashboard, Participants, Sectors, Region, ITO Perception, Reviews & Sentiment, Methodology
   - Top-right shows: "Alex Jeffries" | "Administrator" | "Logout" button
   - Dashboard loads with all data

4. Try clicking through navigation:
   - ✅ Dashboard
   - ✅ Participants (see full list)
   - ✅ Sectors
   - ✅ Region
   - ✅ All other pages

---

## ✅ Test 3: Participant Login & Limited Access
**Goal:** Test participant only sees their page

1. Click "Logout"
2. Login with username: `capitalfm`
3. **Expected:**
   - Redirected to `/participant/Capital%20FM`
   - See "Capital FM" organization page with their data
   - **NO navigation menu** (only logo and logout)
   - Top-right shows: "Capital FM" | "Participant" | "Logout"

4. Try to access admin page manually:
   - Type in browser: `http://localhost:5173/participants`
   - **Expected:** See "Access Denied" message

5. Try to view another participant's page:
   - Type in browser: `http://localhost:5173/participant/Paradise%20FM`
   - **Expected:** "Access Denied - You can only view your own organization's data"

---

## ✅ Test 4: Login Tracking
**Goal:** Verify login counts are being tracked

1. While logged in as `capitalfm`, note the login
2. Logout and login again as `capitalfm`
3. Open Google Sheet: https://docs.google.com/spreadsheets/d/1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM/edit
4. Go to `dashboard_auth` tab
5. Find "Capital FM" row
6. **Expected:** 
   - Column E (login_count) should show 2 (or more if you logged in multiple times)
   - Column F (last_login) should show recent timestamp

---

## ✅ Test 5: Session Persistence
**Goal:** Verify session survives page refresh

1. While logged in (any user)
2. Refresh the browser page (F5 or Cmd+R)
3. **Expected:**
   - Still logged in
   - Don't get redirected to login page
   - User info still shows in header

---

## ✅ Test 6: Invalid Username
**Goal:** Test error handling

1. Logout
2. Try to login with: `invalidusername123`
3. **Expected:**
   - Error message: "Invalid username"
   - Stay on login page
   - Can try again

---

## Test Users

### Admins (Full Access)
- `ajeffries` - Alex Jeffries
- `fthomas` - Frederic Thomas  
- `rcira` - Ruat Cira

### Sample Participants (Limited Access)
**CI Assessment:**
- `capitalfm` - Capital FM
- `kerrfatou` - Kerr Fatou
- `paradisefm` - Paradise FM
- `tanjivillagemus` - Tanji Village Museum

**TO Assessment:**
- `westafricantou` - West African Tours
- `fatoutours` - Fatou Tours
- `archtours` - Arch Tours

---

## URLs

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5001
- **Google Sheet:** https://docs.google.com/spreadsheets/d/1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM/edit

---

## If Something's Not Working

### Backend not responding
```bash
# Check if backend is running
curl http://localhost:5001/api/health

# Should return: {"ok":true}
```

### Frontend can't reach backend
- Check browser console (F12) for errors
- Verify proxy configuration in `vite.config.ts`

### Login count not updating in sheet
- Wait 2-3 seconds after login
- Refresh Google Sheet
- Check backend terminal for errors

---

*Last Updated: October 10, 2025*

