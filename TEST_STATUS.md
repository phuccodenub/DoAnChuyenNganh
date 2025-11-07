# Test Status Update — 2025-11-03

This section records the latest verified status across tests, typecheck, lint, and Docker runtime.

## Summary

- Jest: 10 suites, 248 tests, 0 failures (all green)
- TypeScript typecheck: PASS (tsc --noEmit)
- ESLint: 0 errors, many warnings (auto-fix applied where safe; warnings remain for future hardening)
- Docker smoke test: PASS (backend container up; GET http://localhost:3000/health → 200)
- Role-based login (Docker): PASS (admin/instructor/student) after seeding inside container

## Key fixes that stabilized the suite

- Fixed auth email existence check to use field-based lookup (no PK misuse) to avoid false duplicates
- Added deterministic test cleanup for stale users that could cause register collisions
- Capped generated test usernames to satisfy validation limits, enabling duplicate-username path to trigger correctly

## Quality gates (updated)

- Build: PASS
- Lint/Typecheck: Typecheck PASS; ESLint has warnings but no errors
- Tests: PASS (10/10 suites, 248/248 tests)
- Runtime (Docker): PASS (backend healthy; /health 200; logins OK for seeded users)

> Note 2025-11-03: If logins return 401 in Docker while tests pass locally, run the seed script inside the backend container to ensure the same DB is populated:

- docker exec dacn-backend-1 node dist/scripts/seed-database.js

Then re-run backend/scripts/test-logins.ps1 to verify admin/instructor/student logins.

---
# Test Readiness & Next Steps (as of 2025-10-30)

This document summarizes what’s already in place for backend testing and what we need to do next to get back to a green baseline.

## What’s working now

- Jest test harness
  - Configured for TypeScript + ts-jest + supertest.
  - Dedicated integration setup that loads `src/tests/integration/test.env`.
  - Global SQL shim converts `?` placeholders to `$1..$n` and normalizes replacements → bind.
  - Numeric coercion for Postgres DECIMAL/NUMERIC so values like `price`/`gpa` come back as numbers in tests.
  - Test setup runs migrations automatically before suites.
- API routing and stability for tests
  - Versioned routes with `/api` mount and `/v1` alias.
  - Self‑service endpoints: `/users/profile`, `/users/change-password` available under API.
  - Rate‑limit and metrics disabled in tests via env flags (reduce flakiness/latency).
  - Route debug endpoint present to introspect registered routes.
- Auth and validation hardening
  - JWT auth wired with RBAC and Zod validation.
  - Username regex updated to allow hyphens and underscores.
- Docker + infra scaffolding
  - Compose stack with Postgres, Redis, Backend, Frontend; DB exposed on 5432, backend on 3000.
  - Test env points to `127.0.0.1:5432`.
- Resilience added during test bootstrap
  - Test setup attempts to create `lms_db_test` automatically.
  - If creation is not permitted (permissions), it now falls back to using the main `lms_db` by overriding `DATABASE_URL`.

## Current blockers

- Backend container crash loop on startup
  - Root cause: TS path aliases like `@middlewares/*` are unresolved in `dist` at runtime inside Docker.
  - Symptom: `/health` returns no response; run-tests.ps1 fails at Phase 1.
- DB for integration tests
  - On fresh environments, `lms_db_test` may not exist and the DB user may lack `CREATEDB` permission.
  - Our bootstrap now falls back to `lms_db` if creation is denied, but this needs a re-run to confirm.

## Next steps (target: restore baseline ~69/86, then iterate)

1) Fix module alias mapping in Docker (unblock /health)
- Preload module-alias in the container:
  - Option A: Set `NODE_OPTIONS=--require module-alias/register` for the backend service in compose.
  - Option B: Change the start command to `node -r module-alias/register dist/server.js` in the Dockerfile.
- Ensure `_moduleAliases` in `backend/package.json` point to compiled `dist/...` paths, not `src/...`.
- Rebuild the backend image and ensure `/health` returns 200.

2) Stabilize test DB connection
- Prefer `lms_db_test` when available; if missing and user lacks `CREATEDB`, either:
  - Temporarily grant: `ALTER USER lms_user CREATEDB;` (inside container as `postgres` superuser), or
  - Manually create DB: `CREATE DATABASE lms_db_test OWNER lms_user;` (once).
- Our fallback to `lms_db` should keep tests running even without the above; confirm via re-run.

3) Re-run tests and collect failures
- Run API smoke: `run-tests.ps1` (expects backend `/health` and admin login).
- Run integration: `npm run test:integration` (backend folder) and record pass/fail deltas.

4) Triage and fix functional failures
- Auth refresh still returning 401 in prior runs → inspect tokenVersion/refresh flow.
- Duplicate username still surfaced as generic Validation error → map to friendly message.
- Ensure DECIMAL/NUMERIC values are consistently numbers across SELECT/RETURNING paths.

## PowerShell tip (env var)
If you see `=test: The term '=test' is not recognized`, make sure the environment assignment is correct in PowerShell:

```powershell
# From the backend directory
$env:NODE_ENV = 'test'
npm run test:integration --silent
```

Or in one line:

```powershell
pwsh -NoProfile -Command "cd h:\\DACN\\backend; $env:NODE_ENV='test'; npm run test:integration --silent"
```

If quoting causes issues in your terminal, prefer running the two separate commands interactively as shown first.

## Quality gates (current status)
- Build: PASS (local TypeScript compiles; container fails due to alias resolution at runtime)
- Lint/Typecheck: PASS (no new TS errors from recent test utilities)
- Tests: FAIL (backend container health down; integration tests blocked by DB availability/permissions)

## Quick checklist
- [ ] Backend container boots; `/health` 200
- [ ] `run-tests.ps1` Phase 1+2 pass (health/metrics + admin login)
- [ ] Jest integration connects (fallback or `lms_db_test` exists) and runs migrations
- [ ] Baseline restored (~69/86 passing); proceed to fix remaining auth/validation/numeric issues

## Notes
- Two test modes are used in this repo:
  - E2E via Docker (`run-tests.ps1`) against `lms_db` inside the stack.
  - Local Jest integration against `lms_db_test` (or fallback to `lms_db` if creation denied).
- Keep ports consistent (5432 for Postgres, 3000 backend, 3001 frontend).
