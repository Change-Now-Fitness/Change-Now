# ChangeNow

ChangeNow is a workout tracking app built with:

- Frontend: Expo / React Native
- Backend: Express.js REST API
- Database: PostgreSQL (Supabase)

## Project Structure

```text
Change-Now/
|-- frontend/   # Expo mobile + web client
|-- backend/    # Express REST API
|-- docs/       # deployment and testing docs
`-- binary/     # course release artifacts
```

## Dependencies For Devs

- Branch in active Android release work: `turning-it-into-an-app`
- Node.js: `v20.20.0`
- npm: `10.8.2`

## Backend (API Server)

### Setup

```bash
cd backend
npm install
```

### Run locally

```bash
npm start
```

Local backend default:

- `http://localhost:4000`

## Frontend (Expo App + Web)

### Setup

```bash
cd frontend
npm install
```

### Run the app

```bash
npx expo start
```

### Run the web client

```bash
npx expo start --web
```

## Current Hosted API Target

The frontend is now prepared to use:

- `https://api.changenow.fit`

This hosted API target is already wired into:

- `frontend/.env`
- `frontend/eas.json`
- `frontend/playwright.config.ts`
- the frontend runtime fallback in `frontend/lib/config.ts`

If you still need to test against a local backend temporarily, override:

```env
EXPO_PUBLIC_API_URL=http://localhost:4000
```

## Hosted Backend Cutover Checklist

Before merging the hosted-backend cutover to `main`:

- finish configuring the server behind `https://api.changenow.fit`
- set `PUBLIC_API_URL=https://api.changenow.fit`
- set backend env vars on that host
- run `npm run validate:env` in `backend/`
- verify `GET /health` and `GET /ready`
- confirm login, exercises, and workouts all work against the hosted backend
- rebuild Android binaries after the API URL is final

Detailed backend deployment notes live in:

```text
docs/deployment/android-testing-backend.md
```

## Testing

Testing documentation is maintained in:

```text
docs/testing/
```

Relevant commands:

```bash
cd frontend
npm test
npm run test:e2e
```

By default, Playwright web E2E tests now point at `https://api.changenow.fit`. You can still override `EXPO_PUBLIC_API_URL` locally if needed.

## Current Product Status

Working areas:

- User signup and login
- Exercise library with muscle group navigation
- Search functionality
- Add custom exercise modal
- Selected exercise view
- Add workout sets
- View current workout sets
- View historical workout logs
- Backend API and database integration

Known active focus areas:

- final hosted backend cutover
- Android release validation
- graph and analytics polish
- broader bug logging before final release
