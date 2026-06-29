import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore } from 'firebase-admin/firestore';
import * as nodemailer from 'nodemailer';

// Read secrets from environment (configured via Firebase Secrets)
// These will be available as environment variables when secrets are declared in the function
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

function createTransport() {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    throw new Error('Missing Gmail credentials (gmail_user / gmail_app_password)');
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });
}

function generateEmailHTML(name: string, communities: Array<{ community: string; daysSince: number }>, authority: string): string {
  const formUrl = `https://tourismcommons.org/cbt-monitoring/${authority}/update`;
  const list = communities
    .map(({ community, daysSince }) => `<li><strong>${community}</strong> - Last update: ${daysSince} days ago</li>`) 
    .join('');
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${name},</h2>
      <p>This is your reminder to update CBT community engagement records.</p>
      <p>The following communities haven't been updated in 30+ days and need attention:</p>
      <ul>${list}</ul>
      <p style="margin-top: 20px;">
        <a href="${formUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Submit Update
        </a>
      </p>
      <p>Thank you for keeping our records current!</p>
    </div>
  `;
}

// Shared function to send reminder emails
async function sendReminderEmails(authority: string = 'eswatini'): Promise<{ sent: number; skipped: number }> {
  const db = getFirestore();

  // Fetch communities
  const communitiesSnapshot = await db
    .collection('communities')
    .where('authority', '==', authority)
    .get();

  const today = new Date();
  const needsMap = new Map<string, Array<{ community: string; daysSince: number }>>(); // staff -> communities

  communitiesSnapshot.forEach((doc) => {
    const data: any = doc.data();
    const last = data.lastUpdate?.toDate ? data.lastUpdate.toDate() : (data.lastUpdate ? new Date(data.lastUpdate) : undefined);
    const daysSince = last ? Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)) : 999;
    if (daysSince > 30) {
      const staff: string = data.responsibleStaff || 'unknown';
      if (!needsMap.has(staff)) needsMap.set(staff, []);
      needsMap.get(staff)!.push({ community: data.community, daysSince });
    }
  });

  if (needsMap.size === 0) {
    return { sent: 0, skipped: 0 };
  }

  // Fetch users to map staff -> email
  const usersSnapshot = await db
    .collection('users')
    .where('authority', '==', authority)
    .get();

  const staffToEmail = new Map<string, string>();
  usersSnapshot.forEach((doc) => {
    const u: any = doc.data();
    if (u.username && u.email) staffToEmail.set(u.username, u.email);
  });

  const transporter = createTransport();
  const sendPromises: Promise<any>[] = [];
  let skipped = 0;

  needsMap.forEach((communities, staff) => {
    const toEmail = staffToEmail.get(staff);
    if (!toEmail || communities.length === 0) {
      skipped++;
      return;
    }
    const mailOptions = {
      from: `CBT Monitoring <${GMAIL_USER}>`,
      to: toEmail,
      subject: `CBT Update Reminder - ${communities.length} community(ies) need updates`,
      html: generateEmailHTML(staff, communities, authority),
    } as nodemailer.SendMailOptions;
    sendPromises.push(transporter.sendMail(mailOptions));
  });

  await Promise.all(sendPromises);
  return { sent: sendPromises.length, skipped };
}

export const sendWeeklyReminders = onSchedule({
  schedule: '0 9 * * 1', // Every Monday at 9 AM
  timeZone: 'Africa/Mbabane',
  secrets: ['GMAIL_USER', 'GMAIL_APP_PASSWORD'],
}, async () => {
  await sendReminderEmails('eswatini');
});

// Export the function for testing via HTTP endpoint
export { sendReminderEmails };


