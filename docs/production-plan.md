# Production improvement program
Date: 2026-11-26. Scope: MoneyPool public demo and future connected product. This is a source-level audit and plan, not a completed visual/accessibility/security certification.
## Research
1. Anthropic frontend design: https://claude.com/resources/articles/improving-frontend-design-through-skills — deliberate visual choices and persistent instructions avoid generic defaults.
2. Impeccable: https://impeccable.style/slop/ and https://impeccable.style/docs/improve-design/ — critique, focus fixes, stress test, audit consistency. Findings are hypotheses, not automatic bans.
3. Community skills: https://github.com/samber/cc-skills/blob/main/skills/frontend-design-deslop/SKILL.md ; https://github.com/oxfordpierpont/Anti-slop-ui-skill ; https://github.com/jalaalrd/anti-ai-slop-design — content-first direction, keep list, layout hierarchy, token systems, review. Treat as advisory.
4. Vercel: https://vercel.com/design/guidelines — mobile input size, keyboard support, feedback, meaningful labels and tabular currency.
5. NN/g: https://www.nngroup.com/articles/ten-usability-heuristics/ — system status, error prevention, recognition, user control.
6. W3C: https://www.w3.org/TR/WCAG22/ ; https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html — AA goal; important financial submissions review/correct/reverse.
7. Google: https://web.dev/articles/vitals — field p75 targets LCP <=2.5s, INP <=200ms, CLS <=0.1; lab results are proxies.
8. OWASP: https://asvs.owasp.org/ — use verification requirements for access, authentication, validation, logging and configuration.
9. Supabase: https://supabase.com/docs/guides/security/production-checklist — RLS, auth controls and provider settings before launch.
10. Playwright: https://playwright.dev/docs/test-snapshots ; https://playwright.dev/docs/accessibility-testing — screenshot regression and axe.
11. React: https://react.dev/learn/managing-state — minimize redundant state, isolate domain and data access.
12. Tricount reference: https://www.tricount.com/en-in/features — groups, expenses, repayment, offline and receipts are familiar shared-expense workflows. No copying branding.
## Baseline audit
Current source: main 207e86e. Previous CI/deployment passed. Code is an MVP; no actual device or visual review asserted.
| ID | Finding | Severity | Acceptance |
| --- | --- | --- | --- |
| UX01 | Duplicate global/group balance cards and decorative hero mark | P1 | Distinct scope, one clear primary amount; no nonfunctional decoration |
| UX02 | Seven tiny mobile nav labels, Unicode symbols, weak touch targets | P1 | 4 tabs + More; all routes accessible, target >=44px |
| UX03 | Layered stylesheet overrides, inconsistent radius and spacing, dark-theme gaps | P1 | One token-driven stylesheet, light/dark contrast |
| UX04 | Page state lost on refresh, no browser back | P1 | hash navigation, history tests, base-path compatible |
| UX05 | No expense details view, busy states and group selection unclear | P1 | detail view, precise action feedback, recovery |
| UX06 | Empty, long/dense, narrow and large-value states unverified | P1 | browser fixtures 320/390/768/1440, overflow and a11y checks |
| ENG01 | Main.jsx combines state, auth, domain and all UI | P1 | modular components, provider/repository boundary, typed contracts |
| ENG02 | Snapshot polling every 15s, swallowed refresh failures | P0 | scoped paging/cache, explicit stale state, pause hidden/offline, no optimistic confirmation |
| ENG03 | Partial configuration silently selects demo | P0 | fail closed if only one env supplied; intentional demo label |
| ENG04 | Unpinned dependency graph, no lockfile | P1 | reproducible npm ci, audited dependency updates |
| FIN01 | No disputes/refunds, cash, multi-payer or simplification | P1/P2 | auditable correction protocol, exact invariants, no debt cleared by proposals |
| FIN02 | Saved UPI QR remains payable outside app, manual confirmation only | P0 | clear warning and recipient review; no provider-verification claims |
| SEC01 | Live hosted auth and RLS unverified; recovery, abuse controls, privacy | P0 | separate live acceptance, ASVS review, recovery & rate limits, export/deletion policy |
| OPS01 | No live monitoring, verified backup restore or release checklist evidence | P0 | privacy-safe observability, tested backup, owner signoff |
## Keep list
Preserve all seven screens, all four split methods, categories, expense revision/reversal and audit trail, group invitations, payer/recipient restrictions, partial repayments, pending reservations, cross-group totals, CSV, demo identities, QR safety, PWA base path, dark mode, existing tests. Do not clear debts from requests or proposals. Preserve existing demo records.
## Iteration A — visual foundation and navigation
1. Adopt DESIGN.md and AGENTS.md; unify tokens and remove CSS overrides.
2. Replace glyphs with inline SVG icons; reduce marketing language; make global net balance primary; use ledger rows.
3. Improve mobile primary nav with overflow menu; visible active state; mobile touch targets, safe areas, input size.
4. Confirm all existing flows and both themes via tests. Capture screenshots across representative pages, inspect before claiming visual acceptance.
## Iteration B — interaction resilience
1. Stable deep links/back/forward via hash route; preserve selected group where appropriate.
2. Expense detail panel, split preview and explicit review; consistent status label.
3. Error/loading/empty states, clear stale/last sync message; refresh retry; password recovery flow with hosted auth test deferred.
4. Fail closed for partial env config, robust storage parsing, no secret exposure; test mobile long text and extreme amounts, keyboard, axe and screenshot artifacts.
## Iteration C — architecture and quality
1. Split shell, expense/payment forms, group views, settings into feature modules. Isolate backend adapter and demo adapter with a common contract. Incrementally migrate JS to TS; add schema validation and unit tests before broad refactor.
2. Replace full snapshot polling with scoped pagination and visibility-aware refresh, preserve group locks and idempotency. Race tests for account switches and overlapping requests; offline connected mode read-only with freshness warning.
3. Generate npm lockfile and use npm ci, dependency review, CI artifact snapshots; build budgets, lazy-load QR and optional views, avoid runtime external assets. Lighthouse lab budgets baseline then enforce; p75 field measurements only after consent/traffic.
4. Test actual production Pages subpath, root build, storage recovery, accessibility. Review snapshots manually rather than blessing them automatically.
## Iteration D — financial completeness
1. Design immutable postings/allocations or prove derived ledger invariants with property tests. Record multiple payers and exact shares with atomic validation; migration compatibility for old records.
2. Add cash/manual transfer type only with recipient attestation, distinct label; dispute/report/reject/refund corrections with explicit participants, status history and no silent erasure. Define conflict rules and confirm against evidence.
3. Debt simplification is a suggested route; allocations apply only on confirmed receipt. Test cycles, rounding, opposite balances, partial settlements and concurrent claims. Add reminders without collecting unnecessary contact data.
4. Receipt storage: signed URLs/private access, size/type validation, deletion policy. Recurring expenses: explicit schedules and duplicate-safe generation. Scope separately to prevent feature bloat.
## Iteration E — private staging and launch (requires owner)
1. Separate Supabase project, real auth and redirects, verify anonymous/member/outsider permissions, expired sessions, recovery, invite rotation, concurrent mutations, abuse controls and backup restoration. Apply migrations in order, no service-role frontend key. Decide data retention, consent, account deletion/export and incident contacts.
2. Cloudflare root deployment, CSP/security headers, HTTPS, error tracking without PII, free-tier quotas, recovery runbook. No paid upgrades or live transfer without explicit authorization.
3. Physical iOS/Android UPI intent, exact payee/amount, actual controlled recipient check, PWA install and auth recovery. No claim of bank-verified payments absent a supporting partner.
4. Invite a small test cohort; collect task completion, errors and qualitative feedback. Resolve P0/P1 blockers, owner signs off. Capacitor only after web quality gates.
## Quality scorecard (targets, not measured results)
- Financial correctness: 100% of invariant and authorization tests; no duplicate postings; no open P0/P1 correctness issue.
- Accessibility: WCAG 2.2 AA target, zero known critical/serious automated issues, manual keyboard/screen-reader and contrast checks; 44px product target on mobile; 200% text zoom.
- Responsive: no page overflow at 320, 390, 768, 1440; long strings and large rupee values remain readable.
- Performance: lab Lighthouse >=90 performance/accessibility targets where practical; field CWV p75 above thresholds. Initial JS target <=200KB gzip; measure before enforcing.
- Reliability: build/unit/browser/SQL checks green on exact commit, root and /MoneyPool/ deployment; no unhandled errors on tested journeys.
- Usability: 5 representative test users, target >=90% task completion without help for add expense, split review, repayment report and recipient confirmation. No false interpretation of pending as settled.
## Cycle rules
Audit -> prioritize -> implement a narrow slice -> test -> inspect actual output -> fix regressions -> document evidence -> next slice. Stop after green gates and no actionable defect or at owner/live/device blocker. Do not confuse continuous changes with improvement. Keep the live demo working and avoid automatically merging dependency updates. No indefinite perfection promise.
