/**
 * Local JSON Storage Solution for Dashboard Data
 * No authentication required - works immediately
 */

const fs = require('fs');
const path = require('path');

class LocalStorageManager {
  constructor(dataDir = './data') {
    this.dataDir = dataDir;
    this.ensureDataDirectory();
  }

  ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  // Save assessment data
  saveAssessment(participantName, assessmentData) {
    try {
      const filePath = path.join(this.dataDir, 'assessments.json');
      let assessments = this.loadAllAssessments();
      
      // Update or add assessment
      const existingIndex = assessments.findIndex(a => a.name === participantName);
      if (existingIndex >= 0) {
        assessments[existingIndex] = { ...assessments[existingIndex], ...assessmentData, name: participantName };
      } else {
        assessments.push({ name: participantName, ...assessmentData });
      }
      
      fs.writeFileSync(filePath, JSON.stringify(assessments, null, 2));
      return { success: true, message: 'Assessment saved successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Load all assessments
  loadAllAssessments() {
    try {
      const filePath = path.join(this.dataDir, 'assessments.json');
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('Error loading assessments:', error);
      return [];
    }
  }

  // Get specific assessment
  getAssessment(participantName) {
    const assessments = this.loadAllAssessments();
    return assessments.find(a => a.name === participantName);
  }

  // Save dashboard data
  saveDashboardData(data) {
    try {
      const filePath = path.join(this.dataDir, 'dashboard.json');
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return { success: true, message: 'Dashboard data saved successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Load dashboard data
  loadDashboardData() {
    try {
      const filePath = path.join(this.dataDir, 'dashboard.json');
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      return null;
    }
  }

  // Export to CSV
  exportToCSV() {
    try {
      const assessments = this.loadAllAssessments();
      if (assessments.length === 0) {
        return { success: false, error: 'No data to export' };
      }

      // Create CSV headers
      const headers = [
        'Name', 'Sector', 'Region', 'Social Media', 'Website', 'Visual Content',
        'Discoverability', 'Digital Sales', 'Platform Integration',
        'Digital Comfort', 'Content Strategy', 'Platform Breadth',
        'Investment Capacity', 'Challenge Severity', 'External Total',
        'Survey Total', 'Combined Score', 'Maturity Level', 'Assessment Date'
      ];

      // Create CSV rows
      const rows = assessments.map(assessment => [
        assessment.name || '',
        assessment.sector || '',
        assessment.region || '',
        assessment.socialMedia || 0,
        assessment.website || 0,
        assessment.visualContent || 0,
        assessment.discoverability || 0,
        assessment.digitalSales || 0,
        assessment.platformIntegration || 0,
        assessment.digitalComfort || 0,
        assessment.contentStrategy || 0,
        assessment.platformBreadth || 0,
        assessment.investmentCapacity || 0,
        assessment.challengeSeverity || 0,
        assessment.externalTotal || 0,
        assessment.surveyTotal || 0,
        assessment.combinedScore || 0,
        assessment.maturityLevel || '',
        assessment.assessmentDate || new Date().toISOString()
      ]);

      // Combine headers and rows
      const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      // Save CSV file
      const csvPath = path.join(this.dataDir, `assessments_export_${new Date().toISOString().split('T')[0]}.csv`);
      fs.writeFileSync(csvPath, csvContent);
      
      return { success: true, filePath: csvPath, message: 'Data exported to CSV successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Import from CSV
  importFromCSV(csvFilePath) {
    try {
      const csvContent = fs.readFileSync(csvFilePath, 'utf8');
      const lines = csvContent.split('\n');
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      
      const assessments = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',').map(v => v.replace(/"/g, '').trim());
          const assessment = {};
          headers.forEach((header, index) => {
            assessment[header.toLowerCase().replace(/\s+/g, '')] = values[index] || '';
          });
          return assessment;
        });

      // Save imported assessments
      const filePath = path.join(this.dataDir, 'assessments.json');
      fs.writeFileSync(filePath, JSON.stringify(assessments, null, 2));
      
      return { success: true, count: assessments.length, message: 'Data imported successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Backup data
  backup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(this.dataDir, 'backups');
      
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const assessments = this.loadAllAssessments();
      const backupPath = path.join(backupDir, `assessments_backup_${timestamp}.json`);
      fs.writeFileSync(backupPath, JSON.stringify(assessments, null, 2));
      
      return { success: true, backupPath, message: 'Backup created successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get statistics
  getStatistics() {
    const assessments = this.loadAllAssessments();
    
    if (assessments.length === 0) {
      return { total: 0, message: 'No assessments found' };
    }

    const stats = {
      total: assessments.length,
      sectors: {},
      maturityLevels: {},
      averageScores: {
        external: 0,
        survey: 0,
        combined: 0
      }
    };

    let totalExternal = 0, totalSurvey = 0, totalCombined = 0;

    assessments.forEach(assessment => {
      // Count by sector
      const sector = assessment.sector || 'Unknown';
      stats.sectors[sector] = (stats.sectors[sector] || 0) + 1;

      // Count by maturity level
      const maturity = assessment.maturityLevel || 'Unknown';
      stats.maturityLevels[maturity] = (stats.maturityLevels[maturity] || 0) + 1;

      // Sum scores
      totalExternal += parseFloat(assessment.externalTotal) || 0;
      totalSurvey += parseFloat(assessment.surveyTotal) || 0;
      totalCombined += parseFloat(assessment.combinedScore) || 0;
    });

    // Calculate averages
    stats.averageScores.external = Math.round((totalExternal / assessments.length) * 10) / 10;
    stats.averageScores.survey = Math.round((totalSurvey / assessments.length) * 10) / 10;
    stats.averageScores.combined = Math.round((totalCombined / assessments.length) * 10) / 10;

    return stats;
  }
}

module.exports = LocalStorageManager;
