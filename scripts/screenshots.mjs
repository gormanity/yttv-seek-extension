/**
 * screenshots.mjs — Render store screenshot HTML mockups to PNG.
 *
 * Usage: node scripts/screenshots.mjs
 *
 * Requires: Google Chrome installed at the default macOS path.
 *           ImageMagick (magick) for post-crop.
 */

import { execFileSync } from 'child_process';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OVERHEAD = 87; // Chrome --headless=new internal overhead in px (measured empirically)

const dir = resolve(fileURLToPath(import.meta.url), '../../store/screenshots');

const files = [
  { name: '01-osd',         w: 1280, h: 800 },
  { name: '02-popup',       w: 1280, h: 800 },
  { name: '03-options',     w: 1280, h: 800 },
  { name: '04-small-promo', w: 440,  h: 280 },
  { name: '05-marquee-promo', w: 1400, h: 560 },
];

for (const { name, w, h } of files) {
  const out = `${dir}/${name}.png`;
  execFileSync(CHROME, [
    '--headless=new',
    `--screenshot=${out}`,
    `--window-size=${w},${h + OVERHEAD + 13}`,  // +13 extra buffer
    '--force-device-scale-factor=1',
    '--no-sandbox',
    `file://${dir}/${name}.html`,
  ], { stdio: 'pipe' });
  execFileSync('magick', [out, '-crop', `${w}x${h}+0+0`, '+repage', out]);
  console.log(`${name}.png done`);
}
