# Launch and marketing plan ($0)

Nothing here can be posted by me: each channel needs an account in a person's name. Everything below is ready to paste. Post one per day, answer every reply the same day, and be upfront that this is a new project. Do not use email campaigns: commercial email needs a postal address.

## Order of operations
1. Site live on its final URL. Set `baseUrl` and rebuild so the bookmarklet points at it.
2. Submit `/sitemap.xml` to Google Search Console and Bing Webmaster Tools (free, need an adult's account).
3. Day 1: Show HN. Day 2: dev.to article. Day 3: Indie Hackers. Day 4 onward: help-first replies (below). Product Hunt once there is a first customer quote.

## Show HN
**Title:** Show HN: A zero-server accessibility checker bookmarklet for online stores

**Text:**
I built a free bookmarklet that runs axe-core on the page you are viewing and explains the problems in plain language for store owners (missing alt text, unlabelled forms, low contrast, and so on). It makes no requests except loading the engine from its own origin, and a test checks that. Source is on GitHub.

Limits I already know about: some sites set a Content-Security-Policy that blocks outside scripts (the bookmarklet then says so; an extension would fix that), and automated testing only covers part of WCAG, so it never says "compliant".

There is also a paid fix plan ($49 while I test whether anyone wants it): exact elements plus fix instructions (guidance for the 25 most common problem types, official links for the rest). Mostly I want feedback: what would make you trust or use this? Built with help from Claude Code.

## LinkedIn post (post it yourself; edit to your own voice)
We just open-sourced Fixlist, a free accessibility checker for online stores. It runs in your browser and sends nothing anywhere.

- Drag one bookmark to your bar, click it on any page of your store, and see the problems in plain language.
- Five free guides: alt text, color contrast, form labels, an accessibility statement template, and what the 2025 lawsuit data says (3,117 federal website accessibility suits, up 27%, source linked).
- Open source (MIT): https://github.com/zekemit/Fix-list

It is early. Automated testing finds only part of the problems, so it never says "compliant". What would make this useful for you?

https://fix-list.vercel.app

Notes: check LinkedIn's minimum age before posting from a young person's account; a parent's account is fine if it says who built it. LinkedIn Hiring Pro on this account only posts job listings, so it cannot publish this, and a made-up job post to promote a product would be misleading.

## dev.to article (outline)
Title: "I built a zero-server accessibility checker as a bookmarklet. Here is what I learned."
- Why a bookmarklet (no install, no server, privacy you can verify).
- The shadow-DOM overlay and why it stays out of the page's CSS.
- Testing that it makes no outside requests (Playwright request log).
- The Content-Security-Policy wall and how the bookmarklet degrades.
- A small real-world check: 6 of 7 storefront home pages had at least one automated issue (smoke test, not statistics).
- Link to repo and tool. Disclose that there is a paid plan.

## Indie Hackers post
"Testing a $49 fix plan on top of a free accessibility bookmarklet. Here is the falsifiable plan (gates at day 21, 60 and 120) and what I will do if it fails." Link `docs/PROOF_PLAN.md`. Update weekly with real numbers, including zeros.

## Help-first replies (Reddit r/shopify, Shopify Community, r/webdev)
Read each community's self-promotion rules first. Do not post the tool unprompted where it is not allowed. Search for questions such as "ADA", "alt text", "accessibility", "color contrast". Answer fully first, then, only if allowed and relevant, add: "If it helps, I made a free checker that runs in your browser: <link>. Free, nothing is sent anywhere."

Reusable answer skeleton for alt text: what to write, the admin steps, the `image_tag` snippet, and a pointer to `/guides/alt-text-shopify`.

## Directories and lists (free)
Product Hunt, BetaList, AlternativeTo, SaaSHub, "Awesome a11y" GitHub lists (open a pull request adding the tool), Indie Hackers products, TrustMRR (needs a read-only payment key from the adult account holder, and shows revenue publicly, so only do it if comfortable).

## SEO
The five guides are the long-tail assets. Add one guide a week from the most common issue IDs the check finds. Each should include working code, a screenshot, and a sentence on how to verify the fix. Internal links go to `/check` and `/order`.

## What not to do
- No cold email and no bulk messaging.
- No claims of compliance, legal protection or "AI audits".
- No fake reviews, counters or testimonials.
- No naming businesses with their scan results.

## Track weekly
Visits to /check and /order, GitHub stars and clones, inbound messages, paid orders, refunds. Put the numbers, including bad ones, in the weekly update.
