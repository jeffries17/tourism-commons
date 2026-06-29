/**
 * PDF Generation Utility for CBT Monitoring Dashboard
 * Generates PDF reports with color-coded status indicators
 */

import type { CbtCommunity, CbtStats } from '../types/index';

interface PdfOptions {
  title?: string;
  includeStats?: boolean;
  includeDate?: boolean;
  communities?: CbtCommunity[];
  stats?: CbtStats;
}

/**
 * Generate PDF from dashboard data using browser's print functionality
 * This creates a print-optimized view that can be saved as PDF
 */
export function generatePdf(options: PdfOptions = {}): void {
  const {
    title = 'CBT Monitoring Dashboard Report',
    includeStats = true,
    includeDate = true,
    communities = [],
    stats
  } = options;

  // Create a new window with formatted content
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow pop-ups to generate PDF');
    return;
  }

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate stats if not provided
  const finalStats = stats || {
    total: communities.length,
    green: communities.filter(c => c.status === 'green').length,
    yellow: communities.filter(c => c.status === 'yellow').length,
    red: communities.filter(c => c.status === 'red').length
  };

  // Build HTML content
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        @media print {
          @page {
            margin: 1cm;
          }
        }
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          color: #333;
        }
        h1 {
          color: #1f2937;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .header-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          padding: 15px;
          background: #f3f4f6;
          border-radius: 8px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 30px;
        }
        .stat-card {
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          border: 2px solid;
        }
        .stat-card.total {
          background: #ffffff;
          border-color: #6b7280;
        }
        .stat-card.green {
          background: #d1fae5;
          border-color: #10b981;
        }
        .stat-card.yellow {
          background: #fef3c7;
          border-color: #f59e0b;
        }
        .stat-card.red {
          background: #fee2e2;
          border-color: #ef4444;
        }
        .stat-number {
          font-size: 32px;
          font-weight: bold;
          margin: 10px 0;
        }
        .stat-label {
          font-size: 14px;
          color: #6b7280;
        }
        .communities-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        .communities-table th {
          background: #3b82f6;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: 600;
        }
        .communities-table td {
          padding: 10px 12px;
          border-bottom: 1px solid #e5e7eb;
        }
        .communities-table tr:nth-child(even) {
          background: #f9fafb;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 12px;
        }
        .status-green {
          background: #d1fae5;
          color: #065f46;
        }
        .status-yellow {
          background: #fef3c7;
          color: #92400e;
        }
        .status-red {
          background: #fee2e2;
          color: #991b1b;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      
      ${includeDate ? `
      <div class="header-info">
        <div><strong>Generated:</strong> ${today}</div>
        <div><strong>Total Communities:</strong> ${finalStats.total}</div>
      </div>
      ` : ''}
      
      ${includeStats ? `
      <div class="stats-grid">
        <div class="stat-card total">
          <div class="stat-label">Total Communities</div>
          <div class="stat-number">${finalStats.total}</div>
        </div>
        <div class="stat-card green">
          <div class="stat-label">🟢 Active</div>
          <div class="stat-number">${finalStats.green}</div>
          <div class="stat-label">${finalStats.total > 0 ? Math.round((finalStats.green / finalStats.total) * 100) : 0}%</div>
        </div>
        <div class="stat-card yellow">
          <div class="stat-label">🟡 Needs Attention</div>
          <div class="stat-number">${finalStats.yellow}</div>
          <div class="stat-label">${finalStats.total > 0 ? Math.round((finalStats.yellow / finalStats.total) * 100) : 0}%</div>
        </div>
        <div class="stat-card red">
          <div class="stat-label">🔴 Inactive</div>
          <div class="stat-number">${finalStats.red}</div>
          <div class="stat-label">${finalStats.total > 0 ? Math.round((finalStats.red / finalStats.total) * 100) : 0}%</div>
        </div>
      </div>
      ` : ''}
      
      <h2>Community Status Details</h2>
      <table class="communities-table">
        <thead>
          <tr>
            <th>Community</th>
            <th>Region</th>
            <th>Status</th>
            <th>Last Update</th>
            <th>Days Since</th>
            <th>Engagements (30d)</th>
            <th>Content (30d)</th>
            <th>Responsible Staff</th>
          </tr>
        </thead>
        <tbody>
          ${communities.map(c => `
            <tr>
              <td><strong>${c.community}</strong></td>
              <td>${c.region || 'N/A'}</td>
              <td>
                <span class="status-badge status-${c.status}">
                  ${c.status === 'green' ? '🟢 Active' : c.status === 'yellow' ? '🟡 Needs Attention' : '🔴 Inactive'}
                </span>
              </td>
              <td>${c.lastUpdate || 'Never'}</td>
              <td>${c.daysSinceUpdate} days</td>
              <td>${c.engagementCount}</td>
              <td>${c.contentCount}</td>
              <td>${c.responsibleStaff || 'N/A'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p>CBT Monitoring Dashboard | Generated on ${today}</p>
        <p>Status Legend: 🟢 Active (≤14 days) | 🟡 Needs Attention (15-28 days) | 🔴 Inactive (29+ days)</p>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for content to load, then trigger print
  setTimeout(() => {
    printWindow.print();
    // Optionally close after printing
    // printWindow.close();
  }, 250);
}

/**
 * Alternative: Generate PDF using jsPDF (requires jsPDF library)
 * This is a more advanced option that creates actual PDF files
 * Note: This function requires jspdf to be installed: npm install jspdf
 */
export async function generatePdfWithJsPDF(
  communities: CbtCommunity[],
  stats: CbtStats,
  options: { title?: string } = {}
): Promise<void> {
  // Dynamic import to avoid bundling jsPDF if not needed
  try {
    // Try to import jspdf - if not available, fall back to browser print
    const jspdfModule = await import('jspdf').catch(() => null);
    if (!jspdfModule) {
      console.warn('jspdf not installed, falling back to browser print method');
      generatePdf({ communities, stats, ...options });
      return;
    }
    const { jsPDF } = jspdfModule;
    const doc = new jsPDF();
    
    const title = options.title || 'CBT Monitoring Dashboard Report';
    const today = new Date().toLocaleDateString();
    
    // Title
    doc.setFontSize(18);
    doc.text(title, 14, 20);
    
    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${today}`, 14, 30);
    
    // Stats
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    let yPos = 45;
    doc.text(`Total: ${stats.total}`, 14, yPos);
    doc.setTextColor(16, 185, 129); // Green
    doc.text(`🟢 Active: ${stats.green}`, 60, yPos);
    doc.setTextColor(245, 158, 11); // Yellow
    doc.text(`🟡 Needs Attention: ${stats.yellow}`, 100, yPos);
    doc.setTextColor(239, 68, 68); // Red
    doc.text(`🔴 Inactive: ${stats.red}`, 160, yPos);
    
    // Communities table
    yPos = 60;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    communities.forEach((c, idx) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      const statusColor = c.status === 'green' ? [16, 185, 129] : 
                         c.status === 'yellow' ? [245, 158, 11] : [239, 68, 68];
      
      doc.setTextColor(...statusColor);
      doc.text(`${c.status === 'green' ? '🟢' : c.status === 'yellow' ? '🟡' : '🔴'}`, 14, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(`${c.community}`, 22, yPos);
      doc.text(`${c.daysSinceUpdate}d`, 80, yPos);
      doc.text(`${c.engagementCount}`, 100, yPos);
      doc.text(`${c.contentCount}`, 120, yPos);
      
      yPos += 8;
    });
    
    // Save PDF
    doc.save(`cbt-monitoring-${today.replace(/\//g, '-')}.pdf`);
  } catch (error) {
    console.warn('jsPDF error, falling back to browser print method:', error);
    generatePdf({ communities, stats, ...options });
  }
}

