// Turns scan results into a Markdown fix plan, a terminal summary, or JSON.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rules = JSON.parse(fs.readFileSync(path.join(root, 'data/rules.json'), 'utf8'));
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
export const VERSION = pkg.version;
export const ORDER = { critical: 0, serious: 1, moderate: 2, minor: 3 };
const GUIDE = 'https://fix-list.vercel.app/guides/accessibility-statement-template';

const ruleFor = (id) => (Object.prototype.hasOwnProperty.call(rules, id) ? rules[id] : null);
const sorted = (scan) => [...scan.violations].sort((a, b) => (ORDER[a.impact] - ORDER[b.impact]) || (b.nodeCount - a.nodeCount));
const countOf = (scan) => {
  const v = scan.violations;
  return {
    issueTypes: v.length,
    elements: v.reduce((n, x) => n + x.nodeCount, 0),
    highImpactTypes: v.filter((x) => x.impact === 'critical' || x.impact === 'serious').length,
  };
};

// ---- Markdown -------------------------------------------------------------

function pageSection(scan, level) {
  const h = (n) => '#'.repeat(Math.min(level + n, 6));
  const v = sorted(scan);
  const c = countOf(scan);
  const L = [];
  L.push(`Page checked: ${scan.finalUrl || scan.url}`);
  L.push(`Checked on: ${scan.scannedAt.slice(0, 10)} with axe-core ${scan.axeVersion || ''} against the WCAG 2.0 and 2.1 Level A and AA rules that software can test (plus the target-size rule from WCAG 2.2 Level AA).`);
  L.push('');
  L.push(`**Summary:** ${c.issueTypes} issue types, ${c.elements} elements affected, ${c.highImpactTypes} critical or serious.`);
  L.push('');
  if (!v.length) {
    L.push('No automated failures were found on this page. Check your other page types (home, collection, product, cart, search, forms) and test with a keyboard.');
    L.push('');
  }
  v.forEach((x, i) => {
    const r = ruleFor(x.id);
    L.push(`${h(1)} ${i + 1}. ${r ? r.label : x.help}  (${x.impact}, ${x.nodeCount} element${x.nodeCount === 1 ? '' : 's'})`);
    L.push('');
    L.push(r ? `**Why it matters:** ${r.why}` : `**What it is:** ${x.description}`);
    L.push('');
    L.push(`**How to fix it:** ${r ? r.fix : `See ${x.helpUrl}`}`);
    if (r && r.shopify) { L.push(''); L.push(`**On Shopify:** ${r.shopify}`); }
    if (x.examples && x.examples.length) {
      L.push(''); L.push('**Where it is:**');
      x.examples.forEach((e) => { L.push(`- \`${e.target}\``); L.push('  ```html'); L.push(`  ${String(e.html).replace(/\n/g, ' ')}`); L.push('  ```'); });
    }
    if (x.helpUrl) { L.push(''); L.push(`More: ${x.helpUrl}`); }
    L.push('');
  });
  return L.join('\n');
}

// scans: array of scan results (errors are listed, not planned). opts: { store, forService }
export function buildPlan(scans, { store = '', forService = false } = {}) {
  const list = Array.isArray(scans) ? scans : [scans];
  const ok = list.filter((s) => !s.error);
  const L = [];
  L.push(`# Accessibility fix plan${store ? `: ${store}` : ''}`);
  L.push('');
  L.push('> This plan comes from automated testing plus written guidance. It is not legal advice, a compliance certificate or a full manual audit. Automated tools find only part of the problems a site can have.');
  L.push('');
  if (ok.length === 1 && list.length === 1) {
    L.push(pageSection(ok[0], 1));
  } else {
    const total = ok.reduce((a, s) => { const c = countOf(s); return { t: a.t + c.issueTypes, e: a.e + c.elements, h: a.h + c.highImpactTypes }; }, { t: 0, e: 0, h: 0 });
    L.push(`**Pages checked:** ${ok.length}. **Totals across pages:** ${total.t} issue types, ${total.e} elements, ${total.h} critical or serious. (The same template problem is counted once per page.)`);
    L.push('');
    ok.forEach((s) => { L.push(`## Page: ${s.finalUrl || s.url}`); L.push(''); L.push(pageSection(s, 2)); });
  }
  const failed = list.filter((s) => s.error);
  if (failed.length) {
    L.push('## Pages that could not be checked');
    L.push('');
    failed.forEach((s) => L.push(`- ${s.url}: ${s.error}`));
    L.push('');
  }
  L.push('## Next steps');
  L.push('1. Fix the critical and serious items first, then the rest.');
  L.push('2. Check the other page types in your store, since template problems repeat.');
  L.push('3. Try the page with only a keyboard (Tab, Shift+Tab, Enter) and with zoom at 200%. Automated tools cannot judge these.');
  if (forService) {
    L.push(`4. Publish an accessibility statement (draft template: ${GUIDE}).`);
    L.push('5. Send us the store again within 14 days for a free re-check.');
  } else {
    L.push(`4. Publish an accessibility statement (template: ${GUIDE}).`);
    L.push('5. Run the scan again after fixing to confirm the numbers dropped.');
  }
  L.push('');
  return L.join('\n');
}

// ---- Terminal text --------------------------------------------------------

export function buildText(scans, { color = false } = {}) {
  const c = (code, s) => (color ? `\x1b[${code}m${s}\x1b[0m` : s);
  const sev = { critical: (s) => c('1;31', s), serious: (s) => c('31', s), moderate: (s) => c('33', s), minor: (s) => c('2', s) };
  const L = [];
  for (const s of scans) {
    L.push(c('1', s.finalUrl || s.url) + (s.status ? `  (HTTP ${s.status})` : ''));
    if (s.error) { L.push(`  Could not check this page: ${s.error}`); L.push(''); continue; }
    s.warnings.forEach((w) => L.push(`  Warning: ${w}`));
    const k = countOf(s);
    if (!k.issueTypes) {
      L.push('  No automated failures found.');
    } else {
      L.push(`  ${k.issueTypes} issue type${k.issueTypes === 1 ? '' : 's'}, ${k.elements} element${k.elements === 1 ? '' : 's'}, ${k.highImpactTypes} critical or serious`);
      sorted(s).forEach((x) => {
        const r = ruleFor(x.id);
        L.push(`  ${sev[x.impact] ? sev[x.impact](x.impact.toUpperCase().padEnd(8)) : x.impact.padEnd(8)} ${r ? r.label : x.help} (${x.nodeCount})`);
      });
    }
    if (s.needsReview) L.push(`  ${s.needsReview} more item${s.needsReview === 1 ? '' : 's'} need a human to judge (not counted above).`);
    L.push('');
  }
  L.push('Automated checks find only part of the accessibility problems a site can have. This is not a compliance check or legal advice.');
  return L.join('\n');
}

// ---- JSON -----------------------------------------------------------------

export function buildJson(scans) {
  const ok = scans.filter((s) => !s.error);
  const by = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  let issueTypes = 0; let elements = 0;
  ok.forEach((s) => s.violations.forEach((v) => { issueTypes += 1; elements += v.nodeCount; if (v.impact in by) by[v.impact] += v.nodeCount; }));
  return JSON.stringify({
    tool: 'fixlist', version: VERSION,
    axeVersion: (ok[0] && ok[0].axeVersion) || null,
    summary: { pagesChecked: ok.length, pagesFailed: scans.length - ok.length, issueTypes, elements, elementsBySeverity: by },
    pages: scans.map((s) => ({
      ...s,
      violations: sorted(s).map((v) => ({ ...v, label: (ruleFor(v.id) || {}).label || null })),
    })),
  }, null, 2) + '\n';
}

// Highest severity present, for --fail-on.
export function worstImpact(scans) {
  let worst = 99;
  scans.forEach((s) => s.violations.forEach((v) => { if (v.impact in ORDER) worst = Math.min(worst, ORDER[v.impact]); }));
  return worst; // 0 critical .. 3 minor, 99 none
}
