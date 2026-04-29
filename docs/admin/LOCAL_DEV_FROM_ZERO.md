Local development from zero (macOS + Windows)

Goal

Get the ChangeNow backend + frontend running locally the way developers do, even if you’re new to coding.

What you will end up with

- Backend running at: http://localhost:4000
- Frontend (Expo Web) running at: http://localhost:8081
- You can log in, load the exercise library, and use the app UI.

Important prerequisite (database)

The backend uses Postgres (Supabase) via DATABASE_URL.
That means you need a working DATABASE_URL for a dev/test database.

- Do NOT use your production database for local dev/testing unless you intentionally want to modify production data.

---

1) Install required tools

You need:

- Git (to clone the repo)
- Node.js 20 (to run the app)
- npm (comes with Node)

Optional but recommended:

- A code editor (Cursor / VS Code)

macOS (friendly path)

- Install Homebrew (if you don’t already have it): https://brew.sh/
- Install Git + Node:
  - brew install git
  - brew install node@20

Windows (friendly path)

- Install Git for Windows: https://git-scm.com/download/win
- Install Node.js 20 LTS: https://nodejs.org/
  - After install, open a fresh terminal so `node` and `npm` are available.

Quick verification (both OS)

Open a terminal and run:

- node -v   (should show v20.x)
- npm -v
- git --version

---

2) Get the code (clone the repo)

In a terminal, pick a folder where you keep projects, then run:

- git clone <YOUR_REPO_URL_HERE>
- cd Change-Now

If you already have the code, just `cd` into it.

---

3) Install dependencies (one command)

From the repo root (Change-Now), run:

- npm run ci:all

This installs dependencies for both:
- backend/
- frontend/

If that fails, you can install them separately:
- cd backend && npm ci
- cd ../frontend && npm ci

---

4) Create local environment files

Backend env (required)

- Copy: backend/.env.example → backend/.env
- Set at least:
  - DATABASE_URL=... (Supabase Postgres connection string)
  - JWT_SECRET=...   (any random string for local dev)
  - PUBLIC_API_URL=http://localhost:4000
  - PORT=4000
  - CORS_ALLOWED_ORIGINS=http://localhost:8081
  - COOKIE_SECURE=false
  - COOKIE_SAME_SITE=lax

Frontend env (recommended)

- Copy: frontend/.env.example → frontend/.env
- Set:
  - EXPO_PUBLIC_API_URL=http://localhost:4000

Notes

- These .env files are intentionally ignored by git (not committed).
- If you don’t have values for DATABASE_URL, ask the admin/owner for a dev/test DB connection string.

---

5) Start the app (backend + frontend together)

From the repo root, run:

- npm run start

This starts two processes:
- backend server (port 4000)
- Expo dev server (web on port 8081)

What “success” looks like

- Backend prints something like “Server listening on …:4000”
- Frontend prints an Expo dev server URL (web typically uses port 8081)

---

6) Sanity-check (quick)

Backend health:
- Open: http://localhost:4000/health
- You should see JSON that includes: "status": "ok"

Backend readiness (DB check):
- Open: http://localhost:4000/ready
- You should see "database": "ok"
  - If it says unavailable, DATABASE_URL is wrong or the DB is not reachable.

Frontend:
- Open: http://localhost:8081
- You should see the ChangeNow login screen.

---

Common beginner problems (and fixes)

- “DATABASE_URL is required”
  - Backend doesn’t have a DB connection string. Fill in backend/.env.
- “Origin not allowed by CORS”
  - Ensure backend/.env includes CORS_ALLOWED_ORIGINS=http://localhost:8081
- “Port already in use”
  - Something else is using 4000 or 8081. Stop the other process or change ports.

---

Next: automated tests

See:
- docs/admin/TESTING.md

