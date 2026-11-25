# MoneyPool visual and interaction system
## Direction
A shared digital ledger. Calm, precise, compact and human. The primary task is understanding what is owed and recording actual repayments, usually on a phone. Use an editorial ledger with ruled rows, restrained surfaces, and prominent tabular amounts. No marketing hero inside the application.
## Tokens
- Ink: #182720; muted #4d6057; page #f5f5ef; surface #fffefa; border #d9ded4.
- Action green #14573d, hover #10452f; positive #17613e; negative #a52e2b. Pending amber #75520c on #fff0c9. Color is never the sole state cue.
- Dark mode: canvas #15251f, surface #1e3329, ink #edf2eb, muted #afc2b5, border #456052, action #a9e39a with dark text.
- Typography: system UI for legibility and no font download; Georgia serif reserved for the large net balance (a ledger reference, not marketing). Tabular figures for all money. Body 15–16px, secondary 13px, page title 28–32px. Avoid tiny all-caps labels and ornamental tracking.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48px. Radii: 6px controls, 12px containers, circle only for avatars. One shadow for modal surfaces.
- Use consistent inline SVG outline icons at 20px. Do not use decorative symbols, emoji, gradients, glow, meaningless graphic marks or generic marketing copy.
## Hierarchy
Overview: global net amount with gross owed/owing breakdown, incoming confirmation, selected group ledger, recent expenses. Every number has a scope. No nested decorative cards. Use borders and rhythm for rows; align amounts consistently.
Desktop: navigation on left, reading-width workspace. Mobile: four primary tabs and More (Friends, Insights, Settings); 44px minimum touch targets, safe areas, inputs >=16px. At 320px no horizontal page overflow. Long names wrap; large amounts never clipped. No color-only state.
## States
Every view needs useful empty, loading, error, populated, dense, and offline states where applicable. Every action has an explicit label, valid keyboard behavior, visible focus and async feedback. Show demo status compactly and distinguish recipient attestation from bank verification.
## Finance
Payment review shows amount, recipient, reference and status; generating a request or reporting payment cannot lower debt. No optimistic settlement. Preserve records on edits and retry with stable IDs. Never hide uncertainties. Avoid duplicate payments and explain how to recover after a network failure.
## Review
Compare real screenshots for all seven screens at 320, 390, 768 and 1440px in both themes. Test keyboard and screen reader; use axe as a subset, not proof of WCAG conformance. Reject cosmetic changes that degrade accounting or feature coverage. No external font or paid dependency without an explicit benefit.
