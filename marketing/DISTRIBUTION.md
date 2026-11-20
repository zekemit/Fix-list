# Copy to paste

Each block is ready to use. Read the destination's rules first and post once. Be upfront that this is a new project, answer every reply the same day, and never ask for stars. Images are in `marketing/assets/` (`home.png`, `panel.png`, `cli.png`) and the share image is `src/img/og.png`.

## Product Hunt (later, once there is real feedback to point at)
- **Name:** Fixlist
- **Tagline (60 characters max):** Hear your store the way a screen reader does
- **Description (260 max):** Free accessibility check for online stores. Click once to see the problems software can find, in plain language, with the Shopify fix. Bookmarklet, command line and Chrome extension. Runs on your machine and sends nothing anywhere. Open source (MIT).
- **Topics:** Accessibility, Developer Tools, Open Source, E-commerce
- **Gallery:** `panel.png`, `cli.png`, `home.png`
- **First comment:** I'm [your name] and I built Fixlist with help from Claude Code. Store owners keep hearing "make your site ADA compliant" and the tools that promise it in one click are exactly what the FTC went after in 2025. So this one does something smaller and honest: it shows you real problems, in plain language, and how to fix them in your theme. It never says "compliant" because no tool can. It runs on your computer and sends nothing anywhere (a test checks that). There is also a $49 written fix plan I'm testing whether anyone wants. What would make this useful for you?
  *(Edit to your own voice. Whether to mention your age is your family's call.)*

## Indie Hackers
**Title:** Testing whether anyone will pay $49 for an accessibility fix plan, with a free open-source checker as the hook

I built a free accessibility checker for online stores (bookmarklet, command line, Chrome extension) and I'm testing whether store owners will pay $49 for a written fix plan on top of it. Before asking anyone to pay I set gates in public: 300 visits to the checker page, 25 GitHub stars or forks, 10 pieces of real feedback and 5 people who say unprompted that they'd pay. If they fail, I change the audience or the offer instead of launching paid.

Plan with the day 21, 60 and 120 gates: https://github.com/zekemit/fix-list/blob/main/docs/PROOF_PLAN.md
Tool: https://fix-list.vercel.app

I'll post the real numbers weekly, including the zeros. What am I missing?

## AlternativeTo, SaaSHub
- **Name:** Fixlist
- **Short description:** Free accessibility checker for online stores that explains each problem in plain language, with the Shopify fix. Works as a bookmarklet, a command-line tool and a Chrome extension. Runs on your own computer and sends nothing anywhere.
- **Long description:** Fixlist runs the open-source axe-core engine on a page and lists the accessibility problems software can find, most serious first, in language a store owner can act on: missing alt text, unlabelled form fields, buttons and links with no text, hard-to-read text, tap targets that are too small. For common problems it gives the fix, with Shopify steps and Liquid code. Use it as a bookmarklet with no install, from the command line (JSON output and an exit code for CI), or as a Chrome extension that works on sites with a strict Content-Security-Policy. It never says a site is "compliant". Free and open source (MIT). A paid written fix plan is being tested.
- **Link:** https://fix-list.vercel.app  **Repo:** https://github.com/zekemit/fix-list
- **Alternatives to list it against (honest comparisons):** axe DevTools, WAVE, Lighthouse, Pa11y, Accessibility Insights. Say what it adds: plain language for store owners, Shopify fixes, and a CLI plus extension in one project.

## awesome-a11y pull request
The list refuses overlay tools and subscribes to the Overlay Fact Sheet, which fits: Fixlist is a checker, not an overlay.
1. Open https://github.com/brunopulis/awesome-a11y/blob/main/topics/tools.md and tap the pencil (edit). GitHub makes a fork and a pull request for you.
2. The table is mostly alphabetical. Add this row near the "F" entries (after "Firefox add-on: IBM Equal Access Accessibility Checker", before "GetWCAG"):
```
|[Fixlist](https://github.com/zekemit/fix-list)|Free accessibility checker for online stores: bookmarklet, command-line tool and Chrome extension built on axe-core. Plain-language results with Shopify fixes. Runs locally and sends nothing anywhere.|
```
3. **PR title:** Add Fixlist to Tools
4. **PR body:** Adds Fixlist, an open-source (MIT) accessibility checker for online stores built on axe-core. It is a checker, not an overlay: it changes nothing on a page and never claims compliance. Row added in alphabetical position as the contributing guide asks.
Check the repo's current contributing guide before submitting.

## Reddit
Read each subreddit's rules and its pinned posts first. Many ban self-promotion or limit it to certain threads. If a post is not allowed, do not post it.
- **r/shopify and Shopify Community: answer first.** Search for "ADA", "alt text", "accessibility", "contrast". Reply with the complete answer from the matching guide (the steps, not just a link). Only if links are allowed, add: "I made a free checker that runs in your browser and sends nothing anywhere, if it helps: https://fix-list.vercel.app/check".
- **r/webdev (use the weekly showcase thread if it has one):**
  Title: I built an accessibility checker as a bookmarklet, a CLI and a Chrome extension. What I learned about CSP and extension testing.
  Body: Short summary, the repo link, the three limits (CSP blocks the bookmarklet; automated tests cover only part of WCAG; first real click of the extension is a manual test), and: "Feedback welcome, especially on the CLI exit codes and the extension's permissions."
- **r/accessibility:** Lead with the limits and the "never says compliant" stance, ask practitioners what the plain-language explanations get wrong. Practitioner feedback is worth more than upvotes here.

## Direct messages to five real people
Pick store owners or theme developers you or Andrew actually know or have talked with. One message each, personal, no template blast.
> Hi [name], I built a free tool that checks a store page for accessibility problems and explains them in plain language: https://fix-list.vercel.app/check. Would you try it on one page of your store and tell me (1) did it find anything real, (2) was anything confusing, (3) would you pay $49 for a written plan that lists every problem with the exact fix? Honest answers help most, including "no".

## Newsletter and community submissions
Individual messages to editors, not bulk. Accessibility newsletters (for example a11y Weekly, linked from awesome-a11y's newsletter list) often take link suggestions through a form or email; check their submission page. Offer one sentence and the repo link, and say it is open source.

## Feedback tracker (copy into a sheet)
`date | channel | who (first name or handle) | what they said | would pay (yes/no/unsure) | follow-up`

## Do not
- Ask anyone to star the repo, upvote a post, or leave a review.
- Send bulk or cold commercial email.
- Claim or imply that using Fixlist makes a store compliant or protects it legally.
- Name a business together with its scan results.
- Post the same text in many places on the same day.
