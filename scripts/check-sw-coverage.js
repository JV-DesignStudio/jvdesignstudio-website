#!/usr/bin/env node
// A1995: service worker coverage check.
// Parses every local asset reference out of index.html and asserts each one
// appears in sw.js's CACHED_FILES array.  Mirrors the same registry-vs-reality
// pattern used for the search-index audit.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const swSrc = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');

// ── parse CACHED_FILES from sw.js ────────────────────────────────────────────
const swMatch = swSrc.match(/const CACHED_FILES\s*=\s*\[([\s\S]*?)\];/);
if (!swMatch) {
  console.error('ERROR: could not locate CACHED_FILES array in sw.js');
  process.exit(1);
}
const cachedFiles = new Set(
  swMatch[1]
    .split('\n')
    .map(line => line.trim().replace(/^['"`]|['"`],?$/g, '').trim())
    .filter(Boolean)
);

// ── extract local asset references from index.html ───────────────────────────
// Matches src="..." and href="..." values that are local (not http/# /mailto:)
const localAssets = new Set(['/', '/index.html']);
const attrRe = /(?:src|href)="([^"]+)"/g;
let m;
while ((m = attrRe.exec(html)) !== null) {
  const val = m[1].trim();
  if (
    val.startsWith('http') ||
    val.startsWith('//') ||
    val.startsWith('#') ||
    val.startsWith('mailto:') ||
    val === ''
  ) continue;
  // Normalise to absolute path
  localAssets.add(val.startsWith('/') ? val : `/${val}`);
}

// ── compare ───────────────────────────────────────────────────────────────────
let failed = false;
const missing = [];
for (const asset of localAssets) {
  if (!cachedFiles.has(asset)) {
    missing.push(asset);
    failed = true;
  }
}

if (failed) {
  console.error('SW coverage FAIL — these assets are in index.html but missing from CACHED_FILES in sw.js:');
  missing.forEach(a => console.error(`  ✗  ${a}`));
  console.error('\nAdd them to CACHED_FILES in sw.js and bump CACHE_NAME.');
  process.exit(1);
}

console.log(`SW coverage OK — ${localAssets.size} local assets checked, all present in CACHED_FILES`);
