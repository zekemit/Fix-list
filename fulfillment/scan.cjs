#!/usr/bin/env node
'use strict';
// Usage: node scan.js <url | targets.csv> [outDir]
// targets.csv: header row with a "url" column and an optional "id" column. Fields must not contain commas.
// Writes <outDir>/<id>.json for each target and <outDir>/summary.csv.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const AXE_PATH = require.resolve('axe-core/axe.min.js');
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

function slug(s) {
  return s.replace(/^[a-z]+:\/\//i, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 60) || 'site';
}

function parseTargets(arg) {
  if (/^(https?|file):\/\//i.test(arg)) return [{ id: slug(arg), url: arg }];
  const lines = fs.readFileSync(arg, 'utf8').split(/\r?\n/).filter(Boolean);
  const header = lines.shift().split(',').map(s => s.trim().toLowerCase());
  const iId = header.indexOf('id');
  const iUrl = header.indexOf('url');
  if (iUrl < 0) throw new Error('CSV needs a "url" column (and an optional "id" column)');
  return lines.map((line, n) => {
    const c = line.split(',');
    return { id: iId >= 0 && c[iId] ? c[iId].trim() : 'row' + (n + 1), url: c[iUrl].trim() };
  });
}

async function scanOne(browser, t) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const rec = {
    id: t.id, url: t.url, scannedAt: new Date().toISOString(), status: null, finalUrl: null,
    title: null, error: null, axeVersion: null, needsReview: 0, violations: [],
  };
  try {
    const resp = await page.goto(t.url, { waitUntil: 'load', timeout: 30000 });
    rec.status = resp ? resp.status() : null;
    await page.waitForTimeout(1500);
    await page.addScriptTag({ path: AXE_PATH });
    const result = await page.evaluate(
      tags => axe.run(document, { runOnly: { type: 'tag', values: tags }, resultTypes: ['violations', 'incomplete'] }),
      TAGS
    );
    rec.finalUrl = page.url();
    rec.title = await page.title();
    rec.axeVersion = result.testEngine.version;
    rec.needsReview = result.incomplete.length;
    rec.violations = result.violations.map(v => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      description: v.description,
      helpUrl: v.helpUrl,
      tags: v.tags.filter(x => x.startsWith('wcag')),
      nodeCount: v.nodes.length,
      examples: v.nodes.slice(0, 3).map(n => ({ target: n.target.join(' '), html: n.html.slice(0, 300) })),
    }));
  } catch (e) {
    rec.error = String(e && e.message ? e.message : e).split('\n')[0];
  }
  await context.close();
  return rec;
}

(async () => {
  const [input, outDir = 'scans'] = process.argv.slice(2);
  if (!input) {
    console.error('Usage: node scan.js <url | targets.csv> [outDir]');
    process.exit(2);
  }
  const targets = parseTargets(input);
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const rows = ['id,url,status,issue_types,affected_elements,critical,serious,moderate,minor,error'];
  for (const t of targets) {
    const r = await scanOne(browser, t);
    fs.writeFileSync(path.join(outDir, r.id + '.json'), JSON.stringify(r, null, 2));
    const by = { critical: 0, serious: 0, moderate: 0, minor: 0 };
    r.violations.forEach(v => { if (v.impact in by) by[v.impact] += v.nodeCount; });
    const els = r.violations.reduce((a, v) => a + v.nodeCount, 0);
    rows.push([r.id, r.url, r.status, r.violations.length, els, by.critical, by.serious, by.moderate, by.minor,
      JSON.stringify(r.error || '')].join(','));
    console.log(`${r.id}: ${r.error ? 'ERROR ' + r.error : r.violations.length + ' issue types, ' + els + ' elements'}`);
  }
  fs.writeFileSync(path.join(outDir, 'summary.csv'), rows.join('\n') + '\n');
  await browser.close();
})();
