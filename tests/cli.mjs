// Checks for the command-line tool. Each check runs the real CLI in a child process against local fixtures.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { chromium } from 'playwright-core';
import { execFile } from 'node:child_process';

const require = createRequire(import.meta.url);

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CLI = path.join(root, 'bin/fixlist.mjs');
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const fx = (n) => fs.readFileSync(path.join(root, 'tests/fixtures', n), 'utf8');

const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '  <- ' + String(detail).slice(0, 300)}`); };

const hits = [];
const pages = {
  '/bad.html': ['text/html', fx('bad.html')], '/good.html': ['text/html', fx('good.html')],
  '/data.json': ['application/json', '{"a":1}'],
  '/blocked.html': ['text/html', '<!doctype html><html lang="en"><head><title>Just a moment...</title></head><body><h1>Checking your browser</h1></body></html>'],
  '/hostile.html': ['text/html', '<!doctype html><html lang="en"><head><title>x</title></head><body><h1>x</h1><img src="a.png"><p>`</p><img src="` + "\\" + `"></body></html>'],
};
const srv = http.createServer((req, res) => {
  hits.push(req.url);
  const p = req.url.split('?')[0];
  if (p === '/csp.html') { res.writeHead(200, { 'content-type': 'text/html', 'content-security-policy': "default-src 'self'; script-src 'self'" }); res.end(fx('bad.html')); return; }
  if (p === '/slow.html') { setTimeout(() => { res.writeHead(200, { 'content-type': 'text/html' }); res.end(fx('good.html')); }, 5000); return; }
  if (p === '/gone.html') { res.writeHead(404, { 'content-type': 'text/html' }); res.end('<h1>Not found</h1>'); return; }
  if (pages[p]) { res.writeHead(200, { 'content-type': pages[p][0] }); res.end(pages[p][1]); return; }
  res.writeHead(404); res.end();
});
await new Promise((r) => srv.listen(4192, '127.0.0.1', r));
const B = 'http://127.0.0.1:4192';

const run = (args, env = {}) => new Promise((resolve) => {
  execFile('node', [CLI, ...args], { cwd: root, env: { ...process.env, ...env }, timeout: 90000 }, (err, stdout, stderr) => {
    resolve({ code: err ? (typeof err.code === 'number' ? err.code : 99) : 0, stdout, stderr });
  });
});

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fixlist-cli-'));
const browser = await chromium.launch();
try {
  // Ground truth: raw axe on the same page, same tags.
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(B + '/bad.html'); await p.addScriptTag({ content: AXE });
  const truth = await p.evaluate(() => axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } }).then((r) => ({ types: r.violations.map((v) => v.id).sort(), els: r.violations.reduce((n, v) => n + v.nodes.length, 0) })));
  await ctx.close();

  // Help, version, usage errors
  let r = await run(['--help']);
  check('--help prints usage and exits 0', r.code === 0 && r.stdout.includes('Usage:') && r.stdout.includes('--fail-on'), r.stdout);
  r = await run(['--version']);
  check('--version matches package.json', r.code === 0 && r.stdout.trim() === JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version, r.stdout);
  r = await run(['scan']);
  check('no address: exit 2 with a helpful message, no stack trace', r.code === 2 && /at least one address/.test(r.stderr) && !/\n\s+at /.test(r.stderr), r.stderr);
  r = await run(['scan', 'not a url']);
  check('malformed address: exit 2', r.code === 2 && /full address/.test(r.stderr), r.stderr);
  r = await run(['scan', 'ftp://example.com/']);
  check('non-web protocol is refused: exit 2', r.code === 2, r.stderr);
  r = await run(['scan', B + '/good.html', '--fail-on', 'banana']);
  check('bad --fail-on value: exit 2', r.code === 2, r.stderr);
  r = await run(['scan', B + '/good.html', '--wait', '-5']);
  check('bad --wait value: exit 2', r.code === 2, r.stderr);
  r = await run(['frobnicate']);
  check('unknown command: exit 2', r.code === 2 && /Unknown command/.test(r.stderr), r.stderr);

  // Real scans
  hits.length = 0;
  r = await run(['scan', B + '/bad.html', '--no-color']);
  check('bad page: exit 1 (serious issues present) and lists the planted problems',
    r.code === 1 && ['Images with no alternative text', 'Form fields with no label', 'Links with no readable text', 'Buttons with no readable text', 'Page language not set', 'Text that is hard to read'].every((s) => r.stdout.includes(s)), r.stdout);
  check('terminal output has no escape codes when piped', !/\x1b\[/.test(r.stdout));
  check('terminal output carries the honest-limits line', /not a compliance check/.test(r.stdout));
  check('only the page and its own resources were requested (nothing extra, such as a script or beacon)', hits.every((u) => ['/bad.html', '/missing.png', '/favicon.ico'].includes(u)), hits.join(' '));

  r = await run(['scan', B + '/good.html']);
  check('clean page: exit 0 and says no failures', r.code === 0 && /No automated failures/.test(r.stdout), r.stdout);

  r = await run(['scan', B + '/bad.html', '--fail-on', 'none']);
  check('--fail-on none: exit 0 even with issues', r.code === 0, r.code);
  r = await run(['scan', B + '/bad.html', '--fail-on', 'minor']);
  check('--fail-on minor: exit 1 with issues', r.code === 1, r.code);

  // JSON output equals raw axe
  r = await run(['scan', B + '/bad.html', '--format', 'json', '--fail-on', 'none']);
  let j = null; try { j = JSON.parse(r.stdout); } catch (e) { /* reported below */ }
  check('--format json prints only valid JSON to stdout', !!j && r.stdout.trim().startsWith('{'), r.stdout.slice(0, 200));
  if (j) {
    const ids = j.pages[0].violations.map((v) => v.id).sort();
    check('CLI JSON matches raw axe-core: same issue types and element count', JSON.stringify(ids) === JSON.stringify(truth.types) && j.summary.elements === truth.els, `cli ${ids.join(',')} (${j.summary.elements}) vs axe ${truth.types.join(',')} (${truth.els})`);
    check('JSON summary is consistent with its pages', j.summary.issueTypes === j.pages[0].violations.length && j.summary.pagesChecked === 1 && j.tool === 'fixlist');
  }

  // Markdown report to a file
  const md = path.join(tmp, 'sub', 'plan.md');
  r = await run(['scan', B + '/bad.html', '--out', md, '--store', 'Test Store', '--fail-on', 'none']);
  const plan = fs.existsSync(md) ? fs.readFileSync(md, 'utf8') : '';
  check('--out *.md writes a Markdown fix plan (creating folders) and says where', r.code === 0 && plan.startsWith('# Accessibility fix plan: Test Store') && r.stdout.includes('Report written to'), r.stdout + plan.slice(0, 100));
  check('fix plan has guidance, exact elements, Shopify code and the disclaimer', plan.includes('request.locale.iso_code') && plan.includes('```html') && plan.includes('not legal advice'));
  check('free CLI plan does not promise a re-check service', !plan.includes('Send us the store again'));
  check('report never contains "undefined" or "[object"', !/undefined|\[object/.test(plan + r.stdout));
  const mdo = path.join(tmp, 'order.md');
  await run(['scan', B + '/bad.html', '--out', mdo, '--order', '--fail-on', 'none']);
  check('--order adds the 14-day re-check line for paid deliveries', fs.readFileSync(mdo, 'utf8').includes('free re-check'));

  // Multiple pages, file input
  const list = path.join(tmp, 'urls.txt'); fs.writeFileSync(list, `# comment\n${B}/good.html\n\n${B}/bad.html\n${B}/bad.html\n`);
  r = await run(['scan', '--file', list, '--format', 'json', '--fail-on', 'none']);
  let jm = null; try { jm = JSON.parse(r.stdout); } catch (e) { /* below */ }
  check('--file reads addresses, skips comments/blanks, removes duplicates', !!jm && jm.pages.length === 2 && jm.summary.pagesChecked === 2, r.stdout.slice(0, 200) + r.stderr);
  r = await run(['scan', B + '/good.html', B + '/bad.html', '--format', 'md', '--fail-on', 'none']);
  check('multi-page Markdown has one section per page and totals', (r.stdout.match(/^## Page: /gm) || []).length === 2 && /Totals across pages/.test(r.stdout), r.stdout.slice(0, 300));

  // Failure handling
  r = await run(['scan', B + '/gone.html']);
  check('HTTP 404 page: exit 3 with a clear message', r.code === 3 && /HTTP 404/.test(r.stdout), r.stdout);
  r = await run(['scan', B + '/gone.html', '--allow-error-status', '--fail-on', 'none']);
  check('--allow-error-status scans an error page', r.code === 0, r.stdout);
  r = await run(['scan', B + '/data.json']);
  check('non-HTML address: exit 3, explains it is not a web page', r.code === 3 && /not a web page/.test(r.stdout), r.stdout);
  r = await run(['scan', 'http://127.0.0.1:9/']);
  check('unreachable address: exit 3, readable message, no stack trace', r.code === 3 && /Could not check/.test(r.stdout) && !/\n\s+at /.test(r.stdout + r.stderr), r.stdout + r.stderr);
  r = await run(['scan', B + '/slow.html', '--timeout', '1500']);
  check('slow page: times out with a --timeout hint instead of hanging', r.code === 3 && /--timeout/.test(r.stdout), r.stdout);
  r = await run(['scan', B + '/bad.html', B + '/gone.html', '--fail-on', 'none']);
  check('one failed page among several: others are still reported, exit 3', r.code === 3 && r.stdout.includes('Buttons with no readable text') && /HTTP 404/.test(r.stdout), r.stdout);
  r = await run(['scan', B + '/blocked.html', '--fail-on', 'none']);
  check('bot-check page is flagged, not silently reported as clean', /bot-check/.test(r.stdout), r.stdout);
  r = await run(['scan', B + '/good.html'], { FIXLIST_CHROME: path.join(tmp, 'no-such-chrome') });
  check('bad --chrome-path/FIXLIST_CHROME: exit 3 with a readable message', r.code === 3 && /Could not start a browser/.test(r.stderr) && !/\n\s+at /.test(r.stderr), r.stderr);
  r = await run(['scan', B + '/good.html'], { PLAYWRIGHT_BROWSERS_PATH: path.join(tmp, 'empty') });
  check('no browser installed: exit 3 with install instructions (or uses system Chrome if present)', r.code === 0 || (r.code === 3 && /playwright-core install chromium/.test(r.stderr)), r.stderr);
  r = await run(['scan', B + '/csp.html', '--format', 'json', '--fail-on', 'none']);
  let jc = null; try { jc = JSON.parse(r.stdout); } catch (e) { /* below */ }
  // The page's policy also blocks its inline style attribute, so the planted low-contrast text is legitimately not low-contrast there.
  const cspIds = jc ? jc.pages[0].violations.map((v) => v.id).sort() : [];
  check('works on a page whose Content-Security-Policy blocks outside scripts (the bookmarklet cannot)', !!jc && !jc.pages[0].error && JSON.stringify(cspIds) === JSON.stringify(truth.types.filter((t) => t !== 'color-contrast')), cspIds.join(',') + ' vs ' + truth.types.join(','));
  r = await run(['scan', B + '/good.html', '--mobile']);
  check('--mobile runs', r.code === 0, r.stdout + r.stderr);
} finally {
  await browser.close(); srv.close();
  fs.rmSync(tmp, { recursive: true, force: true });
}
const failed = results.filter((x) => !x.ok);
console.log(`\nCLI: ${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
