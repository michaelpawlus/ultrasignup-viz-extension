# Release review — October 21, 2026

This is the original pre-development audit. The proposed work was subsequently
approved and implemented as candidate 1.0.1. See VERIFICATION.md for current
evidence and remaining release checks; the findings below describe the old build.

## Recommendation

Do not submit the current build yet. Keep the first release focused on one question:
“Where does this runner's finish time sit in this race's field?”

Keep the histogram. Add runner selection, a highlighted finish-time bin, field size,
median finish time, and a clearly defined comparison such as “finished ahead of
X of N other finishers.” Handle ties explicitly. Use the currently selected race
distance and visibly identify any age/division subset. Exclude DNF/DNS from the
finish-time denominator and explain that choice.

Synchronize with UltraSignup's existing age and division controls rather than
introducing competing filters. Defer location filters, additional chart types,
cross-race comparisons, accounts, analytics, and model-powered features.

## Evidence and release blockers

1. **Unreliable data loading.** On public event 125818, the first and third URLs
   in `fetchRaceResults` returned HTTP 404; the second returned HTTP 200 with an
   HTML “Invalid Request” page, not JSON. These probes do not prove the endpoints
   fail for every event, but they do establish that the API-first path is not a
   dependable basis for release. Prefer the results already loaded by the site;
   validate completeness and do not bypass restricted results.
2. **One-shot scraping.** `main` runs once at DOM ready and has no table-load or
   filter-change observer. A delayed table can produce a false error; changing
   age/division can leave the chart showing a different population. Confirm
   pagination behavior before representing scraped rows as the whole field.
3. **Distance identity is fragile.** `getActiveDistance` assumes Bootstrap active
   tabs. The inspected live page uses distance links with distinct `did` values.
   The jqGrid scraper invents “100 Mile” when detection fails, while
   `filterByDistance` returns every result if nothing matches. Resolve event
   identity from the current results page and never silently mix distances.
4. **Invalid times enter the chart.** Both production and copied test code accept
   `12:60:00`, `12:00:60`, negative hours, and trailing text. Strictly validate
   times while supporting races longer than 24 hours.
5. **Histogram boundaries are misleading.** Bins begin at the first finisher's
   exact second, but labels hide seconds. For example, 16:50:30 through 17:20:29
   appears as “16:50–17:20.” Align bins to meaningful clock boundaries and make
   the interval convention explicit. Bound bin count for very long events.
6. **Chart insertion is too broad.** The first matching `table` can be a jqGrid
   header table. Insert outside the grid wrapper so the chart does not interfere
   with its layout. Check keyboard access and provide a text equivalent to canvas.
7. **Unsafe debug rendering.** Debug output interpolates fetched/page-derived
   values into `innerHTML`, including unescaped JSON. Render external values with
   `textContent`, or remove the debug panel from the shipped runtime.
8. **Permissions and disclosures do not match implementation.** `storage` is
   declared but debug preferences use the site's `localStorage`. Reassess the
   broad host permission after choosing the data path. The privacy policy says
   no data leaves the device although runtime code makes cookie-bearing requests
   to UltraSignup. Explain local processing of public runner names, ages,
   divisions, locations, and times accurately; distinguish that from collection
   by the developer. Google requires disclosure even for local processing.
9. **Tests miss the shipped path.** Jest imports `test-lib.js`, while `content.js`
   maintains its own functions. `scraper.js` is another implementation not loaded
   by the manifest. Share production logic with tests and cover delayed loading,
   filter updates, missing/restricted results, DNF/DNS, ties, and field counts.
10. **Documentation and packaging need a pass.** README installation instructions
    omit required runtime files, claim mobile browser support without evidence,
    imply a toolbar action absent from the manifest, and contradict the MIT
    license. The sample event no longer exposes full results. Preserve Chart.js
    license notices and create a ZIP from an explicit runtime-file allowlist.

## Verification completed

- Read manifest, production scripts, styles, documentation, fixtures, and tests.
- Installed existing test dependencies and ran `npm test -- --runInBand` in
  `tests`: **32 passed, 1 failed** (invalid time format validation).
- Reproduced malformed-time acceptance, wrong-distance fallback, and unaligned
  histogram labels with direct Node calls.
- Inspected live event 131438 in a browser: full results are withheld because
  registration was hosted elsewhere; existing age and M/F/X division controls
  and separate distance links are present.
- Inspected public event 125818's mobile results page: runner results and existing
  age/division controls are present. The current manifest does not match the
  `m_results_event.aspx` URL.
- Probed the three configured API URLs for event 125818 as described above.

Not yet verified: an installed unpacked extension in Chrome, visual layout of
the injected chart on live pages, full-field completeness across table sizes,
and end-to-end behavior after fixes. This review is not a release certification.
No implementation changes were made during the review.

## Proposed development plan — awaiting approval

1. Establish one tested production data/parsing module; use a bounded observer
   for delayed results and site filter updates. Define supported page formats,
   confirm full-field coverage, and add useful unavailable/unsupported states.
2. Retain one histogram; align bins, add accessible summaries, runner selection
   and highlight, explicit comparison counts, and clear population labels.
3. Minimize permissions, remove or harden debug UI, correct privacy/docs, add
   feedback links and issue templates, and build a reproducible release ZIP.
4. Verify the installed extension against several live events: multiple
   distances, small/large fields, long durations, filters, restricted/no results,
   and DNF/DNS. Reconcile chart counts with the site. Fix regressions before
   preparing store screenshots and a submission candidate.

Get a few runners to try the candidate before a broad announcement. Provide a
visible “Report a problem / Suggest a feature” link to GitHub Issues, asking for
the race URL, expected result, actual result, and extension version. Never
upload race data or debug reports automatically. Use feedback to choose v1.1.

## Publishing sequence after verification

1. Register a Chrome Web Store developer account using an email you will retain;
   enable two-step verification and complete the dashboard's account checks.
   Google requires a one-time fee. Its official registration guidance does not
   currently specify the amount; older Google material says US$5. Confirm the
   current amount at checkout. The user completes payment and agreement steps.
2. Prepare a release ZIP with `manifest.json` at its root and only required files.
3. Prepare an accurate listing, a 128px icon, at least one actual-use screenshot
   (1280×800 or 640×400), and a required 440×280 promotional image. Use an
   independent/community-tool description without implying UltraSignup endorsement.
4. Publish an accessible privacy-policy URL and support URL. Complete the single
   purpose, data handling, permissions, distribution, and test instructions in
   the dashboard to match the final code. Supply a public working test race.
5. Upload via “Add new item,” review the listing, and submit for review. Deferred
   publication allows a final launch check after approval. Approval is Google's
   decision; do not promise a review date.
6. Share the listing with runners, watch support reports, and release fixes with
   an incremented manifest version and a short changelog.

References checked October 21, 2026:

- [Developer registration](https://developer.chrome.com/docs/webstore/register)
- [Google's historical fee notice](https://storage.googleapis.com/support-kms-prod/pOoBimb6uEK6GBt3SJxVBoJf0tPzgI89q3yR)
- [Publishing workflow](https://developer.chrome.com/docs/webstore/publish)
- [Store images](https://developer.chrome.com/docs/webstore/images)
- [Data handling and minimum permissions](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq)
- [UltraSignup terms entry point](https://ultrasignup.com/terms.aspx)

The full UltraSignup terms linked from that entry point could not be retrieved
in this review. No conclusion about API permission or endorsement was established.
