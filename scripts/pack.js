/**
 * pack.js — Produce distributable zip archives.
 *
 * Usage: node scripts/pack.js  (or via `npm run pack` which runs build first)
 *
 * Outputs:
 *   dist/smart-seek-{version}-chrome.zip   — For Chrome Web Store
 *   dist/smart-seek-{version}-edge.zip     — For Microsoft Edge Add-ons
 *   dist/smart-seek-{version}-firefox.zip  — For Firefox Add-ons (AMO)
 *
 * Chrome and Edge use service_worker only (MV3 rejects background.scripts).
 * Firefox needs background.scripts as a fallback and ignores service_worker.
 */

import { execSync } from 'child_process';
import { mkdirSync, existsSync, rmSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const root = new URL('..', import.meta.url).pathname;
const dist = join(root, 'dist');
const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

if (!existsSync(dist)) mkdirSync(dist);

// Remove macOS metadata files that macOS silently drops into directories.
execSync('find . -name ".DS_Store" -delete', { cwd: dist });

const manifestPath = join(dist, 'manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

// Chromium manifest: strip background.scripts (rejected by Chrome/Edge MV3).
const chromiumManifest = structuredClone(manifest);
delete chromiumManifest.background.scripts;

// Firefox manifest: strip background.service_worker (unsupported; scripts is the fallback).
const firefoxManifest = structuredClone(manifest);
delete firefoxManifest.background.service_worker;

function zip(name, patchedManifest) {
  writeFileSync(manifestPath, JSON.stringify(patchedManifest, null, 2));
  const out = join(dist, name);
  if (existsSync(out)) rmSync(out);
  execSync(`zip -r "${out}" . -x "*.zip"`, { cwd: dist, stdio: 'inherit' });
  console.log(`Created ${out}`);
}

zip(`smart-seek-${version}-chrome.zip`, chromiumManifest);
zip(`smart-seek-${version}-edge.zip`,   chromiumManifest);
zip(`smart-seek-${version}-firefox.zip`, firefoxManifest);

// Restore the original manifest so dist/ stays in a clean state.
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
