# Authentication Sheet Setup Guide

## Quick Setup Instructions

### Step 1: Create New Tab
1. Open your Google Sheet
2. Create a new tab called `dashboard_auth` or `user_access`
3. Copy the structure below

### Step 2: Copy This Header Row
```
full_name | username | role | participant_id | notes
```

### Step 3: Add ITC Team Members

Copy these rows (update last names):
```
Alex Jeffries     | ajeffries  | admin | [leave empty] | ITC Team - Full platform access
Ruat [Last Name]  | r[lastname]| admin | [leave empty] | ITC Team - Full platform access  
Frederic [Last]   | f[lastname]| admin | [leave empty] | ITC Team - Full platform access
```

### Step 4: Add Participants (Examples)

When you add participants, use this format:
```
[Full Name] | [username] | participant | [their ID] | [optional note]
```

**Example:**
```
John Smith | johnsmith | participant | PART_001 | Mountain Resort Owner
Jane Doe   | janedoe   | participant | PART_002 | Coastal Hotel Manager
```

---

## Column Definitions

| Column | Description | Required | Values |
|--------|-------------|----------|--------|
| **full_name** | Person's display name | Yes | Any text |
| **username** | Login identifier (2-3 words, no spaces) | Yes | Lowercase, no spaces |
| **role** | Access level | Yes | "admin" or "participant" |
| **participant_id** | Links to their data (only for participants) | For participants | Must match ID in your data |
| **notes** | Internal notes (optional) | No | Any text |

---

## Important Notes

### Username Format
- **Lowercase, no spaces**
- 2-3 words recommended
- Examples: `johnsmith`, `jane`, `mountainresort`

### Role Types
- **admin**: ITC team members who see everything
- **participant**: Individual users who see only their data

### Participant IDs
- **Leave empty for admins**
- Must match the ID used in your actual data
- Examples: `PART_001`, `USER_123`, `BUSINESS_ABC`

---

## What to Review with Team

Before we implement, please get approval on:

1. ✅ **Column structure** - Are these the right fields?
2. ✅ **Username format** - Is this simple enough?
3. ✅ **Role types** - Do we need more than admin/participant?
4. ✅ **Security approach** - Comfortable with username-only login?
5. ✅ **Participant ID** - Confirm what field name you use in your current data

---

## Sample Complete Sheet

Here's what it might look like with real data:

| full_name | username | role | participant_id | notes |
|-----------|----------|------|----------------|-------|
| Alex Jeffries | ajeffries | admin | | ITC Team Lead |
| Ruat [Last] | rlast | admin | | ITC Team |
| Frederic [Last] | flast | admin | | ITC Team |
| | | | | |
| Mountain View Resort | mountainview | participant | PART_001 | Northern Region |
| Coastal Inn | coastalinn | participant | PART_002 | Southern Region |
| Historic Hotel | historic | participant | PART_003 | Central Region |

---

## After Approval

Once the structure is approved:
1. Fill in the actual ITC team last names
2. Keep the sheet - we'll connect to it via API
3. You can add/remove users anytime without code changes
4. Share the sheet with view access for the development API

---

## Questions?

- Should we add more columns? (email, phone, region, etc.)
- Different role types needed?
- Want to test with a few participants first?


