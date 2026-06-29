# Admin Section Plan

## Overview
Instead of Google Sheets integration, we'll build a simple admin interface within the app for managing communities. This keeps everything in one place with real-time updates.

## Admin Features Needed

### 1. Community Management
**Page:** `/cbt-monitoring/eswatini/admin/communities`

**Features:**
- List all communities (table view)
- Add new community
- Edit existing community
- Delete community (with confirmation)
- Bulk actions (if needed)
- Export to CSV

**Fields to Edit:**
- Community Name
- Region
- Contact Person
- Contact Info (email/phone)
- Responsible Staff
- Initial Status

### 2. User/Staff Management (Optional)
**Page:** `/cbt-monitoring/eswatini/admin/users`

**Features:**
- List all staff/users
- Add new user
- Edit user (role, permissions)
- Disable user

### 3. Settings (Optional)
**Page:** `/cbt-monitoring/eswatini/admin/settings`

**Features:**
- Configure email recipients
- Set reminder frequency
- Configure status thresholds (14/28 days)
- Google Sheet export URL (optional, if they still want a backup)

## Implementation Approach

### Firestore Structure
```typescript
// Communities collection
communities/{communityId}
  - community: string
  - region: string
  - contactPerson: string
  - contactInfo: string
  - responsibleStaff: string
  - createdAt: timestamp
  - updatedAt: timestamp
  - authority: string // for multi-tenancy

// Responses collection (form submissions)
responses/{responseId}
  - staffName: string
  - community: string
  - dateOfInteraction: timestamp
  - engagementType: string[]
  - updateSummary: string
  - contentProduced: string[]
  - supportNeeded?: string
  - nextPlannedVisit?: timestamp
  - createdAt: timestamp
  - authority: string
```

### Admin Routes
- `/cbt-monitoring/eswatini/admin/communities` - Community management
- `/cbt-monitoring/eswatini/admin/users` - User management (future)
- `/cbt-monitoring/eswatini/admin/settings` - Settings (future)

### Access Control
- Admin-only routes (protected by role check)
- Redirect non-admins to dashboard

## Benefits of This Approach

1. **Single Source of Truth**: All data in Firebase
2. **Real-Time**: Changes reflect immediately in dashboard
3. **Better UX**: Purpose-built forms vs generic spreadsheet
4. **Scalable**: Easy to add features (bulk import, templates, etc.)
5. **Secure**: Firebase security rules for proper access control
6. **No Sync Complexity**: No Google Apps Scripts needed

## Migration Path

If they're already using Google Sheets:
1. One-time import script (read from Sheet, write to Firebase)
2. Admin can verify data
3. Switch dashboard to read from Firebase only
4. Keep Sheet as read-only backup (optional)

## Optional: Export Feature

Even without Sheets sync, we can add:
- "Export to CSV" button in admin section
- Scheduled exports (daily/weekly) sent via email
- Download current community list as Excel

This gives them the export capability without the sync complexity.

