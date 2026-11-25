# Database and API contracts
All money is integer paise, INR only. IDs are UUIDs. Database timestamps are timezone-aware. Apply migrations in order, never modify an applied migration; add a new migration.
## Tables
- mp_profiles: auth user ID, display name, optional UPI ID.
- mp_groups: UUID, name, owner, invite code, creation timestamp.
- mp_members: group/user composite key.
- mp_expenses: ID, group, payer, title, amount, category, created_at, voided_at, replaced_by.
- mp_splits: expense/user composite key, amount.
- mp_payments: group, payer/recipient, amount, UPI/name snapshot, status, reference, timestamps.
## RPC reference
Every exposed operation requires authenticated context. Functions return JSON, UUID or void. Errors use PostgreSQL exceptions.
| RPC | Arguments | Result and permission |
| --- | --- | --- |
| mp_save_profile | p_name, p_upi | void; current user only |
| mp_create_group | p_name | UUID; creates owner membership |
| mp_join_group | p_code | UUID; valid invite code |
| mp_snapshot | none | profile plus member groups, expenses/splits/payments |
| mp_write_expense | p_id,p_group,p_title,p_amount,p_splits,p_category,p_replace | void; payer is current member, replace optional and owned |
| mp_void_expense | p_id | void; payer only |
| mp_create_payment | p_id,p_group,p_recipient,p_amount | void; debtor and recipient are members; positive unreserved debt |
| mp_payment_action | p_id,p_action,p_reference | void; role and current-state checks |
Internal mp_pair_debt and mp_add_expense must not be directly callable by anonymous or authenticated users after migration 002.
## Example split payload
```json
[{"user_id":"UUID_A","amount":5000},{"user_id":"UUID_B","amount":5000}]
```
Replace placeholder IDs with actual member UUIDs. Both shares add to 10000 paise.
## Accounting
For A owing B: total active allocations paid by B for A minus reverse allocations, minus confirmed A-to-B payments plus confirmed B-to-A payments. Pending amounts only constrain available payment requests. Sum of each pair's opposite balances is zero. Expense reversal removes allocation effect but retains actual payments; balances may reverse as a consequence.
## Concurrency
Group row locks serialize financial mutations. Primary keys prevent duplicate records; unique normalized transaction references cover reported/confirmed payments. Repeated confirmation is rejected. Network retry is not a full idempotency-response protocol yet; refresh before retrying an ambiguous write.
## Access
Members see group history and payment profiles. Invite codes are bearer secrets; access removal/rotation and data retention tooling are future work. Do not expose raw database tables directly.
