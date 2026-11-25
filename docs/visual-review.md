# Rendered interface review
## Verified evidence
CI run 45724476500, commit 6c897b0. 19 unit tests, 26 browser tests passed, 8 duplicate screenshot jobs intentionally skipped; PostgreSQL tests passed. Screenshot artifact moneypool-ui-evidence contains 56 captures (7 screens × 4 widths × 2 themes). Gzipped main JS 88.25 kB and CSS 3.51 kB; npm audit reported zero vulnerabilities at that run.
## Inspected captures
Desktop light Overview (1440px), mobile light Overview (390px), all seven 320px light screens and all seven 768px dark screens via contact sheets.
## Findings and follow-up
- Group totals repeat global totals when there is one group: show group breakdown only when it differs in scope.
- Demo alert dominates phone viewport: use a compact neutral information strip, retain explicit simulation label.
- Group picker and add expense appear on unrelated pages: restrict toolbar to relevant views, compact on phones.
- Activity filters cramped at 320px: stack them; remove redundant row icon and give title more room.
- Serif rupee fallback inconsistent: use deliberate tabular system typography.
- Dialog background should be inert (WAI-ARIA APG), not just visually covered.
## Next
Re-run entire screenshot/axe matrix after changes, review resulting captures before visual signoff. Remaining: real-device checks, manually test screen readers, dense/empty/failed payment states, subjective design refinement and participant usability tests. No claim of WCAG conformance or production readiness.
