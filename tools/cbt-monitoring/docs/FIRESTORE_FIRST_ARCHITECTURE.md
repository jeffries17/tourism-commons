# Firestore-First Architecture

**You don't need Google Sheets!** The CBT Monitoring system now uses **Firestore as the primary data source**, with Google Sheets as an optional backup/export feature.

---

## 🎯 Architecture Overview

### Primary Flow (Firestore-First)
```
Form Submission → Firestore → Dashboard
Admin UI → Firestore → Dashboard
```

### Optional Backup Flow (if CBT_SHEET_ID configured)
```
Form Submission → Firestore → (optional) Google Sheet
```

---

## ✅ Benefits of Firestore-First Approach

1. **No Google Sheets Required** - Everything works through the admin UI
2. **Real-time Updates** - Changes appear instantly in dashboard
3. **Better Performance** - Direct database queries, no Sheet API limits
4. **Full Admin Control** - Manage communities entirely through admin interface
5. **Simpler Setup** - No Sheet formulas, no sync scripts needed
6. **Optional Backup** - Can still sync to Sheets if desired (set `CBT_SHEET_ID`)

---

## 📊 Data Structure

### Firestore Collections

**`communities` Collection**
```typescript
{
  id: string (auto-generated)
  community: string
  region: string
  contactPerson: string
  contactInfo: string
  responsibleStaff: string
  nextVisit: Date | null
  authority: string (e.g., 'eswatini')
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**`responses` Collection** (Form Submissions)
```typescript
{
  id: string (auto-generated)
  staffName: string
  community: string
  dateOfInteraction: Date
  engagementType: string[]
  updateSummary: string
  contentProduced: string[]
  supportNeeded: string
  nextPlannedVisit: Date | null
  authority: string
  createdAt: Timestamp
  timestamp: Timestamp
}
```

---

## 🔧 Setup Instructions

### 1. Initialize Firestore

**No Google Sheets needed!** Just set up Firestore:

1. **Enable Firestore** in Firebase Console
2. **Create Collections:**
   - `communities` (for community master list)
   - `responses` (for form submissions)

3. **Set Security Rules** (example):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Communities: read for all authenticated, write for admins
    match /communities/{communityId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Responses: read/write for authenticated users
    match /responses/{responseId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 2. Add Communities via Admin UI

**No manual Sheet editing needed!**

1. Go to: `/cbt-monitoring/eswatini/admin/communities`
2. Click "Add Community"
3. Fill in:
   - Community Name
   - Region
   - Contact Person
   - Contact Info
   - Responsible Staff
   - Next Visit (optional)
4. Click "Save"

**That's it!** The community appears in the dashboard immediately.

### 3. Optional: Enable Google Sheets Backup

If you want to keep a Google Sheet backup (optional):

1. Set environment variable: `CBT_SHEET_ID=your-sheet-id`
2. Form submissions will automatically sync to Sheet
3. If Sheet sync fails, it won't break the system (non-blocking)

---

## 🎮 Using the Admin Interface

### Managing Communities

**Access:** `/cbt-monitoring/eswatini/admin/communities`

**Features:**
- ✅ **Add Community** - Click "+ Add Community" button
- ✅ **Edit Community** - Click "Edit" on any row
- ✅ **Delete Community** - Click "Delete" (with confirmation)
- ✅ **View All** - See all communities in table format

**No Google Sheets access needed!** Everything is managed through the UI.

### Form Submissions

**Access:** `/cbt-monitoring/eswatini/update`

Form submissions go directly to Firestore:
- ✅ Instant save to database
- ✅ Dashboard updates automatically
- ✅ Status calculated in real-time
- ✅ Optional Sheet backup (if configured)

---

## 📈 How Status is Calculated

Status is calculated **on-the-fly** from Firestore data:

1. **Fetch all responses** for a community
2. **Find most recent** `dateOfInteraction`
3. **Calculate days since** last update
4. **Assign status:**
   - 🟢 Green: ≤14 days
   - 🟡 Yellow: 15-28 days
   - 🔴 Red: 29+ days

**No Sheet formulas needed!** Everything calculated in the API.

---

## 🔄 Migration from Google Sheets (if needed)

If you have existing data in Google Sheets:

1. **Export Sheet data** to CSV
2. **Use admin UI** to add communities manually
3. **Or create import script** to bulk import to Firestore

**Going forward:** Use admin UI only, no Sheets needed!

---

## 🚫 What You DON'T Need

- ❌ Google Sheets setup
- ❌ Sheet formulas
- ❌ Apps Script sync functions
- ❌ Manual Sheet editing
- ❌ Sheet API credentials (unless using backup)

---

## ✅ What You DO Need

- ✅ Firebase project with Firestore enabled
- ✅ Admin access to `/admin/communities` page
- ✅ Firestore security rules configured
- ✅ (Optional) `CBT_SHEET_ID` if you want backup

---

## 🎯 Summary

**The system is now Firestore-first:**

1. **Admin UI** manages communities → No Sheets needed
2. **Form submissions** go to Firestore → No Sheets needed
3. **Dashboard** reads from Firestore → No Sheets needed
4. **Google Sheets** is optional backup only → Set `CBT_SHEET_ID` if desired

**You can completely eliminate Google Sheets dependency!**

---

## 📝 Next Steps

1. **Set up Firestore** collections (`communities`, `responses`)
2. **Add communities** via admin UI
3. **Test form submission** → Verify appears in dashboard
4. **Remove Google Sheets** from workflow (optional)
5. **Enjoy simpler, faster system!**

---

**Questions?** The admin interface handles everything. No Google Sheets knowledge required!

