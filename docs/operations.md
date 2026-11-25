# Operations and incidents
## Monitoring
Check GitHub Actions on every change; monitor free-tier database size, auth usage, email delivery, errors and Pages builds after connecting. No paid monitoring currently. Avoid logging UPI IDs, references, tokens or group contents.
## Backup and restore
Export schema and encrypted database backup using authorized tooling before migrations; store securely outside public GitHub. Verify restore into isolated project. Free tiers may not provide all recovery features; verify actual service capabilities. Never restore over production without approval.
## Incident playbook
1. Identify scope, time, affected users and write paths. Preserve logs without exposing secrets.
2. If balances or payments may be wrong, pause writes/public access and inform owner; do not erase records.
3. Reproduce in staging; add regression test; patch through review and CI.
4. Reconcile with actual payment evidence before financial corrections. No unverified changes.
5. Restore service and document cause, mitigation and follow-up.
## Severity
P0: unauthorized access, double settlement, wrong recipient or data loss. P1: auth failure, group write outage, inaccurate balance. P2: cosmetic or nonblocking issue.
## Recovery objectives
No guaranteed uptime or recovery objective on free plans. Set service targets after measuring usage and backup capability.
