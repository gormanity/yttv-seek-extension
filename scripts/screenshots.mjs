/**
 * screenshots.mjs — Render store screenshot HTML mockups to PNG.
 *
 * Usage: node scripts/screenshots.mjs
 *
 * Outputs 1280×800 PNGs to store/screenshots/.
 */

import puppeteer from 'puppeteer';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const dir = resolve(fileURLToPath(import.meta.url), '../../store/screenshots');
const files = ['01-osd', '02-popup', '03-options'];

const browser = await puppeteer.launch({ headless: true });

for (const name of files) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
  await page.goto(`file://${dir}/${name}.html`, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: `${dir}/${name}.png` });
  await page.close();
  console.log(`${name}.png done`);
}

await browser.close();
