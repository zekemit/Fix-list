# Proof plan: can Fixlist be profitable?

Written 2026-11-20. Honest framing: nobody can promise this works. This plan makes it fail fast and cheap if it does not.

## The bet
Online store owners who see an automated accessibility problem list will pay a small amount ($49 test price) for a prioritized fix plan with exact elements and theme-ready code, because fixing is the hard part and the free check shows the gap.

## Why we think it has a chance
- **Pain with outside evidence:** 3,117 federal website accessibility suits in 2025 (+27%); retail and e-commerce are the large majority of cases by two trackers. Sources are linked on the site and in `research`.
- **Honest positioning is open:** the FTC finalized a $1M order against a "one-click compliance" widget vendor (April 2025). Evidence and fix plans are credible where promises are not.
- **Free tool without friction:** no email, no server, no install beyond a bookmark. The privacy claim is tested in code.
- **Near-zero marginal cost:** the scan and plan are scripted (`fulfillment/`). Cost of goods is about the payment fee.

## Evidence so far (2026-11-20)
- Ran the engine once on the home pages of eight well-known Shopify storefronts: 7 usable results, **6 of 7 had at least one automated issue** (one clean; one site, Bombas, rate-limited the request). Range: 0 to 7 issue types, up to 172 elements. Big brands are not small stores, and a single page view is not a sample of the web. Treat this as a smoke test of the hook, not a statistic.
- **1 of 8 sites (Gymshark) sets a Content-Security-Policy that blocks outside scripts**, so the bookmarklet would not run there. It alerts the user instead of failing silently. A browser extension would avoid this and is the first roadmap item if demand shows up.
- 69 automated browser checks pass, including zero axe violations on every page of the site at 1280px and 375px.

## Sequencing: open source first, then paid
**Phase A (now to about day 30): free and open source.** The goal is evidence that people want this before anyone is asked to pay. Proposed pass thresholds (my proposals): at least 300 visits to the check page, at least 25 GitHub stars or forks, at least 10 pieces of real feedback, and at least 5 people who say, unprompted, that they would pay for the fix plan. The order page stays "Orders open soon" and is honest about it.

**Phase B (after Phase A passes): turn on payment.** An adult (the parent or guardian) must own the payment account: Stripe requires a legal guardian as owner for a minor. Add the payment link to `orderUrl` in `site.config.json`, set `operatorName` and `contactEmail`, rebuild, and then the gates below apply.

If Phase A fails, do not launch paid. Change the audience or the offer first.

## What would prove it (all thresholds are my proposals)
| Gate | When | Pass | If it fails |
|---|---|---|---|
| G0 live | day 7 | Site live, sitemap submitted, order link working, 3 launch posts out | Fix blockers; this is execution, not market |
| G1 first stranger | day 21 | At least 1 paid order from someone who is not family or a friend, and at least 5 inbound messages or requests | Rewrite the offer or price; test $29 and $99 |
| G2 repeatable | day 60 | At least 10 paid orders (about $490), at least 2 that came from search or a referral | Narrow the audience (for example one theme family) or stop |
| G3 business | day 120 | At least $2,000 cumulative and at least one upsell sold (monitoring or re-check retainer) | Stop, or pivot to an extension or agency white-label |

## How to read the numbers
- **Primary metric:** paid orders from strangers (the payment provider's dashboard is the source of truth).
- **Leading indicators:** visits to /check and /order (page-view counts), GitHub stars and traffic, inbound messages. The bookmarklet cannot be counted, by design.
- **Unit economics at $49:** the payment fee is roughly 3% plus 30 cents (check the provider's current rate), so about $47 net per order. The labor is scripted and reviewed. Hosting may need a paid plan for a commercial site; check the host's terms. At about 1 order a month the project pays for a $20 plan.
- **Refund policy** (full refund if undelivered or unsatisfied) caps downside per order at $49 plus the time.

## What I expect, honestly
- Reaching $15,000 in four months from this alone is unlikely. A realistic range is nothing to a few hundred dollars in the first two months, and the first stranger order is the real milestone.
- The compounding assets are the guides (search traffic takes months), the open-source repo and any case studies.
- Upside paths if G2 passes: a Chrome extension (also bypasses the policy-blocking problem), monthly monitoring, agency white-label, and a paid manual review tier.

## Kill criteria
Stop (or pivot) if G1 and G2 both fail, or if a full month of real promotion produces fewer than 100 visits to /check. The code and guides are reusable.
