# UltraSignup Race Visualizer

See where a runner's finish time sits in the field, directly on an UltraSignup
results page. An independent community project, not affiliated with UltraSignup.

## First-release features

- One finish-time histogram with aligned intervals.
- Select a runner to highlight their interval and see how many other finishers
  they finished ahead of, with ties counted separately.
- Finisher count and median elapsed time.
- Follows UltraSignup's existing age and division filters.
- Keyboard-accessible runner selector and a text table of distribution counts.
- Local processing, no extra network requests, accounts, storage, or analytics.
- A feedback link for bugs and feature requests.

The chart covers the loaded group in the current distance. It excludes DNF,
DNS, DQ, unofficial results, and invalid/zero finish times. A comparison is
withheld when displayed group counts do not match the loaded table.

## Install the release candidate in desktop Chrome

1. Download/clone this repository, or unzip the release package into a folder.
2. Open `chrome://extensions` in Chrome and enable **Developer mode**.
3. Choose **Load unpacked**, then select the folder containing `manifest.json`.
4. Open a public results page, for example:
   https://ultrasignup.com/results_event.aspx?did=125818
5. Find **Your finish, in context** above the results grid. Select a runner.
6. Try UltraSignup's age and division filters; the chart should update.

After editing files, click **Reload** on the extension card and reload the race
page. The extension runs automatically; there is no toolbar popup.

## Supported scope and limitations

Version 1.0.2 targets desktop Chrome and individual, fixed-distance results on
`https://ultrasignup.com/results_event.aspx`. It does not run on the mobile
`m_results_event.aspx` page. Fixed-time/distance-scored events and team formats
are not supported. Restricted, empty, or incomplete results display an explanatory
state rather than an estimated field. Other browsers are not yet verified.

Results belong to the current page and its selected group, not every participant
in an event weekend. If UltraSignup changes its page structure, the extension may
need an update. Please report missing charts or incorrect counts with a race URL.

## Feedback

[Report a bug or suggest a feature](https://github.com/michaelpawlus/ultrasignup-viz-extension/issues/new/choose).
Include the extension version, race URL, filters, expected behavior, and what
happened. Screenshots are optional; share only information you want public.
GitHub feedback requires an account. There is no automatic diagnostics upload.

Location filters and additional chart types are deferred until user feedback
shows what would help most.

## Development

```sh
npm --prefix tests ci
npm --prefix tests test -- --runInBand
node scripts/capabilities.mjs --json
node scripts/release.mjs --json
```

Node.js and the system `zip` command are needed to package a release. The release
script validates files and creates an allowlisted ZIP in `dist/`; it does not
publish. `manifest.json` is at the ZIP root. Load this same candidate in Chrome
before uploading. See [TESTING_GUIDE.md](TESTING_GUIDE.md) and
[PUBLISHING.md](PUBLISHING.md) for the remaining checks and store steps.

`core.js`, `scraper.js`, and `content.js` are the production source exercised by
the tests. `test-lib.js` is a compatibility entry point for old Node tests;
`test.html` is a developer sandbox, not a release artifact.

## Privacy and license

See [PRIVACY_POLICY.md](PRIVACY_POLICY.md). This extension reads public page
content locally to provide its visible feature; it does not send that content
to the developer.

MIT licensed. Bundled Chart.js notices are in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
