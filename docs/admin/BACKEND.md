Backend (API)
What it is:

Before you run anything (dependencies)

- From repo root (recommended):
  - npm run ci:all
- Or just the backend:
  - cd backend && npm ci

Node/Express API in backend/
Runs locally via node, runs in production via Docker on EC2
Connects to Supabase Postgres via DATABASE_URL
Key paths:

backend/server.js (Express app startup; loads environment, mounts routes, health checks, Swagger)
backend/routes/ (API routes)
backend/controllers/ (route handlers)
backend/dbconnection.js (Postgres connection; uses process.env.DATABASE_URL)
backend/middleware/auth.js and other auth middleware (uses process.env.JWT_SECRET)
backend/config/runtime.js (runtime config + CORS + cookie + proxy settings)
backend/Dockerfile (production image build)

Swagger / OpenAPI docs:

The backend serves interactive API docs via Swagger UI at:
- /api-docs
(https://api.changenow.fit/api-docs)

Locally, if the backend is running on port 4000:
- http://localhost:4000/api-docs

Notes:
- The OpenAPI “servers” value is derived from PUBLIC_API_URL (when set), otherwise it falls back to http://localhost:<port>.
- The OpenAPI spec is generated from @openapi blocks throughout the backend code (server.js, routes/, controllers/, middleware/, services/, config/).

Health / readiness endpoints (used for ops/deploy checks):

- /health and /api/health (liveness)
- /ready and /api/ready (readiness; includes a DB connectivity check)
- / (route map; includes route aliases + detected CORS config)

Environment variables (minimum):

PORT (default 4000)
DATABASE_URL (Supabase Postgres URI, not Supabase REST API URL)
JWT_SECRET (used to sign/verify tokens)

Environment variables (production-recommended):

PUBLIC_API_URL (public HTTPS base URL for the API; required in production)
CORS_ALLOWED_ORIGINS (comma-separated allowed browser origins)
COOKIE_SECURE=true
COOKIE_SAME_SITE=none (typically when COOKIE_SECURE=true)
TRUST_PROXY=true (needed behind Nginx / reverse proxies)

Supabase note:

Use the Supabase “Database connection string / URI” for DATABASE_URL.
Do not use the Supabase Data API URL (.../rest/v1/...) for DATABASE_URL.

Docker note:

Inside Docker, 127.0.0.1 refers to the container, not the EC2 host.
So DATABASE_URL must not point at localhost unless Postgres is in the same container (it isn’t here).

IPv6 note (if seen):

If logs show IPv6 ENETUNREACH connecting to Supabase, set:
NODE_OPTIONS=--dns-result-order=ipv4first in production env and restart the container.