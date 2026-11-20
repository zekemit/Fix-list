// One-off: renders the Fixlist mark to the PNG sizes Chrome needs. Run: node scripts/make-icons.mjs
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../extension/icons');
const svg = (n) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="${n}" height="${n}"><rect x="1" y="1" width="26" height="26" rx="6" fill="#101B33"/><path d="M7.500 14.500l4.500 4.500 8.500-10" fill="none" stroke="#FFE14D" stroke-width="3.400" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const browser = await chromium.launch();
for (const n of [16, 32, 48, 128]) {
  const page = await browser.newPage({ viewport: { width: n, height: n }, deviceScaleFactor: 1 });
  await page.setContent(`<body style="margin:0;background:transparent">${svg(n)}</body>`);
  await page.screenshot({ path: path.join(out, `icon-${n}.png`), omitBackground: true, clip: { x: 0, y: 0, width: n, height: n } });
  await page.close();
}
await browser.close();
console.log('wrote icons to', out);
