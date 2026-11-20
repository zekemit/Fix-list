// Page content. Every claim with a number links to its source. No compliance promises.
const SRC = {
  seyfarth: 'https://www.adatitleiii.com/2026/03/federal-court-website-accessibility-lawsuit-filings-bounce-back-in-2025/',
  usablenet: 'https://blog.usablenet.com/2025-midyear-accessibility-lawsuit-report-key-legal-trends',
  ftc: 'https://www.dataprivacyandsecurityinsider.com/2025/04/ftc-settles-with-accessibe-for-misleading-statements-about-wcag-compliance/',
  wcag: 'https://www.w3.org/TR/WCAG21/',
  contrast: 'https://www.w3.org/TR/WCAG21/#contrast-minimum'
};

export function buildContent(cfg, ctx) {
  const price = `$${cfg.price}`;
  const contact = ctx.contactHtml;
  const pages = [];

  pages.push({
    path: '/', nav: 'Home',
    title: `${cfg.siteName}: free accessibility check for online stores`,
    description: 'Find accessibility problems on your online store in one click. The check runs in your browser and sends nothing anywhere. Paid fix plans with exact elements and fix instructions.',
    body: `
<h1>Find the accessibility problems on your online store. Free, in your browser.</h1>
<p class="lede">Drag one button to your bookmarks bar, open any page of your store, click it, and see what automated testing finds. Nothing leaves your browser.</p>
<div class="cta">
  <a class="btn" href="/check">Get the free check</a>
  <a class="btn secondary" href="/order">See the ${price} fix plan</a>
</div>

<h2>How it works</h2>
<ol class="steps">
  <li><strong>Install the check.</strong> It is a bookmarklet, a bookmark that runs a small program on the page you are viewing.</li>
  <li><strong>Open your store</strong> and click it. You see the issue types, how many elements are affected and which are critical.</li>
  <li><strong>Fix it yourself</strong> with our <a href="/guides">free guides</a>, or order a fix plan with the exact elements and fix instructions.</li>
</ol>

<h2>Why store owners are checking now</h2>
<ul>
  <li>Plaintiffs filed <strong>3,117 federal website accessibility lawsuits in 2025</strong>, up 27% from 2024 (<a href="${SRC.seyfarth}">Seyfarth Shaw</a>).</li>
  <li>UsableNet, a vendor that sells accessibility services, reports that e-commerce made up about 69% of the website lawsuits it tracked in the first half of 2025 (<a href="${SRC.usablenet}">UsableNet</a>). Treat the exact share as approximate.</li>
  <li>Accessible stores also work better for the people who struggle with small text, tiny buttons and unlabelled forms. That is a lot of customers.</li>
</ul>

<h2>What we do not do</h2>
<p>We do not sell a widget that claims to make your store compliant. In 2025 the <a href="${SRC.ftc}">FTC ordered an accessibility-widget vendor to pay $1 million</a> over claims that its product could make any site meet the web accessibility guidelines. Automated testing finds only part of the problems, and no tool can certify compliance. We show you real problems and how to fix them.</p>
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
<p class="price">${price} <span class="sources">per store, one-time</span></p>
${orderButton}

<h2>What you get</h2>
<ul>
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
<ul>
${ctx.guides.map((g) => `  <li><a href="/guides/${g.slug}">${g.title}</a><br><span class="sources">${g.description}</span></li>`).join('\n')}
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
<p>It runs in your browser and sends nothing to us.</p>
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
