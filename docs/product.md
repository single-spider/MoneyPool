# Product requirements
## Purpose
MoneyPool lets people record shared expenses and repay debts through direct UPI transfers. India/INR first. Website first; native packaging later. No custody or wallet, no mandatory paid services.
## Personas
- Group organizer: creates groups and shares invitations.
- Member: records their own expenses, views balances, requests and reports payments.
- Recipient: checks bank or UPI account and confirms or rejects receipt.
## MVP journeys
1. Create account, configure name and optional UPI ID.
2. Create a group or join with a private invite code.
3. Add expense paid by yourself, select participants and choose equal, exact, percentage or shares. All allocations sum exactly to the amount.
4. View pairwise group balances; choose full or partial repayment. A pending request reserves debt but does not change the balance.
5. Scan exact-amount UPI QR or open an external UPI app. Report actual transaction reference.
6. Recipient checks their bank and confirms or rejects. Only confirmation updates balances.
7. Edit or reverse your expense with original record preserved. Confirmed repayments are retained.
8. Search activity; view category totals and friends' group-specific balances.
## Acceptance
Demo works without credentials; real mode requires Supabase. No QR generation, claim, cancellation or rejection may count as settlement. Access to groups is authenticated and membership-scoped. Website usable at desktop and mobile widths. Build, unit and browser tests must pass.
## Scope boundaries
Initial release has self-paid expense records, group-derived friends, recipient-confirmed repayment, no automatic bank proof. Future: independent friends/invites, multi-payer expenses, simplification, refunds/disputes, notifications, provider integration and native binaries. No paid infrastructure without explicit approval.
## Measures
Track test pass rate, settlement correctness, failed writes, signup completion, database usage and user feedback. Collect only minimal non-sensitive metrics with consent where required.

## Workspace improvements
Cross-group summary and incoming payment inbox, group status filters, split preview, formula-safe CSV expense exports, persistent theme, owner invitation rotation and payment audit trail.
