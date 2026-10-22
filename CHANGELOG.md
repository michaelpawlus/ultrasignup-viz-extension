# Changelog

## 1.0.2 — release candidate, October 22, 2026

- Override the site's fixed select height so runner names and times are not
  clipped by the selector's padding. No data or calculation changes.
- Retain the functional acceptance evidence for 1.0.1; visually recheck the
  selector in the installed extension before taking store screenshots.

## 1.0.1 — release candidate, October 21, 2026

- Read the results already loaded by UltraSignup; remove extra API requests.
- Update the chart after delayed loading and age/division filter changes.
- Select a runner to highlight their interval and show ahead/tied comparisons.
- Add median time, finisher counts, and an accessible distribution table.
- Validate elapsed times and align histogram intervals.
- Withhold charts for incomplete, restricted, and unsupported results.
- Remove debug UI and unused storage/host permissions.
- Share production code with tests and add an allowlisted release builder.
- Add feedback templates and update privacy, testing, and publishing guidance.

Not yet published. Planned installed-Chrome acceptance checks were confirmed
by the user on October 22, 2026. Store assets and publisher setup remain.
