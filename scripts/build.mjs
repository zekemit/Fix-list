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
fs.copyFileSync(path.join(root, 'LICENSE'), path.join(dist, 'LICENSE.txt'));

// axe-core is vendored so the checker never depends on a third-party CDN.
const axeDir = path.dirname(require.resolve('axe-core/package.json'));
fs.copyFileSync(path.join(axeDir, 'axe.min.js'), path.join(dist, 'axe.min.js'));
for (const name of ['LICENSE', 'LICENSE.txt']) {
  const p = path.join(axeDir, name);
  if (fs.existsSync(p)) { fs.copyFileSync(p, path.join(dist, 'third-party', 'axe-core-LICENSE.txt')); break; }
}

// Checker script with rules injected.
const rules = fs.readFileSync(path.join(root, 'data/rules.json'), 'utf8');
const checker = fs.readFileSync(path.join(root, 'src/js/fixlist-check.js'), 'utf8').replace('/*__RULES__*/ {}', rules.trim());
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
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="/style.css">
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>` : ''}
</head>
<body>
<a class="skip" href="#main">Skip to main content</a>
<header class="site">
  <a class="brand" href="/">${esc(cfg.siteName)}</a>
  <nav aria-label="Main"><ul>${navHtml}</ul></nav>
</header>
<main id="main">
${body}
</main>
<footer class="site">
  <ul><li><a href="/privacy">Privacy</a></li><li><a href="/terms">Terms</a></li><li><a href="/about">How it works</a></li></ul>
  <p>${esc(cfg.siteName)} is not legal advice and does not certify compliance with any law or standard. Automated testing finds only part of the accessibility problems a site may have.</p>
</footer>
<script src="/site.js" defer></script>
</body>
</html>
`;
}

function outFile(urlPath) {
  return path.join(dist, urlPath === '/' ? 'index.html' : urlPath.replace(/^\//, '') + '.html');
}

const written = [];
for (const p of allPages) {
  fs.writeFileSync(outFile(p.path), layout({ title: p.title, description: p.description, body: p.body, urlPath: p.path }));
  written.push(p.path);
}
for (const g of content.guides) {
  const urlPath = `/guides/${g.slug}`;
  const body = `<p class="sources"><a href="/guides">All guides</a></p>
<h1>${esc(g.title)}</h1>
${g.body}
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
