# Quickstart: Storefront Shell and Browse

```bash
npm test                         # tests/browse.test.mjs
npm run test:e2e                 # journeys, contrast, page goldens
npm run golden:capture:pages     # only when the brief allows page golden changes
```

Manual: open `/`, type "lamp", choose "Desk essentials", toggle "In stock only", change sort; quick-add the lamp twice and see "Bag (2)"; resize to 375 px and open "Menu"; visit `/no-such-page`; switch the OS theme and compare.
