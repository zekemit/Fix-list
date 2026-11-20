---
title: I built the same accessibility checker three ways. Here is what each one taught me.
published: false
tags: a11y, webdev, javascript, opensource
---

I wanted a free accessibility checker that a store owner could use without a developer, and that I could prove does not spy on anyone. So I built [Fixlist](https://fix-list.vercel.app) as a bookmarklet, then a command-line tool, then a Chrome extension. All three run [axe-core](https://github.com/dequelabs/axe-core) and explain the results in plain language. Each one hit a different wall.

## 1. The bookmarklet: no install, and the Content-Security-Policy wall

A bookmarklet is a bookmark that runs JavaScript on the page you are viewing. Mine adds a script tag that loads a small checker and axe-core from my own site, then shows the results in a Shadow DOM panel so the page's CSS cannot restyle it.

The privacy claim ("nothing leaves your browser") is easy to say and easy to break, so a Playwright test logs every request the page makes while the checker runs and fails if anything goes to another origin.

The wall: sites with a `script-src 'self'` Content-Security-Policy refuse to load my script. In a quick look at the home pages of eight well-known Shopify storefronts, one of them blocked it. That is a smoke test, not a statistic, but it was enough to learn two things: the bookmarklet must say "this site blocks outside scripts" instead of failing silently (an `onerror` alert, with a test), and it can never be the only option.

## 2. The command line: where the real fixes were

`npx github:zekemit/fix-list scan https://your-store.com/ --out plan.md` opens the page in Playwright and injects axe-core. My first version used `page.addScriptTag`, and it failed on any site with a strict CSP, including my own. The fix is to evaluate the axe source through the browser's debugging channel instead (`page.evaluate(axeSource)`). Chrome does not apply the page's CSP to that, and, unlike turning on `bypassCSP`, it leaves the page's own behaviour alone.

Some details that made it usable:

- Exit code 1 when anything at or above `--fail-on` (default `serious`) is found, 2 for bad usage, 3 when a page or the browser could not be used. That is what lets it run in CI.
- A 404 page, a JSON response or a bot-check page ("Just a moment...") is reported as such. Scanning an error page and calling it clean would be worse than useless.
- The tests compare its issue types and element counts to raw axe-core on the same page.

## 3. The extension: the smallest possible permissions

A Manifest V3 extension with the `activeTab` and `scripting` permissions does nothing until you click it, then injects the bundled axe-core and the same panel into that tab only. No host permissions, no content scripts, no network. A test fails the build if the permission list ever changes.

The testing story is the interesting part. Chrome grants `activeTab` only on a real toolbar click, which a script cannot perform. So the automated tests load a copy of the build with an extra test-only host permission, call the same function the click handler calls, and check everything else: the panel appears, its numbers equal raw axe-core, focus moves into the dialog, Escape closes it, a second click does not stack panels, and `chrome://` pages fail visibly with a `!` badge. The first real click is a manual check. I would rather say that than pretend the test covers it.

## Dogfooding

The site itself has to pass its own checker. At one point axe reported nothing wrong but listed items it could not judge: nav links over a CSS gradient, and numbered steps built from absolutely positioned pseudo-elements. Nothing was broken for a person, but "needs manual review" on the page of an accessibility checker is a bad look. Swapping gradients for solid colours and the positioned numbers for floats cleared it, and a test now fails if any page has items left over.

## What it cannot do

Automated testing finds only part of the problems a site can have. It cannot tell you whether alt text is meaningful or whether a page works with a keyboard, so Fixlist never says "compliant", and I added a link to the FTC's 2025 order against an accessibility widget vendor over compliance claims to remind myself why.

## Try it, and tell me what is missing

- Site and bookmarklet: https://fix-list.vercel.app/check
- Code (MIT): https://github.com/zekemit/fix-list
- Extension zip: in `releases/` in the repo (not in the Chrome Web Store yet)

Disclosure: there is also a paid written fix plan ($49) that I am testing whether anyone wants. The checker is and stays free. This project was built with help from Claude Code, and the tests in the repo are what I trusted instead of its word.
