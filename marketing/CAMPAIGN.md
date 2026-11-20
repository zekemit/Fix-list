# 30-day launch campaign (budget $0)

Goal: find out whether people want this before anyone is asked to pay. Gates from `docs/PROOF_PLAN.md`: 300 visits to `/check`, 25 GitHub stars or forks, 10 pieces of real feedback, 5 people who say they would pay for the fix plan. Everything below is free. Every post needs a person's account; Claude cannot post anywhere.

## 1. Overview
- **Name:** Hear your store.
- **One line:** Show store owners, and the developers who help them, what their store sounds like to a screen reader, then give them the fix.
- **Primary objective:** all four proof gates within 30 days of the first post.
- **Secondary:** first search impressions for the guides; 3 developers who use the command line or extension and say so.

## 2. Audience
- **Primary:** owners and operators of small online stores (mostly Shopify) who have heard about accessibility lawsuits or "ADA compliance" and do not know what to check. Stage: awareness to consideration. They find answers in r/shopify, the Shopify Community forum, Google searches such as "is my Shopify store ADA compliant", and by asking the developer or agency who built their theme.
- **Secondary (amplifiers):** theme developers, freelancers and agencies, and accessibility practitioners. They try the command line and extension, star the repo, and tell store owners. They are on GitHub, Hacker News, dev.to, and the accessibility community's newsletters and Slack.
- **Pain:** a vague legal worry, a market full of "one-click compliance" widgets, and no plain-language way to see what is actually wrong.

## 3. Messages
- **Core:** Hear your store the way a screen reader does.
- **Supporting:**
  1. *Plain language, with the fix.* Each problem explained for a store owner, with the Shopify steps or Liquid code. Proof: the checklist and guides cite Shopify's own theme requirements.
  2. *Private by design.* Runs on your computer and sends nothing anywhere. Proof: a test fails the build if anything contacts another origin; the extension asks for two permissions only.
  3. *Honest.* It never says "compliant". Proof: a test fails the build if any page promises compliance; the site links the 2025 FTC order against a one-click-compliance widget vendor.
  4. *Works where the bookmark can't.* The command line and extension run on sites with a strict Content-Security-Policy.
- **Variations:** developers get message 4 and the CI guide first; store owners get messages 1 and 3 and the checklist.

## 4. Channels
| Channel | Why | Format | Effort |
|---|---|---|---|
| Show HN | Developers who star, try and give blunt feedback | Text in `LAUNCH.md` | Low to post, high to answer all day |
| dev.to | Searchable, friendly to first posts, 13+ | `DEVTO.md` | Low |
| Guides on the site | Long-term search traffic; these answer the questions store owners type | 9 guides live | Done; add one a week |
| Reddit r/shopify, Shopify Community | Where the owners ask. Read each community's promotion rules first | Help-first answers | Medium, daily |
| r/webdev, r/accessibility, r/SideProject | Developers and practitioners | One honest post each, rules permitting | Low |
| awesome-a11y list (pull request) | Curated list; refuses overlay tools, which suits us | One table row | Low |
| Directories: AlternativeTo, SaaSHub, BetaList, Product Hunt | Slow steady referral traffic, a backlink each | Copy in `DISTRIBUTION.md` | Low |
| Direct messages to 5 real people | Fastest honest feedback | Template in `DISTRIBUTION.md` | Low |
| Indie Hackers | Builders; the proof plan is the story | Post in `DISTRIBUTION.md` | Low |

Not used: paid ads, cold email or bulk messaging, fake reviews or testimonials, naming any business with its scan results.

## 5. Calendar
| When | What | Channel | Who |
|---|---|---|---|
| Day 0 (now) | Enable Vercel Web Analytics (dashboard, project, Analytics, Enable), then tell Claude to switch it on in the site. Submit `sitemap.xml` and request indexing for the home page in Search Console. Add repo topics. | Setup | Zeke/Andrew, 10 minutes |
| Day 1 | Show HN. Stay online, answer every comment. | HN | Zeke or Andrew |
| Day 2 | dev.to article from `DEVTO.md` | dev.to | Zeke |
| Day 3 | Pull request adding Fixlist to awesome-a11y; submit AlternativeTo and SaaSHub | GitHub, directories | Zeke |
| Day 4 | Direct messages to 5 store owners or theme developers; ask three honest questions | DM | Zeke |
| Days 4 to 30 | 15 minutes a day: answer one real question on r/shopify or the Shopify Community with a full answer first | Communities | Zeke |
| Day 7 | Post in r/webdev and r/accessibility if their rules allow; first weekly update with real numbers, zeros included | Reddit, Indie Hackers | Zeke |
| Day 10 | New guide chosen from the questions people actually asked | Site | Claude |
| Day 14 | Read the numbers against the gates. If traffic is under 100 visits, change the message, not the product | All | All |
| Day 21 | BetaList; second weekly update | Directories, IH | Zeke |
| Day 28 | Decide: Phase B (payment) only if the gates passed; otherwise write down what you learned and change the audience or offer | All | Andrew and Zeke |
Keep a fifth of each week free for replies.

## 6. Content pieces
| Asset | Status |
|---|---|
| 9 guides, checklist, CI guide, FTC guide | Done |
| Share image 1200x630 and structured data | Done |
| README with screenshots; panel, terminal and home images in `marketing/assets/` | Done |
| Show HN text | Done (`LAUNCH.md`) |
| dev.to article | Done (`DEVTO.md`), needs publishing |
| Directory copy, replies, DM template, Product Hunt copy, awesome-a11y row | Done (`DISTRIBUTION.md`) |
| X thread and LinkedIn drafts for review | Typefully drafts, not published |
| A short screen recording of the panel | Not done; needs a person with a screen recorder |
| One real customer quote | Only with the customer's permission, once there is one |

## 7. Measures
- **Primary:** visits to `/check`. Source: Vercel Web Analytics (cookieless; must be enabled in the dashboard first; the privacy page already allows page-view counts).
- **Secondary:** GitHub stars and forks, plus the repo's Insights, Traffic tab (owner only); feedback count and "would pay" count from the tracker below; Search Console impressions and clicks for the guides; referrers in Web Analytics (which channel works).
- **Tracker:** a simple sheet with columns: date, channel, who (first name or handle), what they said, would pay (yes, no, unsure), follow-up. Count only unprompted "I would pay".
- **Cadence:** a weekly note with the numbers, including bad ones.

## 8. Budget
$0. The cost is about 15 to 30 minutes a day of Zeke's or Andrew's time. Do not buy stars, upvotes or followers.

## 9. Risks
- **A launch post gets little attention.** Most do. Mitigation: it is one channel of several; the guides and communities compound; judge at day 14, not day 1.
- **A community removes a post as self-promotion.** Mitigation: read the rules first, lead with help, post once, accept the answer.
- **A claim is wrong or overstated.** Mitigation: the tests block compliance promises; correct publicly and fast if someone finds an error.
- **Legal and account rules.** The operator is a minor: an adult owns Stripe, Vercel and any paid account, and sends nothing commercial by email. Mitigation: keep to the plan above.

## 10. Next steps
1. Enable Web Analytics and submit the sitemap (10 minutes).
2. Add the repo topics.
3. Post Show HN, then dev.to.
4. Review the Typefully drafts before anything goes out.
