#!/usr/bin/env node
// Converts Colombia bootcamp HTML decks to PDF using Puppeteer + pdf-lib.
// Usage: node export-pdf.js [deck1.html deck2.html ...]
// Requires: /tmp/pdf-gen/node_modules (puppeteer + pdf-lib installed there)

const puppeteer = require('/tmp/pdf-gen/node_modules/puppeteer');
const { PDFDocument } = require('/tmp/pdf-gen/node_modules/pdf-lib');
const path = require('path');
const fs = require('fs');
const os = require('os');

const DECKS = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [
      'sesion1-deck.html',
      'sesion2-deck.html',
      'sesion3-deck.html',
      'dia1-deck.html',
      'dia2-deck.html',
    ];

const DIR = __dirname;
const TMP_DIR = path.join(os.tmpdir(), 'colombia-pdf-screenshots');

const HIDE_CSS = `
  .topbar { display: none !important; }
  .nav-controls, .nav-btn { display: none !important; }
  button { display: none !important; }
`;

(async () => {
  fs.mkdirSync(TMP_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  for (const deck of DECKS) {
    const srcPath = path.resolve(DIR, deck);
    if (!fs.existsSync(srcPath)) { console.error(`Not found: ${srcPath}`); continue; }

    const outPath = path.resolve(DIR, deck.replace('.html', '.pdf'));
    console.log(`\nExporting ${deck}...`);

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
    await page.goto(`file://${srcPath}`, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.addStyleTag({ content: HIDE_CSS });
    await new Promise(r => setTimeout(r, 500));

    // Get absolute page-coordinate Y for each section
    const sectionTops = await page.evaluate(() =>
      Array.from(document.querySelectorAll('section')).map(s => {
        const rect = s.getBoundingClientRect();
        return Math.round(rect.top + window.scrollY);
      })
    );

    console.log(`  Found ${sectionTops.length} sections`);

    // Screenshot each section using page coordinates (clip is in page coords, not viewport)
    const pngPaths = [];
    for (let i = 0; i < sectionTops.length; i++) {
      const pngPath = path.join(TMP_DIR, `${deck}-${String(i).padStart(3, '0')}.png`);
      await page.screenshot({ path: pngPath, clip: { x: 0, y: sectionTops[i], width: 1280, height: 720 } });
      pngPaths.push(pngPath);
      process.stdout.write(`\r  Captured ${i + 1}/${sectionTops.length}`);
    }
    console.log();
    await page.close();

    // Assemble PDF with pdf-lib
    const pdfDoc = await PDFDocument.create();
    for (const pngPath of pngPaths) {
      const pngImage = await pdfDoc.embedPng(fs.readFileSync(pngPath));
      const p = pdfDoc.addPage([1280, 720]);
      p.drawImage(pngImage, { x: 0, y: 0, width: 1280, height: 720 });
    }
    fs.writeFileSync(outPath, await pdfDoc.save());
    pngPaths.forEach(p => fs.unlinkSync(p));

    const size = (fs.statSync(outPath).size / 1024 / 1024).toFixed(1);
    console.log(`  ✓ ${deck.replace('.html', '.pdf')} (${size} MB)`);
  }

  await browser.close();
  console.log('\nAll done.');
})();
