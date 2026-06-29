#!/usr/bin/env node
/**
 * Tourism Commons build script.
 * Reads projects.json and builds/copies each entry into build/.
 *
 * Entry types:
 *   react        — runs `npm run build` in src dir, copies dist/ → build/{id}/
 *   static-file  — copies a single file → build/{dest}
 *   static-dir   — copies a directory  → build/{dest}
 *
 * Adding a new project: add one line to projects.json, nothing else.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BUILD = path.join(ROOT, 'build');
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects.json'), 'utf8'));

function run(cmd, cwd) {
  console.log(`\n$ ${cmd}${cwd ? ` (in ${path.relative(ROOT, cwd)})` : ''}`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  run(`cp -r ${src}/. ${dest}`);
}

// 1. Build website (landing page)
console.log('\n=== website ===');
const websiteSrc = path.join(ROOT, 'website');
run('npm install', websiteSrc);
run('npm run build', websiteSrc);
fs.mkdirSync(BUILD, { recursive: true });
copyDir(path.join(websiteSrc, 'dist'), BUILD);
console.log('Built website → build/');

// 2. Build all entries from projects.json
const allEntries = [...(config.tools || []), ...(config.projects || [])];

for (const entry of allEntries) {
  console.log(`\n=== ${entry.id} (${entry.type}) ===`);
  const srcAbs = path.join(ROOT, entry.src);

  if (entry.type === 'react') {
    run('npm run build', srcAbs);
    const dest = path.join(BUILD, entry.dest || entry.id);
    fs.mkdirSync(dest, { recursive: true });
    copyDir(path.join(srcAbs, 'dist'), dest);

  } else if (entry.type === 'static-file') {
    const dest = path.join(BUILD, entry.dest || `${entry.id}/index.html`);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(srcAbs, dest);
    console.log(`Copied ${entry.src} → build/${entry.dest || `${entry.id}/index.html`}`);

  } else if (entry.type === 'static-dir') {
    const dest = path.join(BUILD, entry.dest || entry.id);
    copyDir(srcAbs, dest);
    console.log(`Copied ${entry.src}/ → build/${entry.dest || entry.id}/`);

  } else {
    console.error(`Unknown type "${entry.type}" for entry "${entry.id}"`);
    process.exit(1);
  }
}

console.log('\n✓ Build complete');
