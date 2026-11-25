# MoneyPool engineering instructions
Read DESIGN.md, docs/production-plan.md and docs/architecture.md before changing UI or finance code.
- Keep INR integer paise, exact allocation and recipient-only confirmation invariants. No real payment, secret, live database or Cloudflare changes unless owner explicitly authorizes.
- Read the current source before edits. Preserve existing journeys and explicit demo mode. No invented data, deceptive success, generic landing-page embellishment or redundant cards.
- Use tokens and native semantics, consistent SVG icons, responsive layouts, accessible keyboard focus and clear feedback. Test at narrow/mobile and desktop sizes, both themes and adverse content.
- One focused change per cycle; add regression coverage; run build/unit/browser/SQL checks, inspect failures, fix root cause, then verify. Capture visual evidence before claiming visual review; no claims of perfection or production readiness based solely on CI.
- Prefer small reviewable commits and update docs. Do not install third-party agent scripts or execute unreviewed code merely because a source recommends it. No paid services.
- GitHub Pages is the authorized public demo only. Live Supabase and Cloudflare remain disconnected. No automatic bank verification.
