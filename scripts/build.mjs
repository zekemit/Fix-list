// Static build: src/ + content/ + data/ -> dist/. No framework, no runtime dependencies besides axe-core.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { buildContent } from '../content/site-content.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'site.config.json'), 'utf8'));
const baseUrl = (process.env.BASE_URL || cfg.baseUrl).replace(/\/$/, '');
const dist = path.join(root, 'dist');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist, 'guides'), { recursive: true });
fs.mkdirSync(path.join(dist, 'third-party'), { recursive: true });

// Static assets
fs.copyFileSync(path.join(root, 'src/css/style.css'), path.join(dist, 'style.css'));
fs.copyFileSync(path.join(root, 'src/js/site.js'), path.join(dist, 'site.js'));
fs.copyFileSync(path.join(root, 'src/img/og.png'), path.join(dist, 'og.png'));
fs.copyFileSync(path.join(root, 'LICENSE'), path.join(dist, 'LICENSE.txt'));

// Fonts are self-hosted (no third-party requests). Licences: SIL OFL 1.1, copied beside the files.
fs.mkdirSync(path.join(dist, 'fonts'), { recursive: true });
const FONTS = [
  ['@fontsource-variable/bricolage-grotesque', 'bricolage-grotesque-latin-opsz-normal.woff2'],
  ['@fontsource-variable/atkinson-hyperlegible-next', 'atkinson-hyperlegible-next-latin-wght-normal.woff2'],
  ['@fontsource-variable/atkinson-hyperlegible-next', 'atkinson-hyperlegible-next-latin-wght-italic.woff2'],
  ['@fontsource-variable/atkinson-hyperlegible-mono', 'atkinson-hyperlegible-mono-latin-wght-normal.woff2'],
];
for (const [pkgName, file] of FONTS) {
  const dir = path.dirname(require.resolve(`${pkgName}/package.json`));
  fs.copyFileSync(path.join(dir, 'files', file), path.join(dist, 'fonts', file));
  const lic = path.join(dir, 'LICENSE');
  if (fs.existsSync(lic)) fs.copyFileSync(lic, path.join(dist, 'fonts', `${pkgName.split('/')[1]}-LICENSE.txt`));
}

// axe-core is vendored so the checker never depends on a third-party CDN.
const axeDir = path.dirname(require.resolve('axe-core/package.json'));
fs.copyFileSync(path.join(axeDir, 'axe.min.js'), path.join(dist, 'axe.min.js'));
for (const name of ['LICENSE', 'LICENSE.txt']) {
  const p = path.join(axeDir, name);
  if (fs.existsSync(p)) { fs.copyFileSync(p, path.join(dist, 'third-party', 'axe-core-LICENSE.txt')); break; }
}

// Checker script with rules injected.
const rules = fs.readFileSync(path.join(root, 'data/rules.json'), 'utf8');
const checkerSrc = fs.readFileSync(path.join(root, 'src/js/fixlist-check.js'), 'utf8');
const checker = checkerSrc.replace('/*__RULES__*/ {}', rules.trim());
if (checker === fs.readFileSync(path.join(root, 'src/js/fixlist-check.js'), 'utf8')) { throw new Error('RULES token not replaced'); }
fs.writeFileSync(path.join(dist, 'fixlist-check.js'), checker);

// Bookmarklet
const bookmarkletHref = `javascript:(function(){var s=document.createElement('script');s.src='${baseUrl}/fixlist-check.js';s.onerror=function(){alert('Fixlist could not run on this page. The site blocks outside scripts. Details: ${baseUrl}/check')};document.body.appendChild(s)})();`;

// Contact fallback: never invent contact details.
const contactHtml = cfg.contactEmail
  ? `Email <a href="mailto:${esc(cfg.contactEmail)}">${esc(cfg.contactEmail)}</a>.`
  : cfg.repoUrl
    ? `Open an issue at <a href="${esc(cfg.repoUrl)}/issues">${esc(cfg.repoUrl)}/issues</a>.`
    : 'Contact details will be added before launch.';

const { pages, guides } = buildContent(cfg, { bookmarkletHref, contactHtml, guides: [] });
// Second pass so the guides index can list guides.
const content = buildContent(cfg, { bookmarkletHref, contactHtml, guides });
const allPages = content.pages;

const nav = allPages.filter((p) => p.nav);

function layout({ title, description, body, urlPath, jsonLd }) {
  const canonical = baseUrl + (urlPath === '/' ? '/' : urlPath);
  const navHtml = nav.map((p) => `<li><a href="${p.path}"${p.path === urlPath || (p.path === '/guides' && urlPath.startsWith('/guides/')) ? ' aria-current="page"' : ''}>${esc(p.nav)}</a></li>`).join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
${cfg.googleSiteVerification ? `<meta name="google-site-verification" content="${esc(cfg.googleSiteVerification)}">` : ''}
${cfg.bingSiteVerification ? `<meta name="msvalidate.01" content="${esc(cfg.bingSiteVerification)}">` : ''}
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(baseUrl)}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="A product card with its accessibility problems marked in yellow, next to what a screen reader would say about it.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${esc(baseUrl)}/og.png">
<link rel="preload" href="/fonts/atkinson-hyperlegible-next-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/bricolage-grotesque-latin-opsz-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/style.css">
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>` : ''}
</head>
<body>
<a class="skip" href="#main">Skip to main content</a>
<header class="site">
  <a class="brand" href="/"><svg viewBox="0 0 28 28" width="28" height="28" aria-hidden="true" focusable="false"><rect x="2" y="2" width="24" height="24" rx="6" fill="#101B33"/><path d="M8 14.500l4 4 8-9" fill="none" stroke="#FFE14D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg><span>${esc(cfg.siteName)}</span></a>
  <nav aria-label="Main"><ul>${navHtml}</ul></nav>
</header>
<main id="main" class="${urlPath === '/' ? 'home' : 'prose'}">
${body}
</main>
<footer class="site">
  <div class="foot-grid">
    <p class="foot-note">${esc(cfg.siteName)} is not legal advice and does not certify compliance with any law or standard. Automated testing finds only part of the accessibility problems a site may have.</p>
    <ul>
      <li><a href="/privacy">Privacy</a></li>
      <li><a href="/terms">Terms</a></li>
      <li><a href="/about">How it works</a></li>
      <li><a href="${esc(cfg.repoUrl)}">Source on GitHub</a></li>
    </ul>
  </div>
  <p class="foot-type">Set in Atkinson Hyperlegible, a typeface designed for readers with low vision.</p>
</footer>
<script src="/site.js" defer></script>
${cfg.webAnalytics ? '<script src="/_vercel/insights/script.js" defer></script>' : ''}
</body>
</html>
`;
}

function outFile(urlPath) {
  return path.join(dist, urlPath === '/' ? 'index.html' : urlPath.replace(/^\//, '') + '.html');
}

const written = [];
for (const p of allPages) {
  const app = (p.path === '/' || p.path === '/check') ? {
    '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: cfg.siteName, url: baseUrl + '/',
    description: 'Free accessibility check for online stores: a bookmarklet, a command-line tool and a Chrome extension. Runs on your own computer and sends nothing anywhere.',
    applicationCategory: 'DeveloperApplication', operatingSystem: 'Any web browser; Node.js 18.3 or newer for the command-line tool',
    offers: { '@type': 'Offer', price: '0', priceCurrency: cfg.currency },
    license: 'https://opensource.org/licenses/MIT', sameAs: [cfg.repoUrl]
  } : undefined;
  fs.writeFileSync(outFile(p.path), layout({ title: p.title, description: p.description, body: p.body, urlPath: p.path, jsonLd: app }));
  written.push(p.path);
}
// Three other guides, starting after this one, so every guide links onward.
const related = (g) => { const all = content.guides; const i = all.indexOf(g); return [1, 2, 3].map((n) => all[(i + n) % all.length]); };
for (const g of content.guides) {
  const urlPath = `/guides/${g.slug}`;
  const body = `<p class="sources"><a href="/guides">All guides</a></p>
<h1>${esc(g.title)}</h1>
${g.body}
<h2>More guides</h2>
<ul class="rows">
${related(g).map((r) => `  <li><a href="/guides/${r.slug}">${esc(r.title)}</a><span class="sources">${esc(r.description)}</span></li>`).join('\n')}
</ul>
<div class="cta"><a class="btn" href="/check">Run the free check</a><a class="btn secondary" href="/order">See the fix plan</a></div>`;
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Article', headline: g.title, description: g.description,
    datePublished: cfg.lastUpdated, dateModified: cfg.lastUpdated, mainEntityOfPage: baseUrl + urlPath,
    publisher: { '@type': 'Organization', name: cfg.siteName }
  };
  fs.writeFileSync(outFile(urlPath), layout({ title: `${g.title}: ${cfg.siteName}`, description: g.description, body, urlPath, jsonLd }));
  written.push(urlPath);
}

// 404
fs.writeFileSync(path.join(dist, '404.html'), layout({
  title: `Page not found: ${cfg.siteName}`, description: 'That page does not exist.',
  body: '<h1>Page not found</h1><p>That page does not exist. Try the <a href="/">home page</a> or the <a href="/guides">guides</a>.</p>', urlPath: '/404'
}));

// sitemap + robots
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${written.map((u) => `  <url><loc>${baseUrl}${u === '/' ? '/' : u}</loc><lastmod>${cfg.lastUpdated}</lastmod></url>`).join('\n')}\n</urlset>\n`;
fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`);

// Warnings for launch-critical settings
const warn = [];
if (!cfg.orderUrl) warn.push('orderUrl is empty: the order page shows "Orders open soon".');
if (!cfg.contactEmail && !cfg.repoUrl) warn.push('Neither contactEmail nor repoUrl is set: pages say contact details will be added.');
if (!cfg.operatorName) warn.push('operatorName is empty.');
console.log(`built ${written.length} pages + assets to dist/ (base ${baseUrl})`);
for (const w of warn) console.log('WARN:', w);
