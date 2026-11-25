# Deployment runbook (deferred)
No external projects are provisioned by this repo. Deploy demo without credentials; live deployment requires approved account access.
## Supabase free project
Create project; retain database password securely. In SQL editor apply every migration in numeric order (001 through 004 at this writing). Enable email/password auth; configure site URL and redirects. Review email confirmation delivery limits, backups, project inactivity/quotas. Copy project URL and publishable (or anon) key. Never use service-role key in frontend.
## Cloudflare Pages
Create Pages project connected to single-spider/MoneyPool. Production branch main, Vite preset, npm run build, output dist, root repo directory. Use free pages.dev address if available. Set both VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY for live mode and rebuild. Preview environments must use a separate test project or demo mode, never production data.
## Validation
After deploy, verify HTTPS, redirects, static assets, no credential leakage, auth, two independent accounts, group isolation, QR scanning and tiny controlled payment. Confirm mobile PWA behavior. Run live database security tests and record results. No launch until all launch gates pass.
## Rollback
Revert faulty commit or redeploy known-good build. Database migration rollback needs explicit recovery plan; avoid destructive SQL. If frontend and schema incompatible, pause writes and restore compatibility with forward fix. Preserve payment records.
## Cost constraint
Free plans have usage caps and may change. No domain purchase, paid upgrade, SMS or payment provider activation without user approval. Review current quotas in provider dashboards before public rollout.
