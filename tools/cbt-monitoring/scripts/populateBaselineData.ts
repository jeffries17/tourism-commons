/**
 * Script to populate baseline entries for 3 test communities
 * Run this to set up dummy data for testing
 * 
 * Usage: This script can be run via a browser console or Node.js script
 * to populate the Google Sheet with test data
 */

interface BaselineCommunity {
  community: string;
  region: string;
  contactPerson: string;
  contactInfo: string;
  responsibleStaff: string;
  lastUpdateDate: string; // YYYY-MM-DD
  nextVisitDate: string; // YYYY-MM-DD
  sampleUpdates: Array<{
    date: string;
    staffName: string;
    engagementType: string[];
    updateSummary: string;
    contentProduced: string[];
  }>;
}

const BASELINE_COMMUNITIES: BaselineCommunity[] = [
  {
    community: 'Ejubukweni',
    region: 'Hhohho',
    contactPerson: 'John Mamba',
    contactInfo: 'john.mamba@example.com | +268 7612 3456',
    responsibleStaff: 'Jane Dlamini',
    lastUpdateDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago
    nextVisitDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days from now
    sampleUpdates: [
      {
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        staffName: 'Jane Dlamini',
        engagementType: ['Visit', 'WhatsApp'],
        updateSummary: 'Conducted site visit to review new cultural center. Discussed upcoming festival promotion. Sent follow-up WhatsApp with promotional materials.',
        contentProduced: ['Instagram Post', 'Facebook Post']
      },
      {
        date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        staffName: 'Jane Dlamini',
        engagementType: ['Phone'],
        updateSummary: 'Phone call to confirm festival dates and discuss social media content calendar.',
        contentProduced: ['Story']
      }
    ]
  },
  {
    community: 'Lobamba',
    region: 'Hhohho',
    contactPerson: 'Sarah Khumalo',
    contactInfo: 'sarah.khumalo@example.com | +268 7612 7890',
    responsibleStaff: 'Jane Dlamini',
    lastUpdateDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 20 days ago
    nextVisitDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
    sampleUpdates: [
      {
        date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        staffName: 'Jane Dlamini',
        engagementType: ['Visit'],
        updateSummary: 'Initial assessment visit. Reviewed current digital presence and identified key improvement areas.',
        contentProduced: []
      }
    ]
  },
  {
    community: 'Malkerns',
    region: 'Manzini',
    contactPerson: 'Peter Dlamini',
    contactInfo: 'peter.dlamini@example.com | +268 7613 4567',
    responsibleStaff: 'Thabo Mabuza',
    lastUpdateDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 35 days ago
    nextVisitDate: '', // No scheduled visit
    sampleUpdates: [
      {
        date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        staffName: 'Thabo Mabuza',
        engagementType: ['Email'],
        updateSummary: 'Sent initial introduction email and information packet about CBT program.',
        contentProduced: []
      }
    ]
  }
];

/**
 * Generate CSV format for manual import into Google Sheet
 */
export function generateCSVForCommunitiesTab(): string {
  const headers = ['Community Name', 'Region', 'Contact Person', 'Contact Info', 'Responsible Staff', 'Last Update Date', 'Status', 'Next Visit Date'];
  const rows = BASELINE_COMMUNITIES.map(c => [
    c.community,
    c.region,
    c.contactPerson,
    c.contactInfo,
    c.responsibleStaff,
    c.lastUpdateDate,
    '', // Status will be calculated by formulas
    c.nextVisitDate
  ]);
  
  return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

/**
 * Generate CSV format for Responses tab
 */
export function generateCSVForResponsesTab(): string {
  const headers = ['Timestamp', 'Staff Name', 'Community', 'Date of Interaction', 'Engagement Type', 'Update Summary', 'Content Produced', 'Support Needed', 'Next Planned Visit'];
  const rows: string[][] = [];
  
  BASELINE_COMMUNITIES.forEach(c => {
    c.sampleUpdates.forEach(update => {
      rows.push([
        new Date(update.date).toISOString(),
        update.staffName,
        c.community,
        update.date,
        update.engagementType.join(', '),
        update.updateSummary,
        update.contentProduced.join(', '),
        '', // Support Needed
        '' // Next Planned Visit
      ]);
    });
  });
  
  return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

/**
 * Generate instructions for manual setup
 */
export function getSetupInstructions(): string {
  return `
# Baseline Data Setup Instructions

## Step 1: Populate Communities Tab

Copy and paste the following CSV data into the "Communities" tab of your Google Sheet:

\`\`\`
${generateCSVForCommunitiesTab()}
\`\`\`

## Step 2: Populate Responses Tab

Copy and paste the following CSV data into the "Responses" tab:

\`\`\`
${generateCSVForResponsesTab()}
\`\`\`

## Step 3: Verify Dashboard Data Tab

The "Dashboard Data" tab should automatically calculate:
- Last Update (using MAXIFS formula)
- Days Since Update (using TODAY() - Last Update)
- Status (🟢/🟡/🔴 based on days)
- Engagement Count (last 30 days)
- Content Count (last 30 days)

## Step 4: Test the Dashboard

1. Open the dashboard at: https://tourismcommons.org/cbt-monitoring/eswatini
2. Verify all 3 communities appear
3. Check that status colors match:
   - Ejubukweni: 🟢 Green (5 days ago)
   - Lobamba: 🟡 Yellow (20 days ago)
   - Malkerns: 🔴 Red (35 days ago)

## Step 5: Test Form Submission

1. Click "Add Update" button
2. Submit a test update for one of the communities
3. Verify it appears in the Google Sheet Responses tab
4. Check that Dashboard Data updates automatically

## Notes

- All dates are relative to today, so they will shift as time passes
- You can modify the sample data as needed
- The formulas in Dashboard Data tab will automatically recalculate
`;
}

// Export for use in scripts
if (typeof window === 'undefined') {
  // Node.js environment
  console.log(getSetupInstructions());
}

