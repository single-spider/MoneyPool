# Autonomous maintenance policy
GitHub Actions automatically builds and tests every push/PR. A scheduled health run may repeat checks weekly without changing source. Dependency update PRs may be proposed by Dependabot; never auto-merge financial/security changes. Every failed test blocks release.
## Bounded workflow
Read CI results, reproduce concrete failure, implement narrow patch, add regression test, rerun checks, update documentation. Stop when all relevant gates pass or a dependency requires user access, real-world testing or a product decision. Do not loop indefinitely, repeatedly retry deterministic failures or conceal blockers.
## Guardrails
No provider account creation, paid upgrades, real UPI payment, production database migration, secret changes, data deletion, public deployment or native store release without authorization. No autonomous merge of dependency updates. Maintain reviewable commits and changelog. External infrastructure stays deferred.
## Checks
Unit and browser tests, production build, dependency audit, database migration/authorization tests in CI with isolated PostgreSQL fixture, documentation links. A local PostgreSQL fixture cannot fully replicate hosted Supabase Auth or payment apps; live acceptance remains mandatory.
