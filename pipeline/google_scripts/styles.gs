/**
 * Shared UI theme and styling helpers
 */

function UITheme() {
  return {
    primary: '#1565c0', // Expert (blue)
    secondary: '#7b1fa2',
    success: '#28a745', // Advanced (green)
    info: '#17a2b8',
    warning: '#ffc107', // Intermediate (yellow)
    danger: '#dc3545', // Absent (red)
    orange: '#ff9800', // Emerging (orange)
    surface: '#e8f0fe',
    surfaceAlt: '#e3f2fd',
    successSurface: '#d4edda',
    warningSurface: '#fff3cd',
    dangerSurface: '#f8d7da',
    accentSurface: '#f3e5f5'
  };
}

function applySectionHeader(sheet, rangeA1, text, colorKey) {
  const t = UITheme();
  const range = sheet.getRange(rangeA1);
  range.setValues([[text]])
       .setBackground(t[colorKey] || t.primary)
       .setFontColor('white')
       .setFontWeight('bold')
       .setFontSize(12);
}

function applyTableHeader(sheet, rangeA1) {
  const t = UITheme();
  sheet.getRange(rangeA1)
       .setBackground(t.surface)
       .setFontWeight('bold');
}

function applyTitle(sheet, rangeA1) {
  sheet.getRange(rangeA1)
       .setFontSize(14)
       .setHorizontalAlignment('center');
}

function applySubtitle(sheet, rangeA1) {
  sheet.getRange(rangeA1)
       .setFontSize(11)
       .setHorizontalAlignment('center')
       .setFontStyle('italic');
}

function colorCellByPriority(cellRange, priority) {
  const t = UITheme();
  switch (priority) {
    case 'Critical':
      cellRange.setBackground(t.danger).setFontColor('white');
      break;
    case 'High':
      cellRange.setBackground(t.warning).setFontColor('white');
      break;
    case 'Medium':
      cellRange.setBackground(t.warningSurface);
      break;
    case 'Low':
      cellRange.setBackground(t.surfaceAlt);
      break;
  }
}


