# Fulfilling a fix-plan order

Target: deliver within 3 business days. A human (the account owner) approves every plan before it is sent. AI-written text is checked against the scan output; the scan is the source of truth.

1. **Confirm the order** in the payment dashboard. Note the store URL and the pages the customer named. If missing, ask by reply.
2. **Scan each page** (home, collection, product, cart, search, any form page the customer named):
   ```bash
   node fulfillment/scan.cjs https://store.example/ out/home
   ```
   If the site blocks automated access (a bot challenge or "access denied"), do not try to get around it. Ask the customer to run the free check and use "Copy results" to send the JSON, or to add us to their allow-list.
3. **Build the plan** per page, then merge or send one per page type:
   ```bash
   node fulfillment/plan.mjs out/home/<file>.json out/home-plan.md --store "Store name"
   ```
4. **Review** the output. Remove any item you cannot reproduce. Add notes the rules table cannot know (for example the theme name). Never add a claim of compliance.
5. **Add** the accessibility statement draft (`/guides/accessibility-statement-template` on the site).
6. **Deliver** by email as a PDF or Markdown file. The email is transactional: it delivers what they ordered. Include how to request the free re-check within 14 days.
7. **Record** the order, delivery date and any feedback. Ask for a short quote you may publish only if the customer agrees.
8. **Delete** scan data within 90 days after delivery unless the customer asked to keep it.

## Refunds
Refund in full if undelivered after 5 business days, or if the customer is unsatisfied with the first delivery.

## Do not
- Promise compliance, legal protection or rankings.
- Scan sites that have not been named by the customer, for paid work.
- Keep customer data longer than stated on the privacy page.
