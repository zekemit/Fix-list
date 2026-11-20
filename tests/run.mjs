// End-to-end checks in a real browser. Each check can fail for the reason it tests.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execFileSync, execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execFileP = promisify(execFile);
import { serve } from '../scripts/serve.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
const SITE = 'http://127.0.0.1:4173', FIX = 'http://127.0.0.1:4174', CSP = 'http://127.0.0.1:4175';

const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '  <- ' + detail}`); };

// 1. Build
execFileSync('node', ['scripts/build.mjs'], { cwd: root, env: { ...process.env, BASE_URL: SITE }, stdio: 'pipe' });
const dist = path.join(root, 'dist');
const htmlFiles = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && htmlFiles.push(p); } })(dist);
const urlOf = (f) => { const r = '/' + path.relative(dist, f).replace(/\.html$/, ''); return r === '/index' ? '/' : r; };

const siteSrv = await serve(dist, 4173);
const fixSrv = await serve(path.join(root, 'tests/fixtures'), 4174);
const cspSrv = http.createServer((req, res) => { res.writeHead(200, { 'content-type': 'text/html', 'content-security-policy': "script-src 'self'" }); res.end(fs.readFileSync(path.join(root, 'tests/fixtures/good.html'))); });
await new Promise((r) => cspSrv.listen(4175, '127.0.0.1', r));

const browser = await chromium.launch();
try {
  // 2. The site itself must have zero axe violations (including best-practice), desktop and phone width.
  for (const vp of [{ width: 1280, height: 900 }, { width: 375, height: 800 }]) {
    const ctx = await browser.newContext({ viewport: vp });
    const page = await ctx.newPage();
    for (const f of htmlFiles) {
      const u = urlOf(f);
      await page.goto(SITE + u);
      await page.addScriptTag({ content: AXE });
      const r = await page.evaluate((tags) => axe.run(document, { runOnly: { type: 'tag', values: tags } }), TAGS);
      const meta = await page.evaluate(() => ({ lang: document.documentElement.lang, title: document.title, h1: document.querySelectorAll('h1').length, scrollX: document.documentElement.scrollWidth > window.innerWidth + 1 }));
      check(`a11y 0 violations ${vp.width}px ${u}`, r.violations.length === 0, r.violations.map((x) => x.id + ':' + x.nodes.length).join(','));
      if (vp.width === 1280) check(`meta ok ${u}`, meta.lang === 'en' && meta.title.length > 10 && meta.h1 === 1, JSON.stringify(meta));
      if (vp.width === 375) check(`no horizontal scroll at 375px ${u}`, !meta.scrollX);
    }
    await ctx.close();
  }

  // 3. Internal links resolve; titles are unique.
  const hrefs = new Set(); const titles = new Map();
  for (const f of htmlFiles) {
    const t = fs.readFileSync(f, 'utf8');
    for (const m of t.matchAll(/href="(\/[^"#?]*)"/g)) hrefs.add(m[1]);
    const title = t.match(/<title>([^<]*)<\/title>/)[1];
    titles.set(title, (titles.get(title) || 0) + 1);
  }
  let broken = [];
  for (const h of hrefs) { const r = await fetch(SITE + h); if (r.status !== 200) broken.push(h + ' ' + r.status); }
  check(`all ${hrefs.size} internal links resolve`, broken.length === 0, broken.join(', '));
  check('page titles are unique', [...titles.values()].every((n) => n === 1));
  const sitemap = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8');
  check('sitemap lists every page', htmlFiles.filter((f) => !f.endsWith('404.html')).every((f) => sitemap.includes(`${SITE}${urlOf(f) === '/' ? '/' : urlOf(f)}<`)));

  // 4. The bookmarklet, run exactly as a browser would run it, on another origin.
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(SITE + '/check');
  const href = await page.getAttribute('#bookmarklet', 'href');
  check('bookmarklet href is a javascript: URL pointing at our checker', href.startsWith('javascript:') && href.includes(SITE + '/fixlist-check.js'));
  const code = href.slice('javascript:'.length);

  const requests = [];
  const p2 = await ctx.newPage();
  p2.on('request', (r) => requests.push(r.url()));
  await p2.goto(FIX + '/bad.html');
  await p2.evaluate(code);
  await p2.waitForFunction(() => document.getElementById('fixlist-root'), null, { timeout: 15000 });
  const text = await p2.evaluate(() => document.getElementById('fixlist-root').shadowRoot.textContent);
  const n = Number((text.match(/(\d+) issue types/) || [])[1]);
  check('overlay reports the planted issues on the bad page', n >= 6, text.slice(0, 160));
  check('overlay uses plain-language labels', text.includes('Images with no alternative text') && text.includes('Form fields with no label'), text.slice(0, 300));
  check('overlay links to the order page', await p2.evaluate(() => !!document.getElementById('fixlist-root').shadowRoot.querySelector('a[href$="/order"]')));
  const focusId = await p2.evaluate(() => document.getElementById('fixlist-root').shadowRoot.activeElement && document.getElementById('fixlist-root').shadowRoot.activeElement.id);
  check('focus moves to the overlay heading', focusId === 'fl-title', String(focusId));
  const off = requests.filter((u) => !u.startsWith(SITE) && !u.startsWith(FIX));
  check('no requests to any other origin (privacy claim)', off.length === 0, off.join(', '));
  check('checker only fetched scripts from our origin', requests.filter((u) => u.startsWith(SITE)).every((u) => /\/(fixlist-check|axe\.min)\.js$/.test(u)), requests.join(' '));
  await p2.keyboard.press('Escape');
  check('Escape closes the overlay', await p2.evaluate(() => !document.getElementById('fixlist-root')));

  const p3 = await ctx.newPage();
  await p3.goto(FIX + '/good.html');
  await p3.evaluate(code);
  await p3.waitForFunction(() => document.getElementById('fixlist-root'), null, { timeout: 15000 });
  const goodText = await p3.evaluate(() => document.getElementById('fixlist-root').shadowRoot.textContent);
  check('overlay is quiet on a clean page', goodText.includes('No automated failures'), goodText.slice(0, 160));

  const p4 = await ctx.newPage();
  let dialogMsg = '';
  p4.on('dialog', (d) => { dialogMsg = d.message(); d.dismiss(); });
  await p4.goto(CSP + '/');
  await p4.evaluate(code);
  for (let i = 0; i < 50 && !dialogMsg; i++) await p4.waitForTimeout(100);
  check('bookmarklet tells the user when a site blocks outside scripts', dialogMsg.includes('blocks outside scripts'), dialogMsg || '(no message shown)');
  check('no overlay is left behind on a blocked site', await p4.evaluate(() => !document.getElementById('fixlist-root')));
  await ctx.close();

  // 5. Fulfillment pipeline: scan -> plan.
  const out = path.join(root, 'out-test'); fs.rmSync(out, { recursive: true, force: true });
  await execFileP('node', ['fulfillment/scan.cjs', FIX + '/bad.html', out], { cwd: root });
  const scanFile = fs.readdirSync(out).find((f) => f.endsWith('.json'));
  await execFileP('node', ['fulfillment/plan.mjs', path.join(out, scanFile), path.join(out, 'plan.md'), '--store', 'Test Store'], { cwd: root });
  const plan = fs.readFileSync(path.join(out, 'plan.md'), 'utf8');
  const need = ['Images with no alternative text', 'Form fields with no label', 'Links with no readable text', 'Buttons with no readable text', 'Page language not set', 'Text that is hard to read'];
  check('fix plan covers every planted issue with guidance', need.every((s) => plan.includes(s)), need.filter((s) => !plan.includes(s)).join(' | '));
  check('fix plan includes theme-ready code and exact elements', plan.includes('request.locale.iso_code') && plan.includes('```html') && plan.includes('Test Store'));
  check('fix plan carries the honest-limits disclaimer', plan.includes('not legal advice'));
} finally {
  await browser.close();
  siteSrv.close(); fixSrv.close(); cspSrv.close();
}
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
