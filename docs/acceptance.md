# Acceptance checklist
## Local demo (no infrastructure)
- Start with npm install, npm test, npm run dev.
- Open Overview, create an expense and try all four split methods. Verify totals in paise.
- Pay Riya partially. Scan demo QR only to inspect its text; it must never be a UPI URI.
- Report payment with the generated demo reference; balance must stay unchanged.
- Switch View as to Riya. Confirm receipt. Switch back; balance falls by exactly the confirmed amount.
- Attempt a duplicate reference, a pending overpayment, a cancellation and a rejection.
- Revise your own expense and inspect original record under Reversed.
- Inspect spending categories and refresh browser to verify demo persistence.
- Build and preview, check offline shell and mobile navigation.
## Connected environment (requires Supabase)
- Apply both migrations on a disposable database, use distinct accounts.
- Verify unrelated users cannot read or modify group financial data, join without invite, confirm their own claims or execute internal RPCs.
- Test concurrent payment creation and repeat confirmation. Verify no duplicate balance changes.
- Test exact QR amount and recipient with a small real transfer after explicit recipient agreement.
- Verify email signup, refresh, logout and recovery workflow. Test deployment on Android and iOS browsers.
- Do not launch until database and browser integration checks pass.
