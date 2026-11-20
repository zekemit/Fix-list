// Page content. Every claim with a number links to its source. No compliance promises.
const SRC = {
  seyfarth: 'https://www.adatitleiii.com/2026/03/federal-court-website-accessibility-lawsuit-filings-bounce-back-in-2025/',
  usablenet: 'https://blog.usablenet.com/2025-midyear-accessibility-lawsuit-report-key-legal-trends',
  ftc: 'https://www.dataprivacyandsecurityinsider.com/2025/04/ftc-settles-with-accessibe-for-misleading-statements-about-wcag-compliance/',
  wcag: 'https://www.w3.org/TR/WCAG21/',
  contrast: 'https://www.w3.org/TR/WCAG21/#contrast-minimum'
};


// Inline icons and the demo illustration. All decorative: text equivalents sit next to them.
const SVG = {
  mug: '<svg viewBox="0 0 160 120" width="160" height="120" aria-hidden="true" focusable="false"><ellipse cx="78" cy="108" rx="48" ry="7" fill="#101B33" opacity=".12"/><path d="M118 40h10a16 16 0 0 1 0 32h-12" fill="none" stroke="#1B44C8" stroke-width="9" stroke-linecap="round"/><path d="M34 28h86v44a30 30 0 0 1-30 30H64a30 30 0 0 1-30-30z" fill="#1B44C8"/><path d="M34 28h86v12H34z" fill="#3C63DB"/><path d="M48 52v18a16 16 0 0 0 10 15" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="5" stroke-linecap="round"/></svg>',
  heart: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path d="M12 20.5s-7.5-4.6-9-9.3C2 8 4 5.2 7 5.2c2 0 3.5 1.1 5 3 1.5-1.9 3-3 5-3 3 0 5 2.8 4 6-1.5 4.700-9 9.300-9 9.300z" fill="none" stroke="#101B33" stroke-width="2" stroke-linejoin="round"/></svg>',
  cart: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path d="M3 4h2.500l2.200 11h10.100l2-8H6.500" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="19.500" r="1.600" fill="#fff"/><circle cx="17" cy="19.500" r="1.600" fill="#fff"/></svg>'
};

export function buildContent(cfg, ctx) {
  const price = `$${cfg.price}`;
  const contact = ctx.contactHtml;
  const pages = [];

  pages.push({
    path: '/', nav: null,
    title: `${cfg.siteName}: free accessibility check for online stores`,
    description: 'Find accessibility problems on your online store in one click. The check runs in your browser and sends nothing anywhere. Paid fix plans with exact elements and fix instructions.',
    body: `
<section class="hero" aria-labelledby="hero-title">
  <div class="hero-text">
    <h1 id="hero-title">Hear your store the way a screen reader does.</h1>
    <p class="lede">Fixlist checks any page of your online store for the accessibility problems software can find, explains each one in plain language, and tells you how to fix it.</p>
    <div class="cta">
      <a class="btn" href="/check">Get the free check</a>
      <a class="btn secondary" href="/order">See the ${price} fix plan</a>
    </div>
    <p class="fine">The check runs in your browser and sends nothing anywhere. The code is <a href="${cfg.repoUrl}">open source</a>.</p>
  </div>

  <figure class="demo" id="demo" data-state="before">
    <div class="demo-bar">
      <figcaption id="demo-cap">The same product card, two ways</figcaption>
      <div class="seg" role="group" aria-label="Choose which version to hear" hidden>
        <button type="button" data-set="before" aria-pressed="true">Before the fix</button>
        <button type="button" data-set="after" aria-pressed="false">After the fix</button>
      </div>
    </div>

    <div class="card" aria-hidden="true">
      <div class="card-img">
        ${SVG.mug}
        <span class="flag flag-img">no description</span>
        <span class="heart">${SVG.heart}</span>
        <span class="flag flag-heart">no name</span>
      </div>
      <div class="card-body">
        <p class="card-title">Blue ceramic mug</p>
        <p class="card-price">$24.00</p>
        <div class="card-row">
          <div class="ctl"><span class="qty">1</span><span class="flag flag-qty">no label</span></div>
          <div class="ctl ctl-grow"><span class="add">${SVG.cart}</span><span class="flag flag-add">no name</span></div>
        </div>
      </div>
    </div>

    <div class="said-wrap">
      <p class="said-intro" id="said-intro">What a screen reader says, line by line. Wording varies by screen reader.</p>
      <div class="said" data-for="before">
        <h2 class="said-title">Before the fix</h2>
        <ul>
          <li class="bad d0">image <span class="why">The image has no description.</span></li>
          <li>Blue ceramic mug, heading level 2</li>
          <li>$24.00</li>
          <li class="bad d1">link <span class="why">Where does it go?</span></li>
          <li class="bad d2">edit text <span class="why">Edit what?</span></li>
          <li class="bad d3">button <span class="why">What does it do?</span></li>
        </ul>
      </div>
      <div class="said" data-for="after">
        <h2 class="said-title">After the fix</h2>
        <ul>
          <li class="good">Blue ceramic mug, image</li>
          <li>Blue ceramic mug, heading level 2</li>
          <li>$24.00</li>
          <li class="good">Save to wishlist, link</li>
          <li class="good">Quantity, edit text, 1</li>
          <li class="good">Add to cart, button</li>
        </ul>
      </div>
    </div>
  </figure>
</section>

<section class="ways" aria-labelledby="ways-title">
  <h2 id="ways-title">Check a page three ways</h2>
  <div class="way">
    <h3>A bookmark</h3>
    <div>
      <p>Drag one button to your bookmarks bar, open any page of your store, and click it. A panel lists what was found, most serious first. Nothing is installed.</p>
      <p><a class="btn secondary" href="/check">Get the bookmark</a></p>
    </div>
  </div>
  <div class="way">
    <h3>A command</h3>
    <div>
      <p>Check several pages at once, write a Markdown fix plan, or fail a build when a serious problem appears. It also works on sites that block the bookmark.</p>
      <pre class="terminal" tabindex="0" role="group" aria-label="Example command and output"><code>npx github:zekemit/fix-list scan https://your-store.com/

https://your-store.com/  (HTTP 200)
  6 issue types, 6 elements, 6 critical or serious
  CRITICAL Buttons with no readable text (1)
  CRITICAL Images with no alternative text (1)
  CRITICAL Form fields with no label (1)
  SERIOUS  Text that is hard to read against its background (1)
  SERIOUS  Page language not set (1)
  SERIOUS  Links with no readable text (1)</code></pre>
      <p class="fine">Example output. Your store's results will differ.</p>
    </div>
  </div>
  <div class="way">
    <h3>A fix plan</h3>
    <div>
      <p><span class="price-inline">${price}</span> per store. We check the pages you choose and send a written plan: every problem in order of importance, the exact element, and how to fix it, with Shopify steps where they apply.</p>
      <p><a class="btn secondary" href="/order">See what's in the plan</a></p>
    </div>
  </div>
</section>

<section class="finds" aria-labelledby="finds-title">
  <h2 id="finds-title">What the check looks for</h2>
  <p class="lede">The problems that block real customers, and the ones stores get sued over most often.</p>
  <ul class="ticks">
    <li><strong>Images with no description.</strong> Screen readers say &ldquo;image&rdquo; or read a file name.</li>
    <li><strong>Form fields with no label.</strong> Customers cannot tell what to type.</li>
    <li><strong>Buttons and links with no text.</strong> Icon-only cart and menu buttons are announced as just &ldquo;button&rdquo;.</li>
    <li><strong>Text that is hard to read.</strong> Light grey on white fails people with low vision, and everyone outdoors.</li>
    <li><strong>Tap targets that are too small.</strong> Hard to hit on a phone and for people with tremors.</li>
    <li><strong>No page language or title.</strong> Screen readers pick the wrong voice or announce nothing.</li>
  </ul>
</section>

<section class="evidence" aria-labelledby="evidence-title">
  <h2 class="statement" id="evidence-title">No tool can make a store compliant with one click.</h2>
  <div class="evidence-cols">
    <p>In 2025 the <a href="${SRC.ftc}">FTC ordered an accessibility-widget vendor to pay $1 million</a> over claims that its product could make any site meet the web accessibility guidelines. Automated testing finds only part of the problems. So Fixlist shows you real problems and how to fix them, and it never says &ldquo;compliant&rdquo;.</p>
    <p>Plaintiffs filed <strong>3,117 federal website accessibility lawsuits in 2025</strong>, up 27% from 2024 (<a href="${SRC.seyfarth}">Seyfarth Shaw</a>). UsableNet, a vendor that sells accessibility services, reports that e-commerce made up about 69% of the website cases it tracked in the first half of 2025 (<a href="${SRC.usablenet}">UsableNet</a>). Treat that share as approximate.</p>
  </div>
</section>

<section class="closing" aria-labelledby="closing-title">
  <h2 id="closing-title">Run it on your busiest page first.</h2>
  <div class="cta">
    <a class="btn" href="/check">Get the free check</a>
    <a class="btn secondary" href="/guides">Read the free guides</a>
  </div>
</section>
`
  });

  pages.push({
    path: '/check', nav: 'Free check',
    title: `Free accessibility check: ${cfg.siteName}`,
    description: 'A free bookmarklet that checks the page you are viewing against the WCAG rules software can test (2.0 and 2.1 A and AA, plus target size from 2.2). Runs in your browser and sends nothing.',
    body: `
<h1>Free accessibility check</h1>
<p class="lede">A one-click check for the page you are viewing. It runs the open-source axe-core engine in your browser against the WCAG 2.0 and 2.1 Level A and AA rules that software can test, plus the one WCAG 2.2 Level AA rule axe covers (target size).</p>

<h2>Install it</h2>
<ol class="steps">
  <li>Show your browser's bookmarks bar (Ctrl+Shift+B, or Cmd+Shift+B on a Mac).</li>
  <li>Drag this button onto the bar: <a id="bookmarklet" class="bookmarklet" href="${ctx.bookmarkletHref}">Fixlist check</a></li>
  <li>Open a page of your store, such as the home page, a product page or the cart, and click the bookmark.</li>
</ol>
<p id="bookmarklet-msg" role="status"></p>
<p>Prefer to copy it? <button type="button" id="copy-code" class="btn secondary" hidden>Copy bookmarklet code</button></p>
<pre id="bookmarklet-code">${ctx.bookmarkletHref.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</pre>

<h2>Or use the command line</h2>
<p>Developers, agencies and anyone who wants to check several pages at once can run the same engine from a terminal. It needs Node 18.3 or newer and a Chrome, Edge or Chromium browser. It also works on sites whose Content Security Policy blocks the bookmark.</p>
<pre class="terminal" id="cli-code" tabindex="0" role="group" aria-label="Command"><code>npx github:zekemit/fix-list scan https://your-store.com/ --out fix-plan.md</code></pre>
<p>It prints the problems in plain language and writes a Markdown fix plan. Add <code>--format json</code> for machine-readable output, or <code>--fail-on serious</code> to fail a build. <a href="${cfg.repoUrl}#command-line-tool">Full options</a>.</p>

<h2>Check each kind of page</h2>
<p>Stores repeat the same templates, so check one of each: home, collection, product, cart, search and any page with a form. Problems in a template appear on every page that uses it.</p>

<h2>What it does and does not do</h2>
<ul>
  <li><strong>Private:</strong> everything runs in your browser. The only thing it loads is the checker engine from this site. Nothing about your store is sent to us. You can read the code in the <a href="/fixlist-check.js">script itself</a>.</li>
  <li><strong>Partial:</strong> automated tools cannot judge everything, such as whether alt text is meaningful or a page is usable with a keyboard. A clean result is not a guarantee.</li>
  <li><strong>May be blocked:</strong> some sites tell browsers not to run outside scripts (a Content Security Policy). The bookmark then shows a message saying it could not run, and that is the likely reason. Tell us which site and we will help.</li>
  <li><strong>Desktop only:</strong> dragging to a bookmarks bar needs a desktop browser.</li>
</ul>

<div class="cta"><a class="btn" href="/order">Want the exact fixes? See the fix plan</a></div>
`
  });

  const orderButton = cfg.orderUrl
    ? `<p><a class="btn" href="${String(cfg.orderUrl).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')}" rel="noopener">Order the fix plan for ${price}</a></p>`
    : `<p class="note"><strong>Orders open soon.</strong> We are finishing payment setup. ${contact}</p>`;

  pages.push({
    path: '/order', nav: 'Fix plan',
    title: `Store accessibility fix plan, ${price}: ${cfg.siteName}`,
    description: `A prioritized accessibility fix plan for your online store: the exact elements, plain-language fix instructions, and a re-check after you fix. ${price} per store.`,
    body: `
<h1>Store accessibility fix plan</h1>
<p class="lede">The free check tells you what is wrong. The fix plan tells you exactly where it is and how to fix it, in order of importance.</p>
<p class="price">${price}<span class="per">per store, one time</span></p>
${orderButton}

<h2>What you get</h2>
<ul class="ticks">
  <li><strong>A prioritized list</strong> of the problems found on your store's key pages, most important first.</li>
  <li><strong>The exact elements</strong>: selectors and the HTML as it appears, so you or your developer can find each one.</li>
  <li><strong>Fix instructions</strong>: for the 25 most common problem types we include a plain-language explanation, the fix, and Shopify steps or Liquid code where they apply. For other problems we link to the official guidance for that rule.</li>
  <li><strong>A draft accessibility statement</strong> you can edit and publish.</li>
  <li><strong>A re-check</strong> within 14 days, so you can confirm what you fixed.</li>
</ul>

<h2>How it works</h2>
<ol class="steps">
  <li>Order, and tell us your store address and the pages that matter most.</li>
  <li>We scan those pages and write the plan. Delivery is within 3 business days.</li>
  <li>You fix what you can. Send us the store again for the re-check.</li>
</ol>

<h2>Honest limits</h2>
<ul>
  <li>This is automated testing plus written guidance. It is <strong>not</strong> a legal opinion, a compliance certificate or a full manual audit.</li>
  <li>We do not guarantee any outcome, including protection from legal claims. If you receive a legal letter, talk to a lawyer.</li>
  <li><strong>Refund:</strong> if we cannot deliver within 5 business days, or you are not satisfied with the first delivery, you get your money back.</li>
</ul>
`
  });

  pages.push({
    path: '/guides', nav: 'Guides',
    title: `Free accessibility guides for store owners: ${cfg.siteName}`,
    description: 'Plain-language, copy-and-paste guides for the accessibility problems that show up most often on online stores.',
    body: `
<h1>Free guides</h1>
<p class="lede">Short, practical fixes for the problems the check finds most often.</p>
<ul class="rows">
${ctx.guides.map((g) => `  <li><a href="/guides/${g.slug}">${g.title}</a><span class="sources">${g.description}</span></li>`).join('\n')}
</ul>
`
  });

  pages.push({
    path: '/about', nav: 'About',
    title: `How ${cfg.siteName} works and what it does with your data`,
    description: 'What the check does, what it sends (nothing), what we collect when you order, and why we do not sell compliance.',
    body: `
<h1>How Fixlist works</h1>
<h2>The free check</h2>
<p>The bookmarklet loads a script from this site, which loads the open-source <a href="https://github.com/dequelabs/axe-core">axe-core</a> engine. The engine inspects the page in your browser and the script shows the results. It does not send results, page content or addresses to us or anyone else.</p>
<h2>The fix plan</h2>
<p>To write a fix plan we scan the pages you tell us about, the way any visitor's browser would load them. We keep the results to write your plan and to re-check, and we delete them within 90 days after delivery unless you ask us to keep them.</p>
<h2>Why we do not sell compliance</h2>
<p>Web accessibility guidelines include things software cannot test. Anyone who promises a one-click compliant site is promising more than testing can show, and regulators have taken action over such claims. We find real problems and show how to fix them.</p>
<h2>Contact</h2>
<p>${contact}</p>
`
  });

  pages.push({
    path: '/privacy', nav: null,
    title: `Privacy: ${cfg.siteName}`,
    description: 'What this site and the free check collect: nothing about your store. What we collect when you order.',
    body: `
<h1>Privacy</h1>
<p>Last updated ${cfg.lastUpdated}.</p>
<h2>The free check</h2>
<p>It runs in your browser and sends nothing to us. The same is true of the command-line tool and the browser extension: they run on your computer, load only the pages you point them at, and upload nothing.</p>
<h2>This website</h2>
<p>We use standard server logs from our host and may use privacy-friendly page-view counts. We do not use advertising trackers or sell data.</p>
<h2>When you order</h2>
<p>Our payment provider collects your payment details and email. We receive your name, email, store address and what you tell us about it. We use these only to deliver and support your order. We delete scan data within 90 days after delivery unless you ask us to keep it, and you can ask us to delete your data at any time.</p>
<h2>Children</h2>
<p>This service is for store owners and is not directed at children under 13.</p>
<h2>Contact</h2>
<p>${contact}</p>
`
  });

  pages.push({
    path: '/terms', nav: null,
    title: `Terms: ${cfg.siteName}`,
    description: 'Terms for the free check and the paid fix plan, including what we do not promise.',
    body: `
<h1>Terms</h1>
<p>Last updated ${cfg.lastUpdated}.</p>
<h2>What we provide</h2>
<p>A free in-browser check, free guides and, for a fee, a written fix plan based on automated testing. Automated testing finds only part of the accessibility problems a site may have.</p>
<h2>What we do not provide</h2>
<p>Legal advice, a legal opinion, a certificate of compliance with any law or standard, or a guarantee about any outcome, including protection from claims. If you receive a legal notice, consult a lawyer.</p>
<h2>Orders</h2>
<p>The fix plan is delivered electronically within 3 business days of receiving what we need. If we cannot deliver within 5 business days, or you are not satisfied with the first delivery, we refund you in full. You may use the plan for your own store and its developers.</p>
<h2>Free tools</h2>
<p>The free check and guides are provided as is, without warranty. The checker's source is published under the project's open-source licence.</p>
<h2>Contact</h2>
<p>${contact}</p>
`
  });

  const guides = [
    {
      slug: 'alt-text-shopify',
      title: 'How to add alt text to images in Shopify',
      description: 'Fix the most common accessibility problem on stores: images with no alternative text.',
      body: `
<p>Alternative text (alt text) is the description a screen reader reads for an image. Missing alt text is among the most frequent problems automated checks find on stores.</p>
<h2>What to write</h2>
<ul>
  <li><strong>Product photos:</strong> describe what is shown, in a sentence: "Navy cotton t-shirt, front view, crew neck".</li>
  <li><strong>Images that carry text</strong> (a sale banner): repeat the text.</li>
  <li><strong>Linked images or icons:</strong> describe where the link goes, such as "Cart".</li>
  <li><strong>Purely decorative images:</strong> use an empty alt, <code>alt=""</code>, so screen readers skip them.</li>
</ul>
<p>Skip phrases like "image of". Keep it to what matters to someone who cannot see the picture.</p>
<h2>In the Shopify admin</h2>
<p>Open the product, select the image and add alt text. Menu labels change between admin versions, so look for "Add alt text" on the image. For other images, check the Files area of the admin.</p>
<h2>In your theme code</h2>
<pre>{{ product.featured_image | image_url: width: 800 | image_tag }}</pre>
<p>The <code>image_tag</code> filter outputs the alt text saved in the admin. For a decorative image written by hand:</p>
<pre>&lt;img src="divider.png" alt=""&gt;</pre>
<h2>Check your work</h2>
<p>Run the <a href="/check">free check</a> again. The "Images with no alternative text" issue should disappear. Automated checks cannot tell whether your text is <em>good</em>, so read it as if you could not see the image.</p>
`
    },
    {
      slug: 'color-contrast-shopify',
      title: 'Fix low color contrast in your store theme',
      description: 'Make text readable: the 4.5:1 and 3:1 rules explained, with a quick CSS fix.',
      body: `
<p>Low contrast means text is too close in colour to its background. Light grey prices, pale placeholder text and white text on a bright button are common causes.</p>
<h2>The rule</h2>
<p>The web accessibility guidelines require a contrast ratio of <strong>4.5:1</strong> for normal text and <strong>3:1</strong> for large text, which is about 24px, or 18.66px if bold (<a href="https://www.w3.org/TR/WCAG21/#contrast-minimum">WCAG 2.1, Contrast (Minimum)</a>).</p>
<h2>Find the problem</h2>
<p>Run the <a href="/check">free check</a>. It lists "Text that is hard to read against its background" and the number of elements affected. In your browser's developer tools, inspecting an element shows its contrast ratio next to the colour picker.</p>
<h2>Fix it</h2>
<ol class="steps">
  <li>In your theme editor, open the colour settings and darken the text colour or lighten the background until it passes.</li>
  <li>For a single stubborn element, add a rule in your theme's custom CSS:
<pre>.price { color: #4a4a4a; }
.badge { background: #8a1f11; color: #ffffff; }</pre></li>
  <li>Re-run the check.</li>
</ol>
<p>Beware of text over photos. Contrast changes with the image, so add a solid or semi-opaque panel behind the text.</p>
`
    },
    {
      slug: 'form-labels',
      title: 'Label your forms: newsletter signup, search and checkout',
      description: 'Every form field needs a label. Placeholder text is not enough.',
      body: `
<p>A screen reader announces a field using its label. If a field has none, users hear only "edit text". A placeholder disappears as soon as someone types and is not a reliable label.</p>
<h2>The fix</h2>
<pre>&lt;label for="Email"&gt;Email&lt;/label&gt;
&lt;input type="email" id="Email" name="email"&gt;</pre>
<p>The <code>for</code> value must match the input's <code>id</code>.</p>
<h2>When the design has no visible label</h2>
<p>Keep a label for assistive technology and hide it visually:</p>
<pre>&lt;label for="Search" class="visually-hidden"&gt;Search&lt;/label&gt;</pre>
<pre>.visually-hidden {
  position: absolute; width: 1px; height: 1px; overflow: hidden;
  clip: rect(0 0 0 0); white-space: nowrap;
}</pre>
<p>Many themes already define a class like this. Check before adding your own.</p>
<h2>Where to look in a store</h2>
<ul>
  <li>The newsletter signup in the footer.</li>
  <li>The search box in the header.</li>
  <li>Sort-by and variant dropdowns. Use a label with <code>for</code> pointing at the <code>select</code>.</li>
  <li>Any app that adds a popup form.</li>
</ul>
`
    },
    {
      slug: 'accessibility-statement-template',
      title: 'Write an accessibility statement for your store (template)',
      description: 'A plain template you can edit and publish, with the parts that matter.',
      body: `
<p>An accessibility statement tells visitors what you aim for, what you know is not working, and how to reach you. It is not a legal shield. It is useful, and it gives people a way to tell you about problems.</p>
<p class="note">This template is general information, not legal advice. Edit it to be true for your store, and do not claim more than you have done.</p>
<h2>Template</h2>
<pre>Accessibility statement for [Store name]

We want everyone to be able to shop at [Store name]. We aim for our
website to meet the Web Content Accessibility Guidelines (WCAG) 2.1
Level AA. We have not yet reached that goal on every page.

What we have done
- [Example: added alternative text to product images]
- [Example: labelled our forms]

Known problems
- [Example: some older product videos do not have captions]
We are working on these and expect to fix them by [date].

Tell us about a problem
If you have trouble using any part of our site, contact us at
[email address or phone]. Tell us the page and what happened. We will
reply within [number] business days and try to give you the information
or service another way.

This statement was last updated on [date].</pre>
<h2>Publish it</h2>
<p>Put it on its own page and link to it from your footer. Keep the date current and update it when you fix things. Only list work you have actually done.</p>
`
    },
    {
      slug: 'website-accessibility-lawsuits-2025',
      title: 'Website accessibility lawsuits: what the 2025 data says',
      description: 'Numbers, with sources, and what a store owner can sensibly do.',
      body: `
<p>This is a summary of public data, not legal advice.</p>
<h2>The numbers</h2>
<ul>
  <li>Plaintiffs filed <strong>3,117 website accessibility lawsuits in US federal court in 2025</strong>, up from 2,452 in 2024, a 27% increase. New York had 1,021, Florida 961 and Illinois 585 (<a href="${SRC.seyfarth}">Seyfarth Shaw</a>).</li>
  <li>Cases in state courts are not in that count. One accessibility vendor puts the 2025 total above 5,000 when state courts are included, a figure we could not verify independently.</li>
  <li>UsableNet, which sells accessibility services, reports that in the first half of 2025 e-commerce made up about 69% of the website cases it tracked, food service about 18% and healthcare about 4% (<a href="${SRC.usablenet}">UsableNet midyear report</a>). Treat the exact shares as approximate.</li>
</ul>
<h2>What it does not tell you</h2>
<p>It does not tell you your chance of being sued, and it does not tell you what a court will decide for a given site. The data show that the cases are common and concentrated in retail.</p>
<h2>What a store owner can sensibly do</h2>
<ol class="steps">
  <li>Run the <a href="/check">free check</a> on your main page types and fix the critical and serious issues first.</li>
  <li>Publish an <a href="/guides/accessibility-statement-template">accessibility statement</a> with a way to contact you, and answer promptly.</li>
  <li>Keep a dated record of what you checked and fixed.</li>
  <li>Be careful with widgets that promise instant compliance. The <a href="${SRC.ftc}">FTC ordered one vendor to pay $1 million</a> over that kind of claim.</li>
  <li>If you receive a legal letter, speak to a lawyer before replying.</li>
</ol>
`
    }
  ];

  return { pages, guides };
}
