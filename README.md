# Fixlist

A free, in-browser accessibility check for online stores, and a paid fix plan.

- **Free check:** a bookmarklet that runs [axe-core](https://github.com/dequelabs/axe-core) on the page you are viewing and shows the problems in plain language. It sends nothing anywhere. The code is in `src/js/fixlist-check.js`, and a test proves the only requests it makes go to its own origin.
- **Fix plan ($49 test price):** we scan the store's key pages and write a prioritized plan with exact elements and fix instructions (plain-language guidance for 25 common rule types; official links for the rest) (`fulfillment/`).
- **Site:** a static site (no framework) in `content/`, `src/` and `scripts/build.mjs`, with free guides for store owners.

It deliberately makes no compliance claims. See `docs/PROOF_PLAN.md` for how we find out whether it can be a business.

## Run it

```bash
npm install
npm run build        # builds dist/
npm test             # 69 browser checks: axe on every page at two widths, links, the bookmarklet, the fix-plan pipeline
npm run serve        # http://127.0.0.1:4173
```

Playwright is expected to be installed globally (`require('playwright')` must resolve).

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
node fulfillment/scan.cjs https://store.example/ out/       # scan a page
node fulfillment/plan.mjs out/<file>.json out/plan.md --store "Store name"
```

## Deploy

Vercel reads `vercel.json` (build `node scripts/build.mjs`, output `dist/`). Check Vercel's current terms for which plan a commercial site needs before taking payment.

## Licence

Code: MIT (`LICENSE`). Third-party: axe-core is MPL-2.0 and is shipped unmodified with its licence in `third-party/`.
