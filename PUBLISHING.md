# Chrome Web Store publishing walkthrough

## Current status

Version 1.0.2 is the current local release candidate, with a selector-height fix.
The user confirmed the planned
installed-Chrome acceptance checks on October 22, 2026; see VERIFICATION.md.
The user reports paying the registration fee, setting up a developer email, and
reaching the Developer Dashboard. The user selected non-trader status for this
personal community project. Store assets, public URLs, and item declarations
remain. The user confirms the dashboard package is version 1.0.2 and the
prepared actual-use screenshot is uploaded.
The store listing is in preparation; it has not been submitted for review.

The first release supports individual fixed-distance events on UltraSignup's
desktop results page. Location filters, additional chart types, mobile pages,
team races, and timed/distance-scored events are outside this release.

## 1. Register your developer account

Open https://chrome.google.com/webstore/devconsole and choose a Google account
whose email you intend to retain. Google says the developer-account email
cannot later be changed directly. Enable two-step verification and complete
any account verification shown by the dashboard.

Agree to the developer terms and pay Google's one-time registration fee.
Historical Google documentation states US$5; the current registration guide
confirms a fee without naming the amount. Confirm the amount in the dashboard.
Payment and agreement acceptance are steps for the account owner to complete.

## 2. Prepare the exact candidate

Run the checks, complete installed-Chrome acceptance, then build:

```sh
npm --prefix tests test -- --runInBand
node scripts/release.mjs --json
```

Replace the dashboard draft package with `dist/ultrasignup-race-visualizer-1.0.2.zip`
after visually rechecking the selector in Chrome. The ZIP contains only the
manifest, runtime scripts/styles, icons, and licenses/privacy notice. Do not
upload the repository ZIP with tests, local captured data, or node_modules.

## 3. Prepare the listing

Suggested name: **UltraSignup Race Visualizer**.

Suggested short description:

> See how a runner's finish time compares with the field on UltraSignup, with a histogram that follows age and division filters.

Suggested detailed description:

> Understand your finish in context. UltraSignup Race Visualizer adds a finish-time
> histogram to supported desktop UltraSignup results pages. Select a runner to
> highlight their interval, see the number of finishers and median time, and
> compare their time with others in the selected group. The visualization follows
> UltraSignup's age and division filters and includes an accessible table of counts.
>
> Results are processed locally. There are no accounts, analytics, or additional
> network requests from the extension. It supports individual fixed-distance
> races with publicly available results. DNF, DNS, DQ, unofficial results, and
> invalid times are excluded. Restricted and unsupported events display a notice.
>
> This is an independent community tool, not affiliated with or endorsed by
> UltraSignup. Report bugs and suggest improvements through the support link.

Choose the most accurate available category in the dashboard, rather than
claiming broader fitness tracking features. Supply support and homepage URLs
that are publicly accessible before submitting:

- Homepage: https://github.com/michaelpawlus/ultrasignup-viz-extension
- Support: https://github.com/michaelpawlus/ultrasignup-viz-extension/issues
- Privacy: a public rendered page for PRIVACY_POLICY.md, for example the file's
  GitHub page on the repository's published default branch. Verify that the final
  version is accessible while signed out; a local file is not a policy URL.

Prepare a 128×128 icon and at least one actual-use screenshot at 1280×800 or
640×400. A 440×280 small promotional image is optional under Google's current
image requirements checked October 22, 2026. The icons already exist; confirm their
appearance and dimensions. Store screenshots must show the extension working on
a real supported page. Do not submit the localhost development preview as one.

The first actual-use screenshot is ready at
`store-assets/screenshot-runner-comparison.png` (1280×800). It is a plain crop
and resize of the user's installed-extension capture; see store-assets/README.md.
Upload it separately in Store Listing, not as part of the extension ZIP.

Use this privacy-policy URL after the release branch is merged into main:
https://github.com/michaelpawlus/ultrasignup-viz-extension/blob/main/PRIVACY_POLICY.md
Before submission, open it while signed out and confirm it describes local page
processing and applies to version 1.0.2. Including the policy in the ZIP alone
does not update its public GitHub page.

## 4. Upload and complete declarations

In the dashboard choose **Add new item**, then upload the ZIP. Complete:

- Store Listing: description, category, language, support/privacy links, assets.
- Privacy: single purpose, permissions, and data handling. Suggested purpose:
  “Visualize publicly displayed UltraSignup finish times and compare a selected
  runner with the finishers in the current race-results group.”
- Explain that the content script reads names, ages, divisions, places and finish
  times locally; no data is sent to the developer, stored persistently, sold, or
  used for analytics. Do not equate local processing with handling no data.
  Answer the dashboard's exact questions according to the final privacy policy.
- Remote code: all executable code, including Chart.js, is bundled locally.
- Distribution: free, with your chosen countries/visibility.
- Test instructions: no login needed; provide the public 50K URL and runner/filter
  steps from TESTING_GUIDE.md. Mention the desktop-only and restricted-event scope.

## 5. Review and publish

Check every field and preview the listing, then **Submit for Review**. Choose
manual/deferred publishing if you want a final launch check after approval.
Review duration and approval are controlled by Google. Google currently gives
30 days to publish a staged approved submission before it returns to draft.

After publication, share the listing with a few runners first. Ask whether they
could find themselves, understand the comparison, and use age/division filters.
Watch GitHub Issues and store reviews. Record fixes in CHANGELOG.md, increment
the manifest version, rebuild, test the candidate, and submit the update.

## Official references checked October 21, 2026

- Registration: https://developer.chrome.com/docs/webstore/register
- Two-step verification: https://developer.chrome.com/docs/webstore/program-policies/two-step-verification
- Upload and publish: https://developer.chrome.com/docs/webstore/publish
- Images: https://developer.chrome.com/docs/webstore/images
- Local data disclosure and permissions: https://developer.chrome.com/docs/webstore/program-policies/user-data-faq
