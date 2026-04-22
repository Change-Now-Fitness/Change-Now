# Android Testing Backend Setup

Use this checklist before sending Android or web builds to testers.

## Target backend URL

The production API target for this repo is:

- `https://api.changenow.fit`

Until the server cutover is complete, do not merge frontend changes that depend on this URL being healthy.

## 1. Finish hosting the backend publicly

- The public host must run the `backend/` app, not a local-only dev process.
- The API must stay reachable over HTTPS.
- The deployed backend should answer at `https://api.changenow.fit`.

## 2. Set backend environment variables

At minimum, the deployed backend needs:

- `DATABASE_URL`
- `JWT_SECRET` or `JWT_KEY`
- `PUBLIC_API_URL=https://api.changenow.fit`
- `PORT`

Recommended for hosted environments:

- `CORS_ALLOWED_ORIGINS`
- `COOKIE_SECURE=true`
- `COOKIE_SAME_SITE=none`
- `TRUST_PROXY=true`

Notes:

- `CORS_ALLOWED_ORIGINS` must include the real web frontend origin plus any local web origin you still want to use during development.
- `SUPABASE_SECRET_KEY` is not required by the current backend runtime.
- Run `npm run validate:env` inside `backend/` before starting the hosted server.

See [backend/.env.example](/c:/Change-Now/backend/.env.example:1).

## 3. Start the backend process

For EC2 + PM2:

```bash
cd ~/Change-Now/backend
npm install
npm run validate:env
pm2 start ecosystem.config.js
pm2 save
```

If you deploy with Docker instead of PM2, use [backend/Dockerfile](/c:/Change-Now/backend/Dockerfile:1).

## 4. Verify the backend manually

These must work from a browser or curl:

- `https://api.changenow.fit/health`
- `https://api.changenow.fit/api/health`
- `https://api.changenow.fit/ready`
- `https://api.changenow.fit/api/ready`
- `https://api.changenow.fit/api-docs`

If `/ready` fails, the deployed server cannot reach the database yet.

## 5. Point the app and website at the hosted backend

Set the frontend env:

```env
EXPO_PUBLIC_API_URL=https://api.changenow.fit
```

This repo now uses that URL in:

- `frontend/.env`
- `frontend/eas.json`
- `frontend/playwright.config.ts`

Local frontend testing can still override the API URL manually when needed.

## 6. Rebuild any binary that should use the hosted API

Rebuild after backend cutover so testers install a binary that is pinned to the hosted URL.

For EAS:

```bash
cd frontend
eas build --platform android --profile preview
eas build --platform android --profile production
```

## 7. Sanity-check the full flow

- Sign up
- Log in
- Load exercise library
- Add custom exercise
- Add workout set
- Load history

If any of those fail, check backend logs first before assuming the Android app or website is broken.
