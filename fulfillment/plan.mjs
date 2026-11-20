// Turns a scan.cjs result (JSON) into a Markdown fix plan.
// Usage: node fulfillment/plan.mjs <scan.json> <out.md> [--store "Store name"]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rules = JSON.parse(fs.readFileSync(path.join(root, 'data/rules.json'), 'utf8'));
const ORDER = { critical: 0, serious: 1, moderate: 2, minor: 3 };

export function buildPlan(scan, storeName) {
  const v = [...scan.violations].sort((a, b) => (ORDER[a.impact] - ORDER[b.impact]) || (b.nodeCount - a.nodeCount));
  const elements = v.reduce((n, x) => n + x.nodeCount, 0);
  const high = v.filter((x) => x.impact === 'critical' || x.impact === 'serious').length;
  const L = [];
  L.push(`# Accessibility fix plan${storeName ? `: ${storeName}` : ''}`);
  L.push('');
  L.push(`Page checked: ${scan.finalUrl || scan.url}`);
  L.push(`Checked on: ${scan.scannedAt.slice(0, 10)} with axe-core ${scan.axeVersion || ''} against the WCAG 2.0 and 2.1 Level A and AA rules that software can test (plus the target-size rule from WCAG 2.2 Level AA).`);
  L.push('');
  L.push(`**Summary:** ${v.length} issue types, ${elements} elements affected, ${high} critical or serious.`);
  L.push('');
  L.push('> This plan comes from automated testing plus written guidance. It is not legal advice, a compliance certificate or a full manual audit. Automated tools find only part of the problems a site can have.');
  L.push('');
  if (!v.length) {
    L.push('No automated failures were found on this page. Check your other page types (home, collection, product, cart, search, forms) and test with a keyboard.');
  }
  v.forEach((x, i) => {
    const r = Object.prototype.hasOwnProperty.call(rules, x.id) ? rules[x.id] : null;
    L.push(`## ${i + 1}. ${r ? r.label : x.help}  (${x.impact}, ${x.nodeCount} element${x.nodeCount === 1 ? '' : 's'})`);
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
  L.push('## Next steps');
  L.push('1. Fix the critical and serious items first, then the rest.');
  L.push('2. Check the other page types in your store, since template problems repeat.');
  L.push('3. Publish an accessibility statement (draft template: /guides/accessibility-statement-template).');
  L.push('4. Send us the store again within 14 days for a free re-check.');
  L.push('');
  return L.join('\n');
}

if (process.argv[1] && process.argv[1].endsWith('plan.mjs')) {
  const args = process.argv.slice(2);
  const si = args.indexOf('--store');
  const store = si >= 0 ? args.splice(si, 2)[1] : '';
  const [input, out] = args;
  if (!input || !out) { console.error('Usage: node fulfillment/plan.mjs <scan.json> <out.md> [--store "Name"]'); process.exit(2); }
  const scan = JSON.parse(fs.readFileSync(input, 'utf8'));
  if (scan.error) { console.error('Scan has an error: ' + scan.error); process.exit(1); }
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  fs.writeFileSync(out, buildPlan(scan, store));
  console.log('wrote ' + out);
}
