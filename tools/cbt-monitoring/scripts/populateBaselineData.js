/**
 * Node.js script to populate baseline data into Google Sheet
 * Run with: node scripts/populateBaselineData.js
 * 
 * Requires:
 * - Google Service Account credentials
 * - Sheet ID configured
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Configuration
const SHEET_ID = process.env.CBT_SHEET_ID || '1qYVMz5aUsoQZZXgt7kKI4Gw0C-MHIqBLTt4wTdZ0rCE';
const SERVICE_ACCOUNT_PATH = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || 
  path.join(__dirname, '../../config/tourism-development-d620c-5c9db9e21301.json');

// Baseline communities data
const communities = [
  {
    community: 'Ejubukweni',
    region: 'Hhohho',
    contactPerson: 'John Mamba',
    contactInfo: 'john.mamba@example.com | +268 7612 3456',
    responsibleStaff: 'Jane Dlamini',
    lastUpdateDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    nextVisitDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    responses: [
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
    lastUpdateDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    nextVisitDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    responses: [
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
    lastUpdateDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    nextVisitDate: '',
    responses: [
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

async function getSheetsClient() {
  const scopes = ['https://www.googleapis.com/auth/spreadsheets'];
  let auth;
  
  if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    const creds = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
    auth = new google.auth.JWT(
      creds.client_email,
      null,
      creds.private_key,
      scopes
    );
  } else {
    console.error(`Service account file not found: ${SERVICE_ACCOUNT_PATH}`);
    console.error('Please set GOOGLE_SERVICE_ACCOUNT_JSON environment variable');
    process.exit(1);
  }
  
  await auth.authorize();
  return google.sheets({ version: 'v4', auth });
}

async function populateCommunities(sheets) {
  console.log('📝 Populating Communities tab...');
  
  const values = communities.map(c => [
    c.community,
    c.region,
    c.contactPerson,
    c.contactInfo,
    c.responsibleStaff,
    c.lastUpdateDate,
    '', // Status (calculated by formulas)
    c.nextVisitDate
  ]);
  
  // Check if header exists
  try {
    const { data } = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Communities!A1:H1'
    });
    
    if (!data.values || data.values.length === 0) {
      // Add header
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: 'Communities!A1',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        body: {
          values: [['Community Name', 'Region', 'Contact Person', 'Contact Info', 'Responsible Staff', 'Last Update Date', 'Status', 'Next Visit Date']]
        }
      });
    }
  } catch (e) {
    console.warn('Could not check Communities header, assuming it exists');
  }
  
  // Append communities
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Communities!A2',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    body: { values }
  });
  
  console.log(`✅ Added ${communities.length} communities to Communities tab`);
}

async function populateResponses(sheets) {
  console.log('📝 Populating Responses tab...');
  
  const allResponses = [];
  communities.forEach(c => {
    c.responses.forEach(r => {
      allResponses.push([
        new Date(r.date).toISOString(),
        r.staffName,
        c.community,
        r.date,
        r.engagementType.join(', '),
        r.updateSummary,
        r.contentProduced.join(', '),
        '', // Support Needed
        ''  // Next Planned Visit
      ]);
    });
  });
  
  // Check if header exists
  try {
    const { data } = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Responses!A1:I1'
    });
    
    if (!data.values || data.values.length === 0) {
      // Add header
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: 'Responses!A1',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        body: {
          values: [[
            'Timestamp',
            'Staff Name',
            'Community',
            'Date of Interaction',
            'Engagement Type',
            'Update Summary',
            'Content Produced',
            'Support Needed',
            'Next Planned Visit'
          ]]
        }
      });
    }
  } catch (e) {
    console.warn('Could not check Responses header, assuming it exists');
  }
  
  // Append responses
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Responses!A2',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    body: { values: allResponses }
  });
  
  console.log(`✅ Added ${allResponses.length} responses to Responses tab`);
}

async function verifyDashboardData(sheets) {
  console.log('🔍 Verifying Dashboard Data tab...');
  
  try {
    const { data } = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Dashboard Data!A:F'
    });
    
    const rows = data.values || [];
    console.log(`📊 Dashboard Data tab has ${rows.length - 1} communities (excluding header)`);
    
    if (rows.length < 2) {
      console.warn('⚠️  Dashboard Data tab appears empty. Make sure formulas are set up.');
      console.log('   Expected formulas:');
      console.log('   - Column B: =MAXIFS(Responses!$A:$A, Responses!$C:$C, A2)');
      console.log('   - Column C: =TODAY()-B2');
      console.log('   - Column D: =IF(C2<=14, "🟢", IF(C2<=28, "🟡", "🔴"))');
      console.log('   - Column E: =COUNTIFS(Responses!$C:$C, A2, Responses!$A:$A, ">="&TODAY()-30)');
      console.log('   - Column F: =COUNTIFS(Responses!$C:$C, A2, Responses!$A:$A, ">="&TODAY()-30, Responses!$F:$F, "<>")');
    }
  } catch (e) {
    console.warn('⚠️  Could not read Dashboard Data tab:', e.message);
  }
}

async function main() {
  console.log('🚀 Starting baseline data population...\n');
  console.log(`📋 Sheet ID: ${SHEET_ID}\n`);
  
  try {
    const sheets = await getSheetsClient();
    
    await populateCommunities(sheets);
    await populateResponses(sheets);
    await verifyDashboardData(sheets);
    
    console.log('\n✅ Baseline data population complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Verify data in Google Sheet');
    console.log('   2. Check Dashboard Data tab formulas');
    console.log('   3. Test dashboard display');
    console.log('   4. Run testing checklist');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Details:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { populateCommunities, populateResponses, verifyDashboardData };

