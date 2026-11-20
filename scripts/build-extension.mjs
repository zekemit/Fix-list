// Builds the Chrome extension into dist-ext/ (unpacked) and dist-ext/fixlist-extension-<version>.zip.
// Load unpacked: chrome://extensions -> Developer mode -> Load unpacked -> choose dist-ext/unpacked.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { zipSync } from 'fflate';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'site.config.json'), 'utf8'));
const site = (process.env.BASE_URL || cfg.baseUrl).replace(/\/$/, '');

// outDir can be overridden so tests build into a temp folder.
const outRoot = process.env.EXT_OUT ? path.resolve(process.env.EXT_OUT) : path.join(root, 'dist-ext');
const unpacked = path.join(outRoot, 'unpacked');
fs.rmSync(outRoot, { recursive: true, force: true });
fs.mkdirSync(path.join(unpacked, 'icons'), { recursive: true });

// manifest: the checked-in file with the package version
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'extension/manifest.json'), 'utf8'));
manifest.version = pkg.version;
fs.writeFileSync(path.join(unpacked, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

fs.copyFileSync(path.join(root, 'extension/background.js'), path.join(unpacked, 'background.js'));
for (const f of fs.readdirSync(path.join(root, 'extension/icons'))) fs.copyFileSync(path.join(root, 'extension/icons', f), path.join(unpacked, 'icons', f));

// axe-core (unmodified) and its licence
const axeDir = path.dirname(require.resolve('axe-core/package.json'));
fs.copyFileSync(path.join(axeDir, 'axe.min.js'), path.join(unpacked, 'axe.min.js'));
fs.copyFileSync(path.join(axeDir, 'LICENSE'), path.join(unpacked, 'axe-core-LICENSE.txt'));
fs.copyFileSync(path.join(root, 'LICENSE'), path.join(unpacked, 'LICENSE.txt'));

// the panel script: same source as the bookmarklet, with rules and the site address filled in
const rules = fs.readFileSync(path.join(root, 'data/rules.json'), 'utf8').trim();
let checker = fs.readFileSync(path.join(root, 'src/js/fixlist-check.js'), 'utf8');
if (!checker.includes('/*__RULES__*/ {}') || !checker.includes("/*__SITE__*/ ''")) throw new Error('checker tokens missing');
checker = checker.replace('/*__RULES__*/ {}', rules).replace("/*__SITE__*/ ''", JSON.stringify(site));
fs.writeFileSync(path.join(unpacked, 'fixlist-check.js'), checker);

// zip (for the Chrome Web Store or a GitHub release)
const files = {};
(function walk(dir, prefix = '') {
  for (const name of fs.readdirSync(dir).sort()) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, prefix + name + '/');
    else files[prefix + name] = new Uint8Array(fs.readFileSync(p));
  }
})(unpacked);
const zipPath = path.join(outRoot, `fixlist-extension-${pkg.version}.zip`);
fs.writeFileSync(zipPath, zipSync(files, { level: 9, mtime: new Date('2026-01-01') }));
console.log(`built extension ${pkg.version} -> ${unpacked}\nzip: ${zipPath} (${Object.keys(files).length} files)`);
