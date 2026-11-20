#!/usr/bin/env node
// fixlist: scan web pages for accessibility problems and print a plain-language fix plan.
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { launchBrowser, scanPage, BrowserMissingError } from '../lib/scan.mjs';
import { buildPlan, buildText, buildJson, worstImpact, ORDER, VERSION } from '../lib/report.mjs';

const HELP = `fixlist ${VERSION}: accessibility check and fix plan for web pages

Usage:
  fixlist scan <url> [more urls...] [options]
  fixlist scan --file urls.txt [options]

Options:
  -o, --out <file>         Write the report to a file. Format follows the extension:
                           .md (fix plan), .json (machine-readable). Otherwise --format.
  -f, --format <kind>      text (default), md, or json. md and json print to stdout without --out.
      --store <name>       Store or site name, shown in the Markdown plan title.
      --fail-on <level>    Exit with code 1 if any issue is at least this severe:
                           critical, serious (default), moderate, minor, or none.
      --mobile             Check at a 375px wide phone screen instead of 1280px.
      --wait <ms>          Extra wait after the page loads, for slow scripts (default 1500).
      --timeout <ms>       Page load limit (default 30000).
      --allow-error-status Scan pages that answer with HTTP 4xx/5xx instead of failing.
      --chrome-path <file> Use this Chrome, Edge or Chromium (or set FIXLIST_CHROME).
      --order              For paid fix-plan deliveries: adds the 14-day re-check offer to the plan.
      --no-color           No colors in terminal output.
  -h, --help               Show this help.
  -v, --version            Show the version.

Exit codes: 0 ok, 1 issues at or above --fail-on, 2 bad usage, 3 a page or the browser could not be used.

Fixlist loads only the addresses you give it, with a local copy of axe-core. It does not
upload anything. It does not get around bot checks or log-ins. Automated testing finds only part
of the accessibility problems a site can have; passing is not a compliance claim.
`;

const die = (code, msg) => { process.stderr.write(msg.endsWith('\n') ? msg : msg + '\n'); process.exit(code); };

let parsed;
try {
  parsed = parseArgs({
    args: process.argv.slice(2),
    allowPositionals: true,
    options: {
      out: { type: 'string', short: 'o' }, format: { type: 'string', short: 'f' }, store: { type: 'string' },
      'fail-on': { type: 'string' }, mobile: { type: 'boolean' }, wait: { type: 'string' }, timeout: { type: 'string' },
      'allow-error-status': { type: 'boolean' }, order: { type: 'boolean' }, 'chrome-path': { type: 'string' }, 'no-color': { type: 'boolean' },
      file: { type: 'string' }, help: { type: 'boolean', short: 'h' }, version: { type: 'boolean', short: 'v' },
    },
  });
} catch (e) {
  die(2, `${e.message}\nRun "fixlist --help" for usage.`);
}
const { values: o, positionals } = parsed;

if (o.help) { process.stdout.write(HELP); process.exit(0); }
if (o.version) { process.stdout.write(VERSION + '\n'); process.exit(0); }

const [command, ...rest] = positionals;
if (command !== 'scan') die(2, command ? `Unknown command "${command}". Run "fixlist --help".` : HELP);

// Collect and validate targets.
let urls = rest.slice();
if (o.file) {
  let text;
  try { text = fs.readFileSync(o.file, 'utf8'); } catch (e) { die(2, `Cannot read ${o.file}: ${e.code || e.message}`); }
  urls = urls.concat(text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#')));
}
if (!urls.length) die(2, 'Give at least one address, for example:  fixlist scan https://your-store.com/');
urls = [...new Set(urls)];
for (const u of urls) {
  let p;
  try { p = new URL(u); } catch { die(2, `"${u}" is not a full address. Include https://, for example https://your-store.com/`); }
  if (!['http:', 'https:', 'file:'].includes(p.protocol)) die(2, `"${u}" must start with http:// or https://`);
}

const intOpt = (name, dflt, min) => {
  if (o[name] === undefined) return dflt;
  const n = Number(o[name]);
  if (!Number.isInteger(n) || n < min) die(2, `--${name} must be a whole number of at least ${min}.`);
  return n;
};
const wait = intOpt('wait', 1500, 0);
const timeout = intOpt('timeout', 30000, 1000);

const failOn = (o['fail-on'] || 'serious').toLowerCase();
if (failOn !== 'none' && !(failOn in ORDER)) die(2, '--fail-on must be critical, serious, moderate, minor or none.');

let format = (o.format || '').toLowerCase();
if (format && !['text', 'md', 'json'].includes(format)) die(2, '--format must be text, md or json.');
if (o.out) {
  const ext = path.extname(o.out).toLowerCase();
  if (ext === '.md' || ext === '.markdown') format = 'md';
  else if (ext === '.json') format = 'json';
  else if (!format) format = 'md';
}
format = format || 'text';

// Scan.
let browser;
try {
  browser = await launchBrowser({ chromePath: o['chrome-path'] });
} catch (e) {
  die(3, e instanceof BrowserMissingError ? e.message : `Could not start a browser: ${e.message.split('\n')[0]}`);
}
const scans = [];
try {
  for (const u of urls) {
    if (urls.length > 1) process.stderr.write(`Checking ${u} ...\n`);
    scans.push(await scanPage(browser, u, { wait, timeout, mobile: !!o.mobile, allowErrorStatus: !!o['allow-error-status'] }));
  }
} finally {
  await browser.close();
}

// Report.
const render = (kind) => (kind === 'md' ? buildPlan(scans, { store: o.store || '', forService: !!o.order }) : kind === 'json' ? buildJson(scans) : buildText(scans, { color: !o['no-color'] && !!process.stdout.isTTY && !process.env.NO_COLOR }) + '\n');
if (o.out) {
  try {
    fs.mkdirSync(path.dirname(path.resolve(o.out)), { recursive: true });
    fs.writeFileSync(o.out, render(format));
  } catch (e) { die(3, `Cannot write ${o.out}: ${e.code || e.message}`); }
  process.stdout.write(buildText(scans, { color: !o['no-color'] && !!process.stdout.isTTY && !process.env.NO_COLOR }) + `\n\nReport written to ${o.out}\n`);
} else {
  process.stdout.write(render(format));
}

// Exit code.
if (scans.some((s) => s.error)) process.exit(3);
if (failOn !== 'none' && worstImpact(scans) <= ORDER[failOn]) process.exit(1);
process.exit(0);
