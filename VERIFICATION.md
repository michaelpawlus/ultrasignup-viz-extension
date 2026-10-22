# Release candidate verification — October 21, 2026

Candidate: manifest version 1.0.2. The 1.0.1 planned hands-on acceptance checks were
confirmed by the user on October 22, 2026. Version 1.0.2 changes only selector
height/line-height styling to fix clipped text visible in the user's actual-use
screenshot. The user's replacement screenshot at 4:07 PM on October 22 shows the
runner selector fully readable, with the expected Matt Campbell comparison and
highlight intact. The CSS fix is visually verified on the installed copy.
The user confirms the dashboard package is version 1.0.2 and the prepared
actual-use screenshot is uploaded.
The user reports the ZIP uploaded to the Developer Dashboard. The listing is
in preparation; not submitted for review or published.

## Installed-extension checks — user reported, October 22, 2026

The user reported loading the extension in developer mode and seeing the chart
on the real UltraSignup results page for event 125818. After being asked to select
Mary Baughman and filter to age 30–39 / division F, the user confirmed the expected
behavior and numbers: highlighted 4:45:28 finish, 27 finishers, ahead of 26 of 26
other finishers. These checks were reported by the user, not independently
observed through Chrome automation. Chrome version was not recorded.

The user also confirmed that clearing filters and switching to the 50 Miler
updates the chart to that distance, and that event 131438 displays the expected
unavailable-results notice instead of a chart.

The user confirmed that “View distribution as a table” works as expected.
In Chrome's Extensions view, the user reported that “Collect Errors” was on
and no errors were logged. This records the user's observation of the current
session; it is not a claim that every page or future interaction is error-free.

On event 122877 (Javelina Jundred 2025, 100 Miler), the user confirmed the
unfiltered chart showed 492 finishers and 284 other results excluded. Selecting
Matt Campbell highlighted 27:18:20 and showed him ahead of 161 of 491 other
finishers, with no ties. This covers a larger field, times beyond 24 hours, and
nonfinish exclusions in the installed extension. The public response checked
for this event contained 492 finishers, 283 DNF results, and one unofficial
result; 274 finishers had elapsed times beyond 24 hours.

The user confirmed that switching to a previous year updates the chart, and that
Tab and arrow keys work for runner selection. The planned hands-on acceptance
sequence is complete. These are user-reported results on the installed copy;
Chrome version was not recorded. The user subsequently supplied actual-use
screenshots, including one confirming the selector-height fix in 1.0.2.

## Development verification

Completed:

- 45 Jest tests passed across four suites, exercising shared production parsing,
  calculations, and content-script lifecycle behavior.
- All packaged JavaScript passed Node syntax validation; `git diff --check` passed.
- The allowlisted ZIP built successfully with 12 files and a root-level manifest.
- Icon PNG dimensions verified: 16×16, 48×48, and 128×128.
- Bundled Chart.js v4.4.0 MIT license verified against its versioned upstream file.
- UltraSignup's current desktop grid script inspected: results load locally with
  all records rendered; age/division filters rebuild the grid.
- Real live desktop grid checked in the in-app browser on event 125818:
  206 rendered result rows and “Finishers - 206”; filtering age 30–39 and F
  produced 27 rows and “Finishers - 27”.
- Production scraper applied offline to the captured 27-row rendered grid:
  27 finishers, matching group count, no incomplete-table condition, Mary
  Baughman ahead of 26 of 26 other finishers with no ties. Captured HTML's checked
  attributes do not preserve changed input properties; live browser controls
  supplied the filter-state evidence above.
- Local browser preview used the actual bundled production scripts and a captured
  public response. It showed 206 finishers, median 7:39, and Mary ahead of 203
  of 205 others. Combined age 30–39 / F filtering settled at 27 finishers,
  median 7:38, Mary ahead of 26 of 26 others. Runner highlight visually checked.
- Exact accessible label lookup for the runner selector succeeded after separating
  the label from the select. A text distribution table is also available.
- A stale or mismatched filtered table now withholds its chart until the rendered
  rows agree with the selected filters. Missing/unparseable group counts also
  withhold comparisons.

Remaining before submission:

- No further feature development is planned for this candidate. DNS/DQ exclusion
  uses the production status allowlist; a DQ regression case is covered by tests.
  DNS and DQ were not present in the live Javelina response. This limits live
  coverage but does not leave the planned hands-on sequence pending.
- Native Chrome automation could not proceed because computer-use permission
  was not granted. The preview is not evidence of installed extension behavior.
- The user confirms the actual-use screenshot is uploaded. Publish this release
  branch and verify the updated privacy-policy URL on main. A 440×280 promotional image is
  optional under the current Google image guidance, not a submission blocker.
- The user reports registration payment complete, a developer email set up, and
  access to the Developer Dashboard, with non-trader status selected. Complete
  any remaining dashboard account checks and item declarations, then submit
  after the listing assets and public URLs are ready. See PUBLISHING.md.

The user uploaded the ZIP and authorized branching, committing, pushing, and
merging the release changes to update GitHub. Chrome Web Store review submission
and publication are separate steps and have not been performed by the agent.
