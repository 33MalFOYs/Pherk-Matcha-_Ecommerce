# Pherk Matcha — Online Menu

The authored website is in `dist/`. It is a static HTML, CSS, and JavaScript menu; no framework build or dependency install is needed to run it. The unused starter folders are retained but are not deployed.

## Run and check

- `node scripts/preview-static.mjs` serves the menu at http://127.0.0.1:4173.
- Add a port argument if needed: `node scripts/preview-static.mjs 4185`.
- `npm run build` checks the menu JavaScript syntax.
- `node scripts/export-menu.mjs` creates a single-file copy with embedded illustrations and styles in `outputs/Pherk-Matcha-Menu.html`.

## Customer flow

15 drinks: 8 matcha and 7 refreshers. Customers can search/filter, customize sweetness and ice, add notes and quantities, and manage a bag saved in their browser. Prices use integer cents to keep totals exact.

Pickup prepares an order addressed to the existing shop Telegram account configured in `SHOP.telegram` in `dist/app.js`. The customer must tap Send in Telegram and wait for the shop's confirmation. The site does not process payments or claim an order was accepted.

Grab delivery opens the shop link supplied by the owner, configured in `SHOP.grabUrl`. Customers choose their drinks and complete delivery orders in Grab; the local pickup bag is not transferred. Grab shows its own prices, availability, and delivery fees.

## Deploy on Vercel

1. Import `33MalFOYs/Pherk-Matcha-_Ecommerce` into Vercel.
2. Keep the Root Directory at the repository root (`.`).
3. Deploy. The included `vercel.json` selects the Other framework, skips dependency installation, checks `dist/app.js`, and publishes `dist/`.

Only the static menu is served. The retained starter files do not need to be built. Future pushes to the connected production branch can deploy through Vercel's Git integration.

Vercel's Hobby plan is limited to personal, noncommercial projects. Use a plan that permits commercial use for the live shop menu.

## Sites publication

The existing Site identity and static output directory are in `.openai/hosting.json`. Keep that identity. Publish the tracked `dist/` content with the Sites workflow. Do not use the unused Vinext starter to build this static menu.

The Sites project and Vercel are separate deployment targets. Pushing this repository to GitHub does not itself publish the Sites project.
