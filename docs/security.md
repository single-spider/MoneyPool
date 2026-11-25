# Security and privacy
## Threat model
Assets: account sessions, UPI IDs, group membership, expense records, transaction references. Threats: unauthorized group access, self-confirmation, duplicate requests, tampered amounts, leaked invite codes, stale UPI addresses, XSS, supply-chain compromise, account takeover, dishonest recipient, denial of service.
## Implemented controls
RLS enabled and client table grants revoked; explicit authenticated RPCs, role/state checks, scoped snapshots, group locks, positive bounded amounts, validated splits, normalized reference uniqueness, stored recipient snapshots, owner-only rotating invitations, party-scoped payment metadata, retry-safe financial creation, no service-role key in frontend, no financial API cache. React escapes rendered text. Demo QR cannot pay.
## Remaining controls / gates
Live SQL permission tests; account recovery and email abuse controls; member removal; bounded pagination; rate limiting; dependency audit; security headers/CSP compatibility testing; auth session isolation under races; deletion/export policy and incident response. Confirmed payment is manual attestation; fraud is not eliminated.
## Data handling
Do not store bank account passwords, PINs or OTPs. Only use required profile and group data. Group members can see shared history and payment details; communicate this to users. Never publish real data in issue logs. Define retention/deletion and privacy notice before public release. Restrict admin access and rotate compromised credentials.
## Launch gate
Validate RLS/RPCs against a disposable Supabase database with at least three unrelated test accounts. Verify no anonymous direct access, no unauthorized group mutation, no self-confirmation, no duplicated postings and no unauthorized internal functions. Conduct manual security review. Document unresolved risks and obtain owner approval before launch.
