# UltraSignup Race Visualizer

Browser extension: deterministic, local DOM parsing and visualization only.
No model APIs, keys, remote scripts, extra network requests, or persistent runner
storage. Keep the first release focused on individual fixed-distance desktop
results and use the site's age/division controls.

Agent-callable commands (none require a TTY):

- `npm --prefix tests ci` — install locked development dependencies.
- `npm --prefix tests test -- --runInBand` — run tests against production modules.
- `node scripts/capabilities.mjs --json` — discover commands.
- `node scripts/release.mjs --json` — validate and build an allowlisted ZIP.

Keep docs and privacy disclosures aligned with actual runtime behavior. Never
claim installed-Chrome verification based only on fixtures or jsdom. Preserve
third-party licenses. Propose a plan before substantial new scope. Do not publish
or submit a store listing without the user's authorization.
