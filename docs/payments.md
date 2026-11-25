# Payments and settlement
## Direct UPI model
MoneyPool does not move funds itself. Client QR encodes upi://pay with pa (recipient UPI ID), pn (name), am (fixed two-decimal INR amount), cu=INR, tn (description), tr (request ID). UPI apps may behave differently; verify on actual devices. A QR request is never proof of transfer. Use stored server recipient snapshot, not mutable profile data.
## Lifecycle
| State | Actor and next actions | Balance impact |
| --- | --- | --- |
| created | payer can report or cancel | none; reserves amount |
| reported | recipient can confirm or reject | none; reserves amount |
| confirmed | terminal in MVP | subtract actual reported repayment |
| rejected | terminal; new request may be needed | none |
| cancelled | terminal | none |
Confirm only after checking actual bank credit and amount. A recipient can falsely confirm or reject; this is a social trust model, not independent financial verification. No payment-provider integration is configured.
## Example
A owes B INR 500. A creates and reports INR 200. A still owes INR 500. B confirms actual receipt; A now owes INR 300. If B rejects, INR 500 remains due. Duplicate references are refused for active/confirmed claims.
## Edge cases
- Payment amount differs: do not confirm; contact payer and reconcile before creating new request. Existing MVP cannot amend a reported claim.
- App closes or network fails: reopen Payments and refresh before retry.
- QR recipient changes: old requests retain the stored UPI ID; cancel if not yet paid.
- Debt changes while a payment is pending: confirmed actual payment remains recorded, possibly producing opposite balance.
- Refund or chargeback: no automated reversal yet; reconcile outside the app and escalate. Do not fake another successful payment.
## Demo
QR is plain text explicitly marked DEMO; no payment URI. Test reporting and switch identities locally for simulated recipient confirmation.
## Automatic verification future gate
Only adopt a partner that expressly supports the intended P2P model. Verify signed server events, transaction uniqueness, amount, currency, recipient, replay resistance, and reversal handling. Assess applicable regulatory duties before launch. Never collect UPI PINs or store funds.
