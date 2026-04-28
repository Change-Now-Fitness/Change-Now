Testing (Admin / CI / E2E)

Goal

Make sure changes do not break:
- Frontend behavior (unit tests)
- Backend behavior (smoke + unit/integration tests)
- Real user flows (E2E)

Test types in this repo

1) Frontend unit tests (Jest)

Where:
- frontend/test/*.test.*

What they do:
- Render screens/components in a fake environment (Node)
- Mock fetch/API calls and navigation
- Confirm key UI behavior (login/signup/library) and API helper behavior (fetch/addSet/history)

Run:
- cd frontend && npm test

2) Backend tests (Jest + Supertest)

Where:
- backend/test/*.test.js

What they do:
- health.test.js: calls GET /health against the Express app and checks response shape.
- auth-cookie-flow.test.js: integration test that logs in and uses the returned cookie to call a protected route.

Important: integration tests are opt-in

The auth cookie flow test is an integration test because it needs a real Postgres connection.
It only runs when:
- RUN_INTEGRATION=1 (or true)
- DATABASE_URL is set and reachable

Run backend tests:
- cd backend && npm test

Opt-in integration tests (cross-platform):
- cd backend && npm run test:integration

Notes:
- In CI, DATABASE_URL comes from GitHub Secrets.
- For safety, CI should use a dedicated test database for DATABASE_URL (not the production database), because some tests/seed scripts write data.

3) End-to-end tests (Playwright)

Where:
- frontend/test/e2e/*.spec.ts

What they do:
- Launch Expo Web in a real browser (Chromium by default).
- When running against localhost API, Playwright also starts the backend dev server.
- Execute deterministic flows:
  - login + logout
  - exercise library loads
  - create a custom exercise

Global setup + seeding (why E2E is deterministic)

Playwright runs a global setup step before any E2E tests:
- frontend/test/e2e/global-setup.ts

That setup runs:
- backend/scripts/e2eSeed.js

The seed script:
- Connects to Postgres using DATABASE_URL
- Ensures catalog tables exist
- Creates/updates a known test user (E2E_EMAIL / E2E_PASSWORD defaults if not set)
- Writes the resulting credentials to:
  - frontend/test/e2e/.e2e-env.json

The E2E test files read that JSON and log in with those credentials. This avoids flaky “test user does not exist” failures.

Run E2E:
- cd frontend && npm run test:e2e

CI expectations

CI job order (see .github/workflows/ci.yml):
- backend smoke import
- backend unit tests
- backend integration tests (opt-in script)
- frontend unit tests
- Playwright E2E tests

Secrets needed

GitHub Secrets (CI):
- DATABASE_URL: Postgres connection string for CI tests (ideally a test DB)
- JWT_SECRET: used by backend auth routes
- EC2_INSTANCE_ID: used for deploy steps (SSM)

EC2 runtime secrets (production):
- /opt/change-now/backend.env (env file used by the container)

