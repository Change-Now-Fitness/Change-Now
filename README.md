# ChangeNow

ChangeNow is a fitness logging + visualization app for tracking workouts (sets/laps) and viewing progress over time.

## What we are (and what we solve)

ChangeNow helps people who lift or do cardio **log workouts quickly** and **see progress clearly**, without keeping notes across multiple apps/spreadsheets. It’s built to make “what did I do last time?” and “am I improving?” easy to answer.

- **Web app (hosted)**: `https://changenow-ashy.vercel.app`
- **Mobile apps**: not yet available in the App Store / Play Store (see build instructions below)

Tech stack:

**Frontend:** Expo (React Native)

**Backend:** Express.js REST API

**Database:** PostgreSQL (Supabase)

---
## Project structure
```text
Change-Now/
├── frontend/   # Expo mobile app
├── backend/    # Express REST API
├── docs/       # Deployment/testing/admin docs
└── assets/     # Shared assets
```
---
## Prerequisites
- **Node.js**: 20.x
- **npm**: 10.x
---
## Quickstart (run everything locally)
```bash
npm run install:all
npm run start
```
- **Backend**: `http://localhost:4000`
- **Expo dev server**: printed by Expo (often `http://localhost:8081`)

## Current hosted API target

The app and web client are now being prepared to use:

- `https://api.changenow.fit`

Frontend defaults and Android build profiles should point there unless you intentionally override them for local backend testing.
---
## Environment variables
### Backend (`backend/.env`)
Copy `backend/.env.example` → `backend/.env`.
- **Required (production)**:
  - `DATABASE_URL` (Supabase Postgres connection string/URI)
  - `JWT_SECRET`
  - `PUBLIC_API_URL` (must be **HTTPS** in production)
- **Common runtime flags**:
  - `CORS_ALLOWED_ORIGINS`
  - `CORS_ALLOW_ALL`
  - `COOKIE_SECURE`
  - `COOKIE_SAME_SITE`
  - `TRUST_PROXY`
Validate env before running:
```bash
cd backend
npm run validate:env
```
### Frontend (`frontend/.env`)
Copy `frontend/.env.example` → `frontend/.env`.
- `EXPO_PUBLIC_API_URL` (base URL for the backend)
  - Hosted default: `https://api.changenow.fit`
  - Local dev override: `http://localhost:4000`
  - Device/testing builds: **public HTTPS URL**
---
## Backend (API)
```bash
cd backend
npm install
npm run validate:env
npm start
```
### Useful endpoints
- **Docs**: `GET /api-docs`
- **Health (liveness)**: `GET /health` (alias: `/api/health`)
- **Ready (readiness + DB check)**: `GET /ready` (alias: `/api/ready`)
- **Route map**: `GET /` (returns route aliases + CORS info)
---
## Frontend (Expo)
```bash
cd frontend
npm install
npm start
```

## Building mobile apps (not in stores yet)

Android build steps (EAS) live in:

- `docs/deployment/android-testing-backend.md`

---
## Testing
### Frontend unit tests (Jest)
```bash
npm test --prefix frontend
```
### End-to-end tests (Playwright)
```bash
npm run test:e2e --prefix frontend
```
For the full automated testing setup (unit, integration opt-in, E2E), see `docs/admin/TESTING.md`.
---
## Hosted Android testing checklist
See `docs/deployment/android-testing-backend.md`.
Highlights:
- Deploy backend to a **public HTTPS** host
- Set backend env vars (including `PUBLIC_API_URL=https://api.changenow.fit`)
- Run `npm run validate:env` in `backend/`
- Verify `/health`, `/ready`, and `/api-docs`
- Set `EXPO_PUBLIC_API_URL=https://api.changenow.fit` for the build environment
- Rebuild the Android app after the API URL changes
---
## Production deployment (current)
Backend is deployed as a **Docker container on EC2**, behind **Nginx**, deployed via **GitHub Actions → ECR → SSM → EC2**.
Key docs:
- `docs/ADMIN_OVERVIEW` (start here)
- `docs/admin/CI_CD.md`
- `docs/admin/CLOUD_EC2_NGINX.md`
- `docs/admin/RUNETIME_SECRETS.md`
- `docs/admin/TESTING.md`
- `docs/admin/TROUBLESHOOTING.md`
Notes:
- Production runtime env on EC2: `/opt/change-now/backend.env`
- Deploy script on EC2: `/opt/change-now/deploy-backend.sh <git-sha>`
---
## Contributing / tracking work
- **Issues**: GitHub Issues for bugs + upcoming features.
- **Docs-first**: keep runbooks in `docs/` so the README stays high-signal.
