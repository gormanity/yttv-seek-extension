/**
 * build.js — Compile and bundle TypeScript source to dist/.
 *
 * Usage: node scripts/build.js
 *
 * Entry points:
 *   src/content/seek-controller.ts  → dist/content/seek-controller.js  (IIFE)
 *   src/background/service-worker.ts → dist/background/service-worker.js (ESM)
 *   src/options/init.ts              → dist/options/init.js              (ESM)
 *   src/popup/popup.ts               → dist/popup/popup.js               (ESM, es2022 for TLA)
 *
 * Static assets copied as-is:
 *   src/content/seek-controller.css  → dist/content/
 *   src/options/options.html         → dist/options/
 *   src/options/options.css          → dist/options/
 *   src/popup/popup.html             → dist/popup/
 *   src/popup/popup.css              → dist/popup/
 */

import * as esbuild from 'esbuild';
import { copyFileSync, cpSync, mkdirSync } from 'fs';

const ensureDir = (dir) => mkdirSync(dir, { recursive: true });

ensureDir('dist/content');
ensureDir('dist/background');
ensureDir('dist/options');
ensureDir('dist/popup');

await Promise.all([
  esbuild.build({
    entryPoints: ['src/content/seek-controller.ts'],
    bundle: true,
    format: 'iife',
    outfile: 'dist/content/seek-controller.js',
    target: 'es2020',
  }),
  esbuild.build({
    entryPoints: ['src/background/service-worker.ts'],
    bundle: true,
    format: 'esm',
    outfile: 'dist/background/service-worker.js',
    target: 'es2020',
  }),
  esbuild.build({
    entryPoints: ['src/options/init.ts'],
    bundle: true,
    format: 'esm',
    outfile: 'dist/options/init.js',
    target: 'es2020',
  }),
  esbuild.build({
    entryPoints: ['src/popup/popup.ts'],
    bundle: true,
    format: 'esm',
    outfile: 'dist/popup/popup.js',
    target: 'es2022',
  }),
]);

// Copy static assets
copyFileSync('src/content/seek-controller.css', 'dist/content/seek-controller.css');
copyFileSync('src/options/options.html', 'dist/options/options.html');
copyFileSync('src/options/options.css', 'dist/options/options.css');
copyFileSync('src/popup/popup.html', 'dist/popup/popup.html');
copyFileSync('src/popup/popup.css', 'dist/popup/popup.css');

// Copy extension root files so dist/ is a self-contained unpacked extension
copyFileSync('manifest.json', 'dist/manifest.json');
cpSync('icons', 'dist/icons', { recursive: true });

console.log('Build complete.');
