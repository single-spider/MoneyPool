# MoneyPool
Mobile-first expense sharing website with UPI QR repayment requests and recipient-confirmed settlements. React/Vite, Supabase and Cloudflare Pages. No paid hosting required within free-tier limits.

## Run locally
Install Node.js 20+ then:
```sh
npm install
npm test
npm run dev
```
Without configuration the website runs in local demo mode. Demo data is stored in the browser, real payment links are disabled, and users can switch between sample group members.

## Configure real shared accounts
1. Create a free Supabase project.
2. In SQL Editor run the entire `supabase/migrations/001_moneypool.sql` once. Do not run on an unrelated database.
3. Enable email/password authentication and configure the Site URL and allowed redirect URLs for your deployment. Configure email delivery as needed; default Supabase email limits may constrain signup.
4. Copy `.env.example` to `.env.local` and enter your project URL and **publishable** key (or legacy anon key). Never use the service role key in a browser or GitHub.
5. Restart Vite. Create separate accounts, save UPI IDs, create a group, share its private invite code, and join from another account.

## Deploy to Cloudflare Pages
Connect this repository in Cloudflare Workers & Pages > Create > Pages > Connect to Git. Choose main, Vite, build command `npm run build`, output directory `dist`, root directory blank. Set environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` before building. The generated pages.dev hostname is free. Update Supabase Auth site URL to the deployed origin.

## Payment model and limitations
MoneyPool never holds funds. UPI QR codes are generated locally from the recipient snapshot and exact amount; provider apps handle transfers. A report requires a reference and only the authenticated recipient can confirm. It is **manual verification**, not bank or provider verification. Confirmed payments alone affect derived pairwise balances. A confirmed payment may produce a reverse balance if new expenses changed the original debt after request creation. Pending requests reserve the amount; unused created requests can be cancelled. No automated verification, refund or dispute workflow yet. Group-based sharing is supported; a two-person group works for friends. Group history is append-only; expense edits/deletes, multiple payers, debt simplification and push notifications are future features.

The database migration enables RLS, revokes direct client table access, and exposes scoped authenticated RPCs. Test the SQL and authorization in a disposable Supabase project before production use. Invite codes are bearer secrets and group members can see group history and UPI IDs. There is no external provider or bank integration.

## Mobile
The site has a responsive layout and web manifest; service worker does not cache financial data. Future Capacitor packaging will require native project configuration, URL scheme handoff testing and platform review.
