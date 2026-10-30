#!/usr/bin/env node
// A1994: clean build check — copies site files to dist/ and verifies no unexpected drift.
// Exits non-zero if any expected file is missing or any untracked file appears in dist/.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

// Canonical list of files that belong in the published build.
// Update this list when intentionally adding or removing a site file.
const SITE_FILES = [
  'index.html',
  'sw.js',
  'Logo Design.png',
  'Front Cover Concept.jpg',
  '1760176446427~2.jpg',
  'privacy_policy.md',
  'terms_of_service.md',
];

let ok = true;

// Ensure dist/ exists
if (!fs.existsSync(DIST)) fs.mkdirSync(DIST, { recursive: true });

// Copy each expected file; fail if the source is missing
for (const file of SITE_FILES) {
  const src = path.join(ROOT, file);
  if (!fs.existsSync(src)) {
    console.error(`ERROR: expected source file missing: "${file}"`);
    ok = false;
    continue;
  }
  fs.copyFileSync(src, path.join(DIST, file));
}

// Detect drift: files in dist/ that aren't in SITE_FILES
const distEntries = fs.readdirSync(DIST);
const unexpected = distEntries.filter(f => !SITE_FILES.includes(f));
if (unexpected.length > 0) {
  console.error('ERROR: unexpected files in dist/ (file drift detected):');
  unexpected.forEach(f => console.error(`  - ${f}`));
  ok = false;
}

if (!ok) process.exit(1);
console.log(`build OK — ${SITE_FILES.length} files copied to dist/`);
