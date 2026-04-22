Backend (API)
What it is:

Node/Express API in backend/
Runs locally via node, runs in production via Docker on EC2
Connects to Supabase Postgres via DATABASE_URL
Key paths:

backend/server.js (Express app startup; loads environment)
backend/routes/ (API routes)
backend/controllers/ (route handlers)
backend/dbconnection.js (Postgres connection; uses process.env.DATABASE_URL)
backend/middleware/auth.js and other auth middleware (uses process.env.JWT_SECRET)
backend/Dockerfile (production image build)
Environment variables (minimum):

PORT (default 4000)
DATABASE_URL (Supabase Postgres URI, not Supabase REST API URL)
JWT_SECRET (used to sign/verify tokens)
Supabase note:

Use the Supabase “Database connection string / URI” for DATABASE_URL.
Do not use the Supabase Data API URL (.../rest/v1/...) for DATABASE_URL.
Docker note:

Inside Docker, 127.0.0.1 refers to the container, not the EC2 host.
So DATABASE_URL must not point at localhost unless Postgres is in the same container (it isn’t here).
IPv6 note (if seen):

If logs show IPv6 ENETUNREACH connecting to Supabase, set:
NODE_OPTIONS=--dns-result-order=ipv4first in production env and restart the container.