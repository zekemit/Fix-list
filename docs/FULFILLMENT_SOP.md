# Fulfilling a fix-plan order

Target: deliver within 3 business days. A human (the account owner) approves every plan before it is sent. AI-written text is checked against the scan output; the scan is the source of truth.

1. **Confirm the order** in the payment dashboard. Note the store URL and the pages the customer named. If missing, ask by reply.
2. **Scan the pages** (home, collection, product, cart, search, any form page the customer named) and build the plan in one command:
   ```bash
   node bin/fixlist.mjs scan https://store.example/ https://store.example/collections/all https://store.example/products/example \
     --out out/store-plan.md --store "Store name" --order --fail-on none
   ```
   If the tool reports a bot challenge or "access denied", do not try to get around it. Ask the customer to run the free check and use "Copy results" to send the JSON, or to add us to their allow-list.
3. **Spot-check** the output against the live pages before editing: open two or three of the listed selectors and confirm they exist. Add `--format json` if you need the raw results.
4. **Review** the output. Remove any item you cannot reproduce. Add notes the rules table cannot know (for example the theme name). Never add a claim of compliance.
5. **Write** a draft accessibility statement by hand for this store, starting from the template at `/guides/accessibility-statement-template` (it is not generated automatically; fill in the store name, known issues from the scan and the contact route).
6. **Deliver** by email as a PDF or Markdown file. The email is transactional: it delivers what they ordered. Include how to request the free re-check within 14 days.
7. **Record** the order, delivery date and any feedback. Ask for a short quote you may publish only if the customer agrees.
8. **Delete** scan data within 90 days after delivery unless the customer asked to keep it.

## Refunds
Refund in full if undelivered after 5 business days, or if the customer is unsatisfied with the first delivery.

## Do not
- Promise compliance, legal protection or rankings.
- Scan sites that have not been named by the customer, for paid work.
- Keep customer data longer than stated on the privacy page.
