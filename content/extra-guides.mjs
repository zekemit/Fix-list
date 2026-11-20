// More guides. Facts come from Shopify's own theme requirements and best-practice pages, WCAG 2.1/2.2, and the
// sources already cited on the site. Nothing here is legal advice, and nothing says a store "is compliant".

const SHOPIFY_REQ = 'https://shopify.dev/docs/storefronts/themes/store/requirements';
const SHOPIFY_A11Y = 'https://shopify.dev/docs/storefronts/themes/best-practices/accessibility';

export function extraGuides(cfg, SRC) {
  return [
    {
      slug: 'shopify-accessibility-checklist',
      title: 'Shopify accessibility checklist: 12 things to check on every page type',
      description: 'A practical checklist based on Shopify\'s own theme requirements, split into what a free check finds and what you test by hand.',
      body: `
<p>Shopify publishes accessibility rules for the themes it lists in its Theme Store, and they make a good checklist for any store. This page turns them into twelve checks. The first seven can be found by software. The last five need you, because tools cannot judge them. Sources: Shopify's <a href="${SHOPIFY_REQ}">theme store requirements</a> and <a href="${SHOPIFY_A11Y}">accessibility best practices</a>.</p>
<p>Check one page of each kind: home, collection, product, cart, search, and any page with a form. Template problems repeat on every page that uses the template.</p>

<h2>Software can find these</h2>
<p>Run the <a href="/check">free check</a> (or the <a href="/guides/accessibility-check-in-ci-github-actions">command-line tool</a>) and look for each one.</p>
<ol class="steps">
  <li><strong>Every image has alt text.</strong> Product images need descriptive alt text; decorative ones need an empty <code>alt=""</code>. In theme code, <code>image_url | image_tag</code> outputs the alt text saved in the admin. See <a href="/guides/alt-text-shopify">how to add alt text</a>.</li>
  <li><strong>Every form field has a label.</strong> The input needs a unique <code>id</code> and a <code>&lt;label for="..."&gt;</code> with the same value. A placeholder is not a label. See <a href="/guides/form-labels">form labels</a>.</li>
  <li><strong>Text is easy to read.</strong> Contrast of at least 4.5:1 for body text and 3:1 for large text, icons and borders. See <a href="/guides/color-contrast-shopify">fixing contrast</a>.</li>
  <li><strong>Buttons and links say what they do.</strong> An icon-only cart or menu button needs a name: <code>&lt;button aria-label="Open cart"&gt;</code>. Link text should make sense on its own, so avoid "click here".</li>
  <li><strong>The page language is set.</strong> In <code>theme.liquid</code>: <code>&lt;html lang="{{ request.locale.iso_code }}"&gt;</code>. Screen readers use it to pick the right voice.</li>
  <li><strong>Zoom is not disabled.</strong> Remove <code>maximum-scale</code> and <code>user-scalable=no</code> from the viewport tag. A safe version: <pre>&lt;meta name="viewport" content="width=device-width, initial-scale=1"&gt;</pre></li>
  <li><strong>Tap targets are big enough.</strong> At least 24 by 24 CSS pixels for buttons and links that are not inside a sentence (WCAG 2.2, Target Size Minimum). Shopify's theme requirements say the same.</li>
</ol>

<h2>You test these by hand</h2>
<p>Automated tools cannot decide these. Set aside twenty minutes per template.</p>
<ol class="steps" start="8">
  <li><strong>Headings are in order, with one h1.</strong> Use headings for structure, not for size, and keep them in sequence (h1, then h2, then h3). The free check does not judge heading order, so read the headings down the page and ask whether they make an outline you could navigate by.</li>
  <li><strong>Use the page with only a keyboard.</strong> Tab and Shift+Tab should reach every link, button, menu and form control, in an order that matches the page. Menus open with Enter or Space and close with Escape. Nothing should require hovering.</li>
  <li><strong>The focus outline is always visible.</strong> If you cannot see where you are while tabbing, neither can a keyboard user. Do not remove outlines in CSS without replacing them. A skip link ("Skip to content") should appear when it receives focus.</li>
  <li><strong>Sale and regular prices can be told apart without sight.</strong> Colour and strikethrough are not announced. Add visually hidden text such as "Sale price" and "Regular price" next to each amount.</li>
  <li><strong>Changes are announced.</strong> If choosing a variant updates the price, availability or the cart count, a screen reader user needs to hear it. A polite live region does this: <pre>&lt;div aria-live="polite" id="price-status"&gt;&lt;/div&gt;</pre> Update its text when the price changes.</li>
</ol>

<h2>How to use this list</h2>
<p>Fix the automated findings first, because they are quick and unambiguous. Then do the four manual checks on your busiest templates. Write down what you checked and when. A clean automated result is not a guarantee: it means software found nothing it can judge, not that every customer can use the store.</p>
`
    },
    {
      slug: 'is-my-shopify-store-ada-compliant',
      title: 'Is my Shopify store ADA compliant? What you can check yourself',
      description: 'No tool can certify a store as compliant. Here is what you can check, what you cannot, and what to do next.',
      body: `
<p>This is a guide, not legal advice. For a specific legal question, talk to a lawyer.</p>
<h2>The honest short answer</h2>
<p>There is no official certificate that says a website is "ADA compliant", and no software can issue one. Complaints about website accessibility commonly point to the Web Content Accessibility Guidelines (WCAG) at Level AA as the yardstick, but that is a technical standard, not a legal verdict. What you can do is find and fix real problems, and keep a record that you did.</p>
<h2>Why store owners are asking</h2>
<p>Plaintiffs filed 3,117 federal website accessibility lawsuits in 2025, up 27% from 2024 (<a href="${SRC.seyfarth}">Seyfarth Shaw</a>). UsableNet, which sells accessibility services, reports that e-commerce made up about 69% of the website cases it tracked in the first half of 2025 (<a href="${SRC.usablenet}">UsableNet</a>). Those numbers say these cases are common and concentrated in retail. They do not say what your risk is.</p>
<h2>What you can check yourself</h2>
<ol class="steps">
  <li>Run the <a href="/check">free check</a> on one page of each kind: home, collection, product, cart, search, and any page with a form.</li>
  <li>Fix the critical and serious problems first. The <a href="/guides/shopify-accessibility-checklist">Shopify checklist</a> says how, with theme code.</li>
  <li>Test with a keyboard only: can you reach everything, see where you are, and complete a purchase?</li>
  <li>Publish an <a href="/guides/accessibility-statement-template">accessibility statement</a> with a way for people to tell you about problems, and answer them.</li>
  <li>Keep a dated note of what you checked and fixed.</li>
</ol>
<h2>What you cannot check yourself</h2>
<ul>
  <li><strong>Whether your alt text is good.</strong> Software can see that alt text exists, not whether it describes the image.</li>
  <li><strong>Whether the whole experience works with a screen reader</strong>, including third-party apps and checkout.</li>
  <li><strong>Whether you meet a legal standard.</strong> Only a court or a regulator can say that.</li>
</ul>
<h2>What does not solve it</h2>
<p>A widget that promises instant compliance. In 2025 the <a href="${SRC.ftc}">FTC ordered one such vendor to pay $1 million</a> over claims about meeting the guidelines. Read <a href="/guides/accessibility-overlay-widgets-ftc">what that means for store owners</a>.</p>
<h2>If you get a legal letter</h2>
<p>Do not ignore it and do not reply on your own. Talk to a lawyer who handles accessibility claims. Your dated record of checks and fixes is useful to show them.</p>
`
    },
    {
      slug: 'accessibility-overlay-widgets-ftc',
      title: 'Accessibility overlays and widgets: what the FTC order means for store owners',
      description: 'Why a one-line widget cannot make a store compliant, what the 2025 FTC order covered, and what to do instead.',
      body: `
<p>This is a summary of public information, not legal advice.</p>
<h2>What these products are</h2>
<p>An accessibility overlay or widget is a script you add to your store. It usually adds a toolbar for visitors (bigger text, higher contrast) and promises to fix accessibility problems automatically. Many are sold as a one-step route to compliance.</p>
<h2>What the FTC did</h2>
<p>In 2025 the <a href="${SRC.ftc}">FTC finalized an order requiring an accessibility-widget vendor to pay $1 million</a>. The matter concerned the vendor's claims that its product could make websites meet the web accessibility guidelines (WCAG). We link to a law-firm summary of the order because the vendor and the details are public record there. Read the order itself for the exact terms.</p>
<h2>Why a script cannot do the whole job</h2>
<ul>
  <li><strong>Many problems live in meaning, not markup.</strong> Whether alt text describes the picture, whether link text makes sense, whether the page works in a sensible order: software cannot reliably decide these.</li>
  <li><strong>Automated testing covers only part of the guidelines.</strong> That is true of every tool, including ours, which is why Fixlist never says "compliant".</li>
  <li><strong>The fix belongs in your theme.</strong> A missing label or a low-contrast colour is cheapest to fix at the source, where it stays fixed for every visitor, whether or not they use a toolbar.</li>
</ul>
<h2>Questions to ask any accessibility vendor</h2>
<ol class="steps">
  <li>Does the product change my theme's actual HTML, or only add a layer on top?</li>
  <li>What does it not fix? A vendor that cannot list limits is overselling.</li>
  <li>Would you put a compliance guarantee in writing? If so, ask who carries the risk if a customer complains.</li>
  <li>Is there a manual audit by people with disabilities, or only an automated scan?</li>
</ol>
<h2>What to do instead</h2>
<p>Find the real problems with the <a href="/check">free check</a>, fix them in your theme using the <a href="/guides/shopify-accessibility-checklist">checklist</a>, test with a keyboard, and publish an <a href="/guides/accessibility-statement-template">accessibility statement</a>. It is slower than installing a widget, and it is the part that helps customers.</p>
`
    },
    {
      slug: 'accessibility-check-in-ci-github-actions',
      title: 'Add an accessibility check to your build with GitHub Actions',
      description: 'Fail a pull request when a serious accessibility problem appears, using the Fixlist command-line tool and no extra setup on GitHub\'s Ubuntu runners.',
      body: `
<p>The Fixlist command-line tool opens your page in a real browser, runs the open-source axe-core engine, prints the problems in plain language, and sets an exit code. That makes it a one-step check in CI.</p>
<h2>The workflow</h2>
<p>This runs on every pull request and fails if the staging site has a serious or critical problem:</p>
<pre>name: accessibility
on: pull_request
jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - run: npx --yes github:zekemit/fix-list scan https://staging.example.com/ --fail-on serious</pre>
<p>GitHub's Ubuntu runners include Google Chrome, and the tool uses it when no Playwright browser is installed. We run this exact step against this site in our own repository's workflow. On other CI systems, install a browser first: <code>npx playwright-core install chromium</code>.</p>
<h2>Check several pages and keep the report</h2>
<pre>- run: |
    npx --yes github:zekemit/fix-list scan \\
      https://staging.example.com/ \\
      https://staging.example.com/products/example \\
      https://staging.example.com/cart \\
      --out fix-plan.md --fail-on serious
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: accessibility-report
    path: fix-plan.md</pre>
<p><code>if: always()</code> keeps the report even when the check fails, so reviewers can read it. Use <code>--format json</code> if another tool will read the results.</p>
<h2>Exit codes</h2>
<table>
  <thead><tr><th scope="col">Code</th><th scope="col">Meaning</th></tr></thead>
  <tbody>
    <tr><td>0</td><td>Nothing at or above <code>--fail-on</code> (default: serious)</td></tr>
    <tr><td>1</td><td>Problems at or above <code>--fail-on</code></td></tr>
    <tr><td>2</td><td>Bad usage, such as a missing or malformed address</td></tr>
    <tr><td>3</td><td>A page or the browser could not be used: a 404, a timeout, no browser, a bot-check page</td></tr>
  </tbody>
</table>
<h2>Limits</h2>
<ul>
  <li>The page must be reachable without logging in. The tool does not sign in and does not get around bot checks. A preview protected by a login will fail with exit code 3 or report the login page.</li>
  <li>It checks the page as loaded, after a short wait (<code>--wait</code>). Content behind clicks or scrolling is not checked.</li>
  <li>Automated testing finds only part of the accessibility problems a site can have. A passing build is not a compliance claim.</li>
</ul>
<p>Full options are in the <a href="${cfg.repoUrl}#command-line-tool">README</a>.</p>
`
    }
  ];
}
