/**
 * Common sheet formatting utilities
 */

function applyDefaultSheetFrame(sheet) {
  try {
    sheet.setFrozenRows(4);
  } catch (e) {}
}


