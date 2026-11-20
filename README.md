# Fixlist

A free, in-browser accessibility check for online stores, and a paid fix plan.

- **Free check:** a bookmarklet that runs [axe-core](https://github.com/dequelabs/axe-core) on the page you are viewing and shows the problems in plain language. It sends nothing anywhere. The code is in `src/js/fixlist-check.js`, and a test proves the only requests it makes go to its own origin.
- **Fix plan ($49 test price):** we scan the store's key pages and write a prioritized plan with exact elements and fix instructions (plain-language guidance for 25 common rule types; official links for the rest). The plan is produced by the command-line tool below.
- **Command-line tool:** `fixlist scan <url>` checks one or many pages from your terminal or CI, prints the problems in plain language, and can write a Markdown fix plan or JSON. Unlike the bookmarklet it also works on sites whose Content-Security-Policy blocks outside scripts.
- **Chrome extension:** click a toolbar button on any page to see the problems in a panel. Runs only when clicked, asks for just `activeTab` and `scripting`, and makes no network requests. Download the zip from [`releases/`](releases/fixlist-extension-0.1.0.zip) or see `docs/EXTENSION.md`.
- **Site:** a static site (no framework) in `content/`, `src/` and `scripts/build.mjs`, with free guides for store owners.

It deliberately makes no compliance claims. See `docs/PROOF_PLAN.md` for how we find out whether it can be a business.

## Command-line tool

```bash
# one-off, straight from GitHub (needs Node 18.3+ and a Chrome, Edge or Chromium)
npx github:zekemit/fix-list scan https://your-store.com/

# a fix plan for several pages, as a Markdown file
npx github:zekemit/fix-list scan https://your-store.com/ https://your-store.com/products/example \
  --out fix-plan.md --store "Your Store"

# in CI: machine-readable output, exit code 1 if any serious or critical issue
npx github:zekemit/fix-list scan https://staging.example.com/ --format json --fail-on serious
```

If no browser is found it tells you how to install one (`npx playwright-core install chromium`). Run `fixlist --help` for every option.

| Exit code | Meaning |
|---|---|
| 0 | Scan finished; nothing at or above `--fail-on` (default `serious`) |
| 1 | Issues at or above `--fail-on` |
| 2 | Bad usage (missing or malformed address, unknown option) |
| 3 | A page or the browser could not be used (404, timeout, no browser, bot check) |

What it does and does not do:
- It loads only the addresses you give it, injects a local copy of axe-core, and writes the report. It uploads nothing. (`tests/cli.mjs` checks that the only requests are the page and its own resources.)
- axe-core is injected through the browser's debugging channel, so a site's Content-Security-Policy cannot block it and the page's own behaviour is not changed.
- It does not get around bot checks, log-ins or rate limits. If a site shows a challenge page it warns you.
- It checks the page as loaded plus a short wait (`--wait`). Content behind clicks, log-ins or scrolling is not checked.
- Automated testing finds only part of the accessibility problems a site can have. It never says "compliant".

## Run the site locally

```bash
npm install
npm run build        # builds dist/
npm test             # site checks (axe on every page at two widths, links, the bookmarklet), command-line tool checks, and extension checks in a real Chromium
npm run serve        # http://127.0.0.1:4173
```

The tests and the command-line tool use `playwright-core` (a dependency) and a Chromium browser. If none is installed: `npx playwright-core install chromium`.

## Configure before launch (`site.config.json`)

| Field | What it does |
|---|---|
| `baseUrl` | Public URL. The bookmarklet points here. Set it to the real domain, or override with `BASE_URL=... npm run build`. |
| `orderUrl` | A payment link (for example a Stripe Payment Link). While empty, the order page says "Orders open soon". |
| `contactEmail` | Shown on legal pages. If empty, the pages fall back to the repo's issues page, then to "contact details will be added". |
| `repoUrl` | The GitHub repo URL. |
| `operatorName` | The legal person or business operating the service. Set before taking payment. |

## Fulfilling an order

See `docs/FULFILLMENT_SOP.md`. In short:

```bash
node bin/fixlist.mjs scan https://store.example/ https://store.example/products/x --out out/plan.md --store "Store name" --order --fail-on none
```

## Deploy

Vercel reads `vercel.json` (build `node scripts/build.mjs`, output `dist/`). Check Vercel's current terms for which plan a commercial site needs before taking payment.

## Licence

Code: MIT (`LICENSE`). Third-party: axe-core is MPL-2.0 and is shipped unmodified with its licence in `third-party/`.
