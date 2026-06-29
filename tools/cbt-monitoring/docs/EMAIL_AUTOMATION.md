# Email Automation - Firebase Cloud Functions Approach

> **UPDATE:** See `EMAIL_AUTOMATION_FIREBASE.md` for the recommended **free Gmail SMTP** approach using Google's native services.

## Overview
Instead of Google Apps Script, we'll use **Firebase Cloud Functions** with scheduled triggers to send automated reminder emails.

## Architecture

```
Firebase Cloud Function (Scheduled)
    ↓
Read from Firestore (communities + users)
    ↓
Determine who needs reminders
    ↓
Send emails via SendGrid/Mailgun/SMTP
```

## Option 1: Firebase Cloud Functions + SendGrid (Recommended)

### Setup

1. **Install SendGrid** (or similar service):
   - Free tier: 100 emails/day
   - Paid: Affordable scaling
   - Simple API

2. **Create Cloud Function:**
   - Location: `digital_assessment/functions/src/cbtEmailReminders.ts`
   - Runs on schedule (Cron syntax)
   - Reads from Firestore
   - Sends emails via SendGrid API

3. **Benefits:**
   - No Google dependency
   - Better email deliverability
   - Professional templates
   - Analytics/tracking
   - Easy to test locally

### Example Implementation

```typescript
// functions/src/cbtEmailReminders.ts
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore } from 'firebase-admin/firestore';
import * as sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Runs every Monday at 9 AM
export const sendWeeklyReminders = onSchedule({
  schedule: '0 9 * * 1', // Cron: Every Monday at 9 AM
  timeZone: 'Africa/Mbabane', // Eswatini timezone
}, async (event) => {
  const db = getFirestore();
  
  // Get all communities for an authority
  const communitiesSnapshot = await db
    .collection('communities')
    .where('authority', '==', 'eswatini')
    .get();
  
  // Calculate which need updates
  const today = new Date();
  const needsUpdate: any[] = [];
  
  communitiesSnapshot.forEach(doc => {
    const data = doc.data();
    const lastUpdate = data.lastUpdate?.toDate();
    const daysSince = Math.floor((today - lastUpdate) / (1000 * 60 * 60 * 24));
    
    if (daysSince > 14) {
      needsUpdate.push({
        community: data.community,
        staff: data.responsibleStaff,
        daysSince,
      });
    }
  });
  
  // Group by staff member
  const staffMap = new Map();
  needsUpdate.forEach(item => {
    if (!staffMap.has(item.staff)) {
      staffMap.set(item.staff, []);
    }
    staffMap.get(item.staff).push(item);
  });
  
  // Get user emails from users collection
  const usersSnapshot = await db
    .collection('users')
    .where('authority', '==', 'eswatini')
    .get();
  
  const userEmails = new Map();
  usersSnapshot.forEach(doc => {
    const user = doc.data();
    userEmails.set(user.username, user.email);
  });
  
  // Send emails
  const emailPromises: Promise<any>[] = [];
  
  staffMap.forEach((communities, staffName) => {
    const email = userEmails.get(staffName);
    if (!email) return;
    
    const msg = {
      to: email,
      from: 'noreply@tourismcommons.org',
      subject: `CBT Update Reminder - ${communities.length} community(ies) need updates`,
      html: generateEmailHTML(staffName, communities, 'eswatini'),
    };
    
    emailPromises.push(sgMail.send(msg));
  });
  
  await Promise.all(emailPromises);
  console.log(`Sent ${emailPromises.length} reminder emails`);
});

function generateEmailHTML(name: string, communities: any[], authority: string): string {
  const formUrl = `https://tourismcommons.org/cbt-monitoring/${authority}/update`;
  
  let html = `
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
    <p><a href="${formUrl}">Click here to submit an update</a></p>
    <p>Thank you for keeping our records current!</p>
  `;
  
  return html;
}
```

## Option 2: Firebase Cloud Functions + Nodemailer (SMTP)

If you have an existing SMTP server (Gmail, Outlook, etc.):

```typescript
import * as nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Then use transporter.sendMail() instead of sgMail.send()
```

**Pros:** Free if you have email account  
**Cons:** May hit rate limits, less reliable deliverability

## Option 3: Backend API Endpoint (If you have one)

If you already have a backend API server:

```typescript
// In your backend (Node.js/Python/etc.)
// Scheduled job (cron or Cloud Scheduler calls endpoint)
app.post('/api/cbt/send-reminders', async (req, res) => {
  // Read from Firebase
  // Send emails
  // Return status
});
```

Then trigger via Cloud Scheduler calling the endpoint.

## Recommendation: Option 1 (SendGrid)

**Why:**
- ✅ Professional email service (better deliverability)
- ✅ Built-in analytics
- ✅ HTML email templates
- ✅ Easy to test
- ✅ Free tier sufficient for MVP
- ✅ Scales easily

## Implementation Steps

1. **Set up SendGrid:**
   ```bash
   npm install @sendgrid/mail
   ```

2. **Set environment variable:**
   ```bash
   firebase functions:config:set sendgrid.api_key="your-api-key"
   ```

3. **Create the function** (see example above)

4. **Deploy:**
   ```bash
   firebase deploy --only functions:sendWeeklyReminders
   ```

5. **Test:**
   - Can manually trigger: `firebase functions:shell`
   - Or wait for scheduled time

## Additional Email Functions Needed

1. **Bi-weekly reminders** (Mondays)
2. **Inactive community alerts** (Mondays, different time)
3. **Monthly summary** (Last day of month)

All can be separate Cloud Functions with different schedules.

## Cost

- **SendGrid Free:** 100 emails/day
- **Cloud Functions:** Free tier: 2 million invocations/month
- **Firestore reads:** Minimal (only reading communities/users)

For Eswatini with ~10-20 staff, easily fits in free tier.

## Migration from Google Apps Script

1. Export user emails to Firestore `users` collection
2. Set up SendGrid account
3. Deploy Cloud Functions
4. Test with small group
5. Switch off Google Apps Script triggers
6. Monitor for a week

---

**Bottom line:** Firebase Cloud Functions + SendGrid gives you the same functionality as Google Apps Script but with better scalability, reliability, and no dependency on Google Sheets.

