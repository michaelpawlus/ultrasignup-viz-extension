# Implementation summary

The previous API-first/debug-panel implementation was replaced in the 1.0.1
release candidate. Current architecture:

- `core.js`: strict elapsed-time parsing, aligned/bounded histogram bins, median,
  and runner comparison calculations.
- `scraper.js`: reads the desktop jqGrid DOM, excludes nonfinish statuses,
  identifies site filters and event formats, and reconciles group counts.
- `content.js`: updates a scoped, accessible chart above the grid when results
  or site filters change. No network requests or persistent storage.
- `chart.min.js`: bundled Chart.js v4.4.0, licensed in THIRD_PARTY_NOTICES.md.
- `scripts/release.mjs`: validates and packages an explicit runtime allowlist.
- `tests/`: tests shared production modules and page updates in jsdom.

See RELEASE_REVIEW.md for the original audit, TESTING_GUIDE.md for acceptance,
and PUBLISHING.md for the account/listing/submission walkthrough.
