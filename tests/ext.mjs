// Checks for the Chrome extension: the shipped files, then a real Chromium with the extension loaded.
// Limit, stated plainly: Chrome only grants "activeTab" on a real toolbar click, which a script cannot perform.
// So the browser tests load a COPY of the build whose manifest also lists http://127.0.0.1/* as a host, and call
// the same function the click handler calls. The shipped manifest is checked separately below.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { unzipSync } from 'fflate';
import { chromium } from 'playwright-core';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fx = (n) => fs.readFileSync(path.join(root, 'tests/fixtures', n), 'utf8');
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '  <- ' + String(detail).slice(0, 300)}`); };

// ---- 1. Build into a temp folder and inspect what ships ---------------------
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fixlist-ext-'));
const out = path.join(tmp, 'build');
execFileSync('node', ['scripts/build-extension.mjs'], { cwd: root, env: { ...process.env, EXT_OUT: out, BASE_URL: 'https://fix-list.vercel.app' }, stdio: 'pipe' });
const unpacked = path.join(out, 'unpacked');
const manifest = JSON.parse(fs.readFileSync(path.join(unpacked, 'manifest.json'), 'utf8'));

check('manifest is Manifest V3 with the package version', manifest.manifest_version === 3 && manifest.version === pkg.version, JSON.stringify(manifest.version));
check('permissions are exactly activeTab and scripting', JSON.stringify([...manifest.permissions].sort()) === '["activeTab","scripting"]', JSON.stringify(manifest.permissions));
check('no host permissions, content scripts, remote pages or web-accessible resources',
  !manifest.host_permissions && !manifest.optional_host_permissions && !manifest.content_scripts && !manifest.web_accessible_resources && !manifest.externally_connectable && !manifest.content_security_policy, JSON.stringify(Object.keys(manifest)));
check('keyboard shortcut is declared for the toolbar action', manifest.commands && manifest.commands._execute_action && !!manifest.commands._execute_action.suggested_key.default);
const iconOk = Object.entries(manifest.icons).every(([size, rel]) => {
  const b = fs.readFileSync(path.join(unpacked, rel));
  return b.readUInt32BE(16) === +size && b.readUInt32BE(20) === +size && b.subarray(1, 4).toString() === 'PNG';
});
check('icons exist and have the sizes the manifest claims', iconOk && ['16', '32', '48', '128'].every((s) => manifest.icons[s]));
check('every file the manifest points to exists', [manifest.background.service_worker, ...Object.values(manifest.action.default_icon)].every((f) => fs.existsSync(path.join(unpacked, f))));
check('manifest name and description are within Chrome Web Store limits (45 / 132 characters)', manifest.name.length <= 45 && manifest.description.length <= 132, `${manifest.name.length} / ${manifest.description.length}`);

const axeShipped = fs.readFileSync(path.join(unpacked, 'axe.min.js'));
check('axe-core in the extension is byte-identical to the npm package', sha(axeShipped) === sha(fs.readFileSync(require.resolve('axe-core/axe.min.js'))));
check('axe-core licence is shipped', /Mozilla Public License/.test(fs.readFileSync(path.join(unpacked, 'axe-core-LICENSE.txt'), 'utf8')));
const panel = fs.readFileSync(path.join(unpacked, 'fixlist-check.js'), 'utf8');
check('panel script has its rules and site address filled in (no leftover tokens)', !panel.includes('__RULES__') && !panel.includes('__SITE__') && panel.includes('"https://fix-list.vercel.app"') && panel.includes('"image-alt"'));
const ours = [fs.readFileSync(path.join(unpacked, 'background.js'), 'utf8'), panel].join('\n');
check('our code has no network calls (fetch, XHR, WebSocket, beacon, EventSource, importScripts)', !/\b(fetch|XMLHttpRequest|WebSocket|sendBeacon|EventSource|importScripts)\b/.test(ours), (ours.match(/\b(fetch|XMLHttpRequest|WebSocket|sendBeacon|EventSource|importScripts)\b/) || [''])[0]);
check('our code does not use eval or new Function', !/\beval\s*\(|new Function\s*\(/.test(ours));
const zipFile = path.join(out, `fixlist-extension-${pkg.version}.zip`);
const zipped = unzipSync(new Uint8Array(fs.readFileSync(zipFile)));
const onDisk = []; (function walk(d, p = '') { for (const n of fs.readdirSync(d)) { const f = path.join(d, n); fs.statSync(f).isDirectory() ? walk(f, p + n + '/') : onDisk.push(p + n); } })(unpacked);
check('the zip contains exactly the unpacked files, manifest at the top level', JSON.stringify(Object.keys(zipped).sort()) === JSON.stringify(onDisk.sort()) && 'manifest.json' in zipped, Object.keys(zipped).join());
const committed = path.join(root, 'releases', `fixlist-extension-${pkg.version}.zip`);
check('the zip committed in releases/ matches what the current source builds (rebuild and copy it if this fails)', fs.existsSync(committed) && sha(fs.readFileSync(committed)) === sha(fs.readFileSync(zipFile)));
check('the zip is small enough to upload (under 2 MB)', fs.statSync(zipFile).size < 2 * 1024 * 1024);

// ---- 2. Real Chromium with the extension loaded ------------------------------
const testExt = path.join(tmp, 'ext-for-test');
fs.cpSync(unpacked, testExt, { recursive: true });
const tm = JSON.parse(fs.readFileSync(path.join(testExt, 'manifest.json'), 'utf8')); tm.host_permissions = ['http://127.0.0.1/*']; // test-only
fs.writeFileSync(path.join(testExt, 'manifest.json'), JSON.stringify(tm));

const requests = [];
const srv = http.createServer((req, res) => {
  requests.push(req.url);
  const p = req.url.split('?')[0];
  const html = { '/bad.html': fx('bad.html'), '/good.html': fx('good.html'), '/csp.html': fx('bad.html') }[p];
  if (!html) { res.writeHead(404); res.end(); return; }
  const h = { 'content-type': 'text/html' };
  if (p === '/csp.html') h['content-security-policy'] = "default-src 'self'; script-src 'self'";
  res.writeHead(200, h); res.end(html);
});
await new Promise((r) => srv.listen(4194, '127.0.0.1', r));
const B = 'http://127.0.0.1:4194';
const AXE = axeShipped.toString('utf8');
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

let ctx;
try {
  ctx = await chromium.launchPersistentContext(fs.mkdtempSync(path.join(tmp, 'profile-')), {
    channel: 'chromium', headless: true,
    args: [`--disable-extensions-except=${testExt}`, `--load-extension=${testExt}`],
  });
  let sw = ctx.serviceWorkers()[0] || await ctx.waitForEvent('serviceworker', { timeout: 20000 });
  check('extension loads in Chromium and its service worker starts', sw.url().startsWith('chrome-extension://') && sw.url().endsWith('/background.js'), sw.url());

  const allRequests = [];
  ctx.on('request', (r) => allRequests.push(r.url()));
  const trigger = async (page) => {
    await page.bringToFront();
    // Without a host permission Chrome hides the url of restricted pages, so fall back to the active tab.
    const tabId = await sw.evaluate(async (url) => { const tab = (await chrome.tabs.query({})).find((x) => x.url === url) || (await chrome.tabs.query({ active: true }))[0]; return tab.id; }, page.url());
    await sw.evaluate((id) => fixlistRun({ id }), tabId);
    return tabId;
  };
  const panelText = (page) => page.evaluate(() => { const h = document.getElementById('fixlist-root'); return h ? h.shadowRoot.querySelector('.panel').textContent : null; });

  // Ground truth for bad.html from raw axe in a normal page of the same browser.
  const gt = await ctx.newPage();
  await gt.goto(B + '/bad.html'); await gt.evaluate(AXE);
  const truth = await gt.evaluate((tags) => axe.run(document, { runOnly: { type: 'tag', values: tags } }).then((r) => ({ types: r.violations.length, els: r.violations.reduce((n, v) => n + v.nodes.length, 0) })), TAGS);
  await gt.close();

  // bad page
  let page = await ctx.newPage(); await page.goto(B + '/bad.html');
  requests.length = 0; allRequests.length = 0;
  await trigger(page);
  await page.waitForFunction(() => document.getElementById('fixlist-root'), null, { timeout: 15000 });
  let t = await panelText(page);
  const m = t.match(/(\d+) issue types . (\d+) elements/);
  const planted = ['Images with no alternative text', 'Form fields with no label', 'Links with no readable text', 'Buttons with no readable text', 'Page language not set', 'Text that is hard to read'];
  check('clicking runs the check and lists the 5 most important of the 6 planted problems in plain language, and says it is showing 5 of 6',
    planted.filter((s) => t.includes(s)).length === 5 && /Showing the 5 most important of 6 issue types/.test(t), t);
  check('numbers shown equal raw axe-core on the same page', !!m && +m[1] === truth.types && +m[2] === truth.els, `${m && m[0]} vs ${JSON.stringify(truth)}`);
  check('the panel is a labelled dialog and focus moves into it', await page.evaluate(() => {
    const host = document.getElementById('fixlist-root'); const d = host.shadowRoot.querySelector('[role=dialog]');
    return !!d && d.getAttribute('aria-labelledby') === 'fl-title' && host.shadowRoot.activeElement && host.shadowRoot.activeElement.id === 'fl-title';
  }));
  check('the panel links to the fix plan on the live site', await page.evaluate(() => [...document.getElementById('fixlist-root').shadowRoot.querySelectorAll('a')].some((a) => a.href === 'https://fix-list.vercel.app/order')));
  check('the page itself made only its own requests (nothing extra sent anywhere)', allRequests.every((u) => u.startsWith(B) || u.startsWith('data:') || u.startsWith('chrome-extension://')), allRequests.filter((u) => !u.startsWith(B)).join(' '));
  check('the page was not given an axe global in its own JavaScript world', await page.evaluate(() => typeof window.axe === 'undefined'));

  await trigger(page); await page.waitForTimeout(500);
  check('a second click does not stack a second panel', await page.evaluate(() => document.querySelectorAll('#fixlist-root').length) === 1);
  await page.keyboard.press('Escape');
  check('Escape closes the panel', await page.evaluate(() => !document.getElementById('fixlist-root')));
  await trigger(page);
  await page.waitForFunction(() => document.getElementById('fixlist-root'), null, { timeout: 15000 }).then(() => check('clicking again after closing reopens it (axe is not injected twice)', true), () => check('clicking again after closing reopens it (axe is not injected twice)', false));
  await page.close();

  // clean page
  page = await ctx.newPage(); await page.goto(B + '/good.html'); await trigger(page);
  await page.waitForFunction(() => document.getElementById('fixlist-root'), null, { timeout: 15000 });
  t = await panelText(page);
  check('clean page: says no failures and does not claim the page is accessible', /No automated failures/.test(t) && /does not mean the page is fully accessible/.test(t), t);
  await page.close();

  // page with a Content-Security-Policy that blocks outside scripts (the bookmarklet cannot run here)
  page = await ctx.newPage(); await page.goto(B + '/csp.html'); await trigger(page);
  await page.waitForFunction(() => document.getElementById('fixlist-root'), null, { timeout: 15000 }).catch(() => {});
  t = await panelText(page);
  check('works on a page whose Content-Security-Policy blocks outside scripts', !!t && /issue types/.test(t) && /Buttons with no readable text/.test(t), String(t));
  await page.close();

  // a page Chrome does not allow extensions on: fails visibly, not silently
  page = await ctx.newPage(); await page.goto('chrome://version/');
  const tabId = await trigger(page);
  await page.waitForTimeout(700);
  const badge = await sw.evaluate((id) => chrome.action.getBadgeText({ tabId: id }), tabId);
  const title = await sw.evaluate((id) => chrome.action.getTitle({ tabId: id }), tabId);
  check('on a page Chrome blocks (chrome://), the button shows "!" and explains why', badge === '!' && /cannot run on this page/.test(title), `${badge} | ${title}`);
  await page.close();

  // reviewing the shipped manifest limits again, from the loaded extension's own point of view
  const perms = await sw.evaluate(() => chrome.runtime.getManifest().permissions);
  check('the loaded extension reports only activeTab and scripting', JSON.stringify([...perms].sort()) === '["activeTab","scripting"]', JSON.stringify(perms));
} catch (e) {
  check('browser tests ran without an unexpected error', false, e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e);
} finally {
  if (ctx) await ctx.close();
  srv.close();
  fs.rmSync(tmp, { recursive: true, force: true });
}
const failed = results.filter((r) => !r.ok);
console.log(`\nExtension: ${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
