# Email Automation - Firebase Native Options

## Overview
Since Firebase is a Google property, we can use Google's own email capabilities without third-party services.

## Option 1: Gmail SMTP via Nodemailer (Simplest & Free)

### Setup
Use a Gmail account with an App Password (not your regular password).

**Pros:**
- ✅ Completely free
- ✅ Simple setup
- ✅ Works immediately
- ✅ No OAuth complexity

**Cons:**
- ⚠️ Gmail limit: 500 emails/day for free accounts
- ⚠️ Need to create a dedicated Gmail account for the system

### Implementation

```typescript
// functions/src/cbtEmailReminders.ts
import * as nodemailer from 'nodemailer';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore } from 'firebase-admin/firestore';

// Configure Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // e.g., 'cbt-notifications@tourismcommons.org'
    pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password (not regular password)
  },
});

export const sendWeeklyReminders = onSchedule({
  schedule: '0 9 * * 1', // Every Monday at 9 AM
  timeZone: 'Africa/Mbabane',
}, async (event) => {
  const db = getFirestore();
  
  // Read communities from Firestore
  const communitiesSnapshot = await db
    .collection('communities')
    .where('authority', '==', 'eswatini')
    .get();
  
  // Get users collection for emails
  const usersSnapshot = await db
    .collection('users')
    .where('authority', '==', 'eswatini')
    .get();
  
  const userMap = new Map();
  usersSnapshot.forEach(doc => {
    const user = doc.data();
    userMap.set(user.username, user.email);
  });
  
  // Calculate which communities need updates
  const today = new Date();
  const staffCommunities = new Map();
  
  communitiesSnapshot.forEach(doc => {
    const data = doc.data();
    const lastUpdate = data.lastUpdate?.toDate();
    const daysSince = lastUpdate 
      ? Math.floor((today.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    
    if (daysSince > 14) {
      const staff = data.responsibleStaff;
      if (!staffCommunities.has(staff)) {
        staffCommunities.set(staff, []);
      }
      staffCommunities.get(staff).push({
        community: data.community,
        daysSince,
      });
    }
  });
  
  // Send emails
  const promises: Promise<any>[] = [];
  
  staffCommunities.forEach((communities, staffName) => {
    const email = userMap.get(staffName);
    if (!email || communities.length === 0) return;
    
    const mailOptions = {
      from: `"CBT Monitoring" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `CBT Update Reminder - ${communities.length} community(ies) need updates`,
      html: generateEmailHTML(staffName, communities, 'eswatini'),
    };
    
    promises.push(transporter.sendMail(mailOptions));
  });
  
  await Promise.all(promises);
  console.log(`Sent ${promises.length} reminder emails`);
});

function generateEmailHTML(name: string, communities: any[], authority: string): string {
  const formUrl = `https://tourismcommons.org/cbt-monitoring/${authority}/update`;
  
  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${name},</h2>
      <p>This is your bi-weekly reminder to update CBT community engagement records.</p>
      <p>The following communities need attention:</p>
      <ul>
  `;
  
  communities.forEach(({ community, daysSince }) => {
    html += `<li><strong>${community}</strong> - Last update: ${daysSince} days ago</li>`;
  });
  
  html += `
      </ul>
      <p style="margin-top: 20px;">
        <a href="${formUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Submit Update
        </a>
      </p>
      <p>Thank you for keeping our records current!</p>
    </div>
  `;
  
  return html;
}
```

### Setup Steps

1. **Create Gmail account** (or use existing):
   - e.g., `cbt-notifications@tourismcommons.org`
   - Or use your existing ETA email

2. **Generate App Password**:
   - Go to Google Account → Security
   - Enable 2-Step Verification
   - Generate App Password for "Mail"
   - Copy the 16-character password

3. **Set environment variables**:
   ```bash
   firebase functions:config:set gmail.user="your-email@gmail.com"
   firebase functions:config:set gmail.app_password="your-app-password"
   ```

4. **Install nodemailer**:
   ```bash
   cd digital_assessment/functions
   npm install nodemailer
   npm install --save-dev @types/nodemailer
   ```

5. **Deploy**:
   ```bash
   firebase deploy --only functions:sendWeeklyReminders
   ```

## Option 2: Google Workspace Email (If Available)

If ETA has Google Workspace, you can use their domain email:

```typescript
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'notifications@eta.org.sz', // Your Workspace email
    pass: process.env.WORKSPACE_APP_PASSWORD,
  },
});
```

**Benefits:**
- ✅ Professional email address
- ✅ Higher limits (2000/day for Workspace)
- ✅ Better deliverability

## Option 3: Gmail API (More Complex, More Features)

If you need more advanced features (templates, tracking, etc.):

1. Enable Gmail API in Google Cloud Console
2. Set up OAuth 2.0 credentials
3. Use Gmail API library

**Pros:** More features, better tracking
**Cons:** More complex setup, OAuth2 required

## Recommended: Option 1 (Gmail SMTP)

**Why:**
- ✅ 100% free (within Gmail limits)
- ✅ Simple setup (15 minutes)
- ✅ No third-party dependencies
- ✅ Reliable (Google infrastructure)
- ✅ 500 emails/day sufficient for ETA use case

**Gmail Limits:**
- Free account: 500 emails/day
- Google Workspace: 2000 emails/day

For ETA with ~10-20 staff members, 500/day is plenty.

## Additional Functions Needed

```typescript
// Inactive community alerts (every Monday at 10 AM)
export const sendInactiveAlerts = onSchedule({
  schedule: '0 10 * * 1',
  timeZone: 'Africa/Mbabane',
}, async (event) => {
  // Similar logic, but for communities >21 days inactive
  // Send to admins only
});

// Monthly summary (last day of month)
export const sendMonthlySummary = onSchedule({
  schedule: '0 9 28-31 * *', // Last day of month
  timeZone: 'Africa/Mbabane',
}, async (event) => {
  // Generate monthly statistics
  // Send summary to all staff
});
```

## Cost

- **Gmail SMTP:** $0 (within limits)
- **Cloud Functions:** Free tier (2M invocations/month)
- **Firestore reads:** Minimal cost

**Total: Essentially free for this use case.**

## Migration from Google Apps Script

1. Export user email list
2. Create/use Gmail account
3. Generate App Password
4. Deploy Cloud Functions
5. Test with small group
6. Switch off Apps Script triggers

---

**Bottom line:** Use Gmail SMTP via Nodemailer. It's free, simple, and uses Google's own infrastructure - perfect fit for Firebase project!

