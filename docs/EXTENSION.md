# Fixlist Chrome extension

Click the toolbar button (or press Alt+Shift+F) on any page and a panel lists the accessibility problems software can find, in plain language. It works on sites whose Content-Security-Policy blocks the bookmarklet, because Chrome lets extensions inject their own bundled files.

## Install (until it is in the Chrome Web Store)
Easiest: download [`releases/fixlist-extension-0.1.0.zip`](https://github.com/zekemit/fix-list/raw/main/releases/fixlist-extension-0.1.0.zip), unzip it, then open `chrome://extensions`, turn on **Developer mode**, choose **Load unpacked**, and select the unzipped folder.

Or build it yourself:
```bash
npm install
npm run build:extension      # builds dist-ext/unpacked and dist-ext/fixlist-extension-<version>.zip
```
Then load `dist-ext/unpacked` the same way. Pin the button from the puzzle-piece menu.

## What it can and cannot do
- It runs **only when you click it**, on that tab only. No background activity, no content scripts, no host permissions.
- Permissions: `activeTab` (use the tab you clicked) and `scripting` (put the checker into that tab). Nothing else. A test fails the build if this list changes.
- It makes **no network requests**. axe-core ships inside the extension. The only link in the panel ("Get the fix plan") is opened by you.
- It cannot run where Chrome forbids extensions: `chrome://` pages, the Chrome Web Store, and the built-in PDF viewer. The button then shows `!` and its tooltip says why.
- It checks the page as it is when you click. Content behind clicks, log-ins or scrolling is checked only once it is on screen.
- Automated testing finds only part of the problems a site can have. The panel never says "compliant".

## How it is tested (`tests/ext.mjs`)
1. The shipped files: Manifest V3, exact permissions, icons, no leftover build tokens, byte-identical axe-core, no network APIs or `eval` in our code, a zip with the manifest at its root and under 2 MB.
2. A real Chromium with the extension loaded: the service worker starts; the panel appears with the planted problems; its numbers equal raw axe-core; focus moves into the dialog; Escape closes it; a second click does not stack panels; it works on a page with a blocking CSP; it fails visibly on `chrome://`; the page makes no requests beyond its own.

**One thing automation cannot do:** Chrome only grants `activeTab` for a real toolbar click or shortcut. The browser tests therefore load a copy of the build whose manifest also lists `http://127.0.0.1/*`, and call the same function the click handler calls. The first real click on a real page is a manual check, listed in the release steps below.

## Release steps (needs an adult's account)
1. Manual check: load unpacked, open a normal website, click the button. Open `chrome://extensions` and confirm "Site access" says "On click".
2. Chrome Web Store developer account (one-time fee, requires a verified adult account holder). Upload the zip.
3. Store listing text (accurate to what it does):
   - **Name:** Fixlist: accessibility check
   - **Summary:** Check the page you are viewing for accessibility problems, in plain language. Runs only when you click it. Sends nothing anywhere.
   - **Description:** Click the button on any page of your online store. Fixlist runs the open-source axe-core engine in your browser and lists the problems it finds, most serious first, explained in plain language. Nothing is sent anywhere. It does not run until you click, and it only touches the tab you clicked. Automated testing finds only part of the accessibility problems a site can have, so a clean result is not a guarantee, and Fixlist never says "compliant". Source code: https://github.com/zekemit/fix-list
   - **Permission justifications:** `activeTab`: to check the page the user clicked. `scripting`: to add the checker panel to that page. No host permissions are requested.
   - **Single purpose:** Check the current page for accessibility problems and show the results.
   - **Data use:** collects no user data. Privacy policy: https://fix-list.vercel.app/privacy
4. Tag the release in GitHub and attach the zip.
