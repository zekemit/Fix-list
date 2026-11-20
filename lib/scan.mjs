// Scan engine shared by the CLI. One page in, one plain result object out.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { chromium } from 'playwright-core';

const require = createRequire(import.meta.url);
export const AXE_PATH = require.resolve('axe-core/axe.min.js');
const AXE_SOURCE = fs.readFileSync(AXE_PATH, 'utf8');
export const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

export class BrowserMissingError extends Error {}

// Try the browser Playwright installed, then the user's own Chrome or Edge.
export async function launchBrowser({ chromePath } = {}) {
  const explicit = chromePath || process.env.FIXLIST_CHROME;
  if (explicit) return chromium.launch({ executablePath: explicit });
  const attempts = [{}, { channel: 'chrome' }, { channel: 'msedge' }];
  for (const opts of attempts) {
    try { return await chromium.launch(opts); } catch { /* try the next one */ }
  }
  throw new BrowserMissingError(
    'No browser found. Install one with:  npx playwright-core install chromium\n' +
    'or point Fixlist at Chrome, Edge or Chromium with --chrome-path <file> (or the FIXLIST_CHROME variable).'
  );
}

const BOT_TITLE = /just a moment|attention required|access denied|verify you are (a )?human|are you a robot|captcha/i;

function friendly(e, timeout) {
  const m = String(e && e.message ? e.message : e).split('\n')[0];
  if (/ERR_NAME_NOT_RESOLVED/.test(m)) return 'The address was not found (check the spelling).';
  if (/ERR_CONNECTION_REFUSED/.test(m)) return 'The server refused the connection.';
  if (/ERR_CERT_|SSL/.test(m)) return 'The site\'s security certificate was not accepted.';
  if (/ERR_UNSAFE_PORT/.test(m)) return 'The browser will not connect to that port.';
  if (/Timeout .*exceeded|ERR_TIMED_OUT/.test(m)) return `The page did not finish loading within ${Math.round(timeout / 1000)} seconds (try --timeout).`;
  if (/ERR_TUNNEL_CONNECTION_FAILED|ERR_PROXY/.test(m)) return 'Could not reach the address (network or proxy refused it).';
  if (/ERR_INTERNET_DISCONNECTED|ERR_NETWORK_CHANGED/.test(m)) return 'No internet connection.';
  return m.replace(/^page\.goto: /, '');
}

export async function scanPage(browser, url, { wait = 1500, timeout = 30000, mobile = false, allowErrorStatus = false } = {}) {
  const context = await browser.newContext({
    viewport: mobile ? { width: 375, height: 800 } : { width: 1280, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const rec = {
    url, finalUrl: null, status: null, title: null, scannedAt: new Date().toISOString(),
    axeVersion: null, needsReview: 0, violations: [], warnings: [], error: null,
  };
  try {
    const resp = await page.goto(url, { waitUntil: 'load', timeout });
    rec.status = resp ? resp.status() : null;
    const type = resp ? (resp.headers()['content-type'] || '') : '';
    if (resp && type && !/html|xml/i.test(type)) throw new Error(`The address returned ${type.split(';')[0]}, not a web page.`);
    if (rec.status >= 400 && !allowErrorStatus) throw new Error(`The page returned HTTP ${rec.status}, so there is nothing meaningful to check. Use --allow-error-status to scan it anyway.`);
    if (wait > 0) await page.waitForTimeout(wait);
    // Evaluated through the browser's debugging channel, not a <script> tag, so a site's Content-Security-Policy
    // cannot block it and the page's own behaviour is left untouched.
    await page.evaluate(AXE_SOURCE);
    const result = await page.evaluate(
      (tags) => axe.run(document, { runOnly: { type: 'tag', values: tags }, resultTypes: ['violations', 'incomplete'] }),
      TAGS
    );
    rec.finalUrl = page.url();
    rec.title = await page.title();
    if (BOT_TITLE.test(rec.title)) rec.warnings.push('This looks like a bot-check or error page, so the results may not describe the real site. Fixlist does not try to get around bot checks.');
    rec.axeVersion = result.testEngine.version;
    rec.needsReview = result.incomplete.length;
    rec.violations = result.violations.map((v) => ({
      id: v.id, impact: v.impact, help: v.help, description: v.description, helpUrl: v.helpUrl,
      tags: v.tags.filter((t) => t.startsWith('wcag')),
      nodeCount: v.nodes.length,
      examples: v.nodes.slice(0, 3).map((n) => ({ target: n.target.join(' '), html: (n.html || '').slice(0, 300) })),
    }));
  } catch (e) {
    rec.error = friendly(e, timeout);
  }
  await context.close();
  return rec;
}
