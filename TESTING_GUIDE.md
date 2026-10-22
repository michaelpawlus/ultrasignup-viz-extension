# Verification guide

Run the production-module tests and create the release candidate:

```sh
npm --prefix tests ci
npm --prefix tests test -- --runInBand
node scripts/release.mjs --json
```

Jest runs `core.js`, `scraper.js`, and the actual `content.js` in jsdom. Canvas
rendering is stubbed there; a browser check is still required for layout and
actual Chart.js behavior. Tests cover strict times, aligned bins, ties,
exclusions, delayed rows, filter updates, incomplete results, unsupported events,
restricted results, and external text escaping.

## Installed-Chrome check — required before submission

1. Open `chrome://extensions`, enable Developer mode, and **Load unpacked** the
   repository folder (or the unzipped release candidate).
2. Check that the card reports version 1.0.2 with no extension errors. This
   extension has no popup. Reload the card after any source change, then reload
   the race page.
3. Open https://ultrasignup.com/results_event.aspx?did=125818 (Behind the Rocks
   Ultra 2026, 50K). At the October 21 capture, the public field had 206 finishers.
   Results may change; compare with the current Finishers group count on the site.
4. Select Mary Baughman: the captured field placed her ahead of 203 of 205 other
   finishers, with zero tied. The highlighted bin must contain her 4:45:28 time.
5. Set the site's age filter to 30–39 and division to F. The captured group had
   27 finishers, with Mary ahead of 26 of 26 others. Clear both filters and check
   that the chart returns to the whole loaded field. Select a runner removed by
   a filter and confirm that the selection clears.
6. Change to another distance and another year through the site's links. The
   chart title/group and numbers must match the new page. Sort the results table
   and confirm counts and runner identity stay correct.
7. Check https://ultrasignup.com/results_event.aspx?did=131438. At review time,
   UltraSignup withheld the full results. Expect an unavailable notice rather
   than a chart reconstructed from individual profiles or top performances.
8. Check at least one larger field, one race longer than 24 hours, one small field,
   and one event with DNF/DNS/DQ results. Match finisher counts against the site.
   Never include nonfinish statuses merely because a numeric time is present.
9. Use Tab/arrow keys to select a runner and open **View distribution as a table**.
   The displayed interval counts must sum to the stated finisher count. Check a
   narrower desktop window for clipping and verify the page table still works.
10. In DevTools, check for extension errors. The extension itself must not issue
    fetch/XHR requests or write storage; UltraSignup will still make its usual
    requests. Reload with slow networking to confirm delayed results update.

Do not use a development preview screenshot as proof of installed-extension
behavior or as a substitute for an actual-use Chrome Web Store screenshot.
Record Chrome version, candidate version, public URLs, filters, observed counts,
and any failures before declaring the build ready.

## Developer sandbox

`test.html` is a local chart/math sandbox using bundled Chart.js and `core.js`.
It is excluded from the release ZIP and does not exercise extension installation.
The old API-first and debug-panel workflow has been removed.
