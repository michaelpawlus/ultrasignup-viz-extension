# Privacy policy — UltraSignup Race Visualizer

Last updated: October 21, 2026. Applies to versions 1.0.1 and 1.0.2.

## What the extension reads

When you open an UltraSignup desktop race-results page, the extension reads the
results already rendered on that page: runner names, finish times, places, ages,
and divisions, plus the selected distance and age/division filters. These may
include information about the browser user if they participated in the race.

It uses that information only to draw a finish-time histogram and compare a
runner you select with the finishers in the loaded group. DNF, DNS, DQ,
unofficial results, and invalid or zero finish times are excluded.

## Processing, storage, and sharing

All extension processing happens locally in the browser. The extension makes
no network requests, does not access authentication cookies, and does not send
race data, runner selections, or browsing activity to the developer or any third
party. UltraSignup continues to load its own page and results as usual.

The extension keeps the current chart and runner selection in page memory. It
does not persist them in browser storage. Reloading or closing the page clears
the selection. There are no accounts, analytics, advertising, tracking, or
remote model services. Chart.js is bundled with the extension.

The extension's use of information complies with the Chrome Web Store User Data
Policy, including its Limited Use requirements. Information is used solely for
the visible race-results visualization and comparison feature.

## Page access

The extension activates only on `https://ultrasignup.com/results_event.aspx`
pages. It requests no additional Chrome API permissions, broad host permission,
or storage permission. Its declared content script can read and augment the
matched results page so it can display the chart.

## Voluntary feedback

The feedback link opens GitHub Issues. Opening the link does not automatically
attach a race URL, runner information, or diagnostics. Information you choose to
submit is handled by GitHub under its policies and may be public. Include only
information you want to share. Feedback requires a GitHub account.

## Contact and updates

Questions or requests: https://github.com/michaelpawlus/ultrasignup-viz-extension/issues

Source and policy updates: https://github.com/michaelpawlus/ultrasignup-viz-extension

This is an independent community extension, not affiliated with or endorsed by
UltraSignup. Policy changes will be published here with an updated date.
