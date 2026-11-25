# Developer guide
## Prerequisites
Git, Node.js 22, npm, modern browser. No Supabase/Cloudflare credentials for local demo.
```sh
git clone https://github.com/single-spider/MoneyPool.git
cd MoneyPool
npm install
npm test
npm run dev
```
Open http://localhost:5173. For production preview: npm run build; npm run preview. For browser tests: npx playwright install chromium; npm run test:e2e after build.
## Workflow
Use feature branches and pull requests for subsequent changes. Keep changes focused, document changes in changelog, run all gates. Preserve migrations and financial history. Never commit secrets or production data. CI runs on pushes/PRs. Dist artifact available in Actions after build.
## Conventions
Use integer paise for all calculations; deterministic split rounding; pure functions for domain logic. Validate at UI and server. Handle errors without displaying sensitive payloads. Keep accessible labels and mobile navigation. JavaScript ES modules + JSX is current implementation, TypeScript migration is future.
## Troubleshooting
No group: create or join. QR absent: ensure recipient UPI in live mode. Pending amount blocked: cancel unused request. Auth error: check project variables and redirect setup. If database schema missing, apply migrations in numeric order. Demo data stored under mp-demo-v1; reset via Settings.
## Tests
Unit tests exercise split totals, confirmation, QR payload, reversals, categories and reservation. Playwright exercises desktop/mobile settlement and expense flows. Add regression tests for bugs. CI failure is a release blocker; inspect exact logs before retry.
