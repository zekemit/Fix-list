// Renders the share image and the README screenshots from the real build and the real tools.
// Run after `npm run build`:  node scripts/make-assets.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execFileP = promisify(execFile);
import { chromium } from 'playwright-core';
import { serve } from './serve.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const assets = path.join(root, 'marketing/assets');
fs.mkdirSync(assets, { recursive: true });

const site = await serve(dist, 4180);
const demo = await serve(path.join(root, 'marketing'), 4181);
const browser = await chromium.launch();
try {
  // 1. Share image 1200x630: headline plus the real before/after card from the home page.
  const home = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
  const figure = home.match(/<figure class="demo"[\s\S]*?<\/figure>/)[0].replace(/<div class="seg"[\s\S]*?<\/div>/, '');
  const og = await browser.newPage({ viewport: { width: 1200, height: 630 }, reducedMotion: 'reduce' });
  await og.setContent(`<!doctype html><html lang="en"><head><meta charset="utf-8"><base href="http://127.0.0.1:4180/"><link rel="stylesheet" href="/style.css">
  <style>body{margin:0;width:1200px;height:630px;overflow:hidden;background:#F6F7F9}
  .frame{display:grid;grid-template-columns:560px 1fr;gap:56px;padding:56px 64px;height:630px;align-items:center}
  .frame h1{font-size:74px;line-height:.98;letter-spacing:-.035em;margin:0}
  .frame .brandline{display:flex;align-items:center;gap:14px;margin-top:36px;font:700 28px var(--display);letter-spacing:-.02em}
  .frame .url{font:500 22px var(--text);color:#4A5568;margin-top:10px}
  .demo{margin:0;zoom:.78}
  .said-intro{display:none}</style></head><body class="home"><div class="frame"><div>
  <h1>Hear your store the way a screen reader does.</h1>
  <div class="brandline"><svg viewBox="0 0 28 28" width="44" height="44" aria-hidden="true"><rect x="2" y="2" width="24" height="24" rx="6" fill="#101B33"/><path d="M8 14.500l4 4 8-9" fill="none" stroke="#FFE14D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>Fixlist</div>
  <div class="url">Free accessibility check for online stores. Open source.</div></div>${figure}</div></body></html>`);
  await og.evaluate(() => document.documentElement.classList.add('js'));
  await og.waitForTimeout(400);
  await og.screenshot({ path: path.join(root, 'src/img/og.png') });
  await og.close();

  // 2. Home page screenshot (what visitors see first).
  const hp = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  await hp.goto('http://127.0.0.1:4180/'); await hp.waitForTimeout(500);
  await hp.screenshot({ path: path.join(assets, 'home.png') });
  await hp.close();

  // 3. The panel on a demo store page, using the real extension/bookmarklet code path (same fixlist-check.js + axe).
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  const sp = await ctx.newPage();
  await sp.goto('http://127.0.0.1:4181/demo-store.html');
  await sp.evaluate(fs.readFileSync(path.join(dist, 'axe.min.js'), 'utf8'));
  await sp.evaluate(fs.readFileSync(path.join(dist, 'fixlist-check.js'), 'utf8'));
  await sp.waitForFunction(() => document.getElementById('fixlist-root'));
  await sp.screenshot({ path: path.join(assets, 'panel.png') });
  await ctx.close();
} finally {
  await browser.close(); site.close(); demo.close();
}

// 4. The command line on the same demo page, rendered from its real output.
const demoSrv = await serve(path.join(root, 'marketing'), 4182);
let out;
try {
  // async, because a synchronous child process would freeze the in-process server it is scanning
  out = (await execFileP('node', [path.join(root, 'bin/fixlist.mjs'), 'scan', 'http://127.0.0.1:4182/demo-store.html', '--no-color', '--fail-on', 'none'])).stdout;
} finally { demoSrv.close(); }
out = out.replace('http://127.0.0.1:4182/demo-store.html', 'https://your-store.com/products/blue-mug').split('\n').filter((l) => !l.startsWith('Automated checks')).join('\n');
const b2 = await chromium.launch();
const tp = await b2.newPage({ viewport: { width: 960, height: 560 }, deviceScaleFactor: 2 });
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
await tp.setContent(`<!doctype html><meta charset="utf-8"><style>@font-face{font-family:M;src:url(file://${path.join(dist, 'fonts/atkinson-hyperlegible-mono-latin-wght-normal.woff2')})}
body{margin:0;background:#E8EBF1;padding:28px}.t{background:#101B33;color:#EEF1F8;border-radius:12px;padding:26px 30px;font:18px/1.55 M,monospace;white-space:pre}
.p{color:#FFE14D}</style><div class="t"><span class="p">$</span> npx github:zekemit/fix-list scan https://your-store.com/products/blue-mug\n\n${esc(out.trimEnd())}</div>`);
await tp.waitForTimeout(300);
await tp.locator('.t').screenshot({ path: path.join(assets, 'cli.png') });
await b2.close();
console.log('assets written');
