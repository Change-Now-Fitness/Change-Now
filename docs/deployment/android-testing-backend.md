# Android Testing Backend Setup

Use this checklist before sending any Android build to testers.

## 1. Deploy the backend somewhere public

- AWS EC2, Render, Railway, Fly.io, or another public host is fine.
- The server must run the `backend/` app, not a local-only dev process.
- The API must be reachable over HTTPS for real testing builds.

## 2. Set backend environment variables

At minimum, the deployed backend needs:

- `DATABASE_URL`
- `JWT_SECRET`
- `PUBLIC_API_URL`
- `PORT`

Recommended for hosted environments:

- `CORS_ALLOWED_ORIGINS`
- `COOKIE_SECURE=true`
- `COOKIE_SAME_SITE=none`
- `TRUST_PROXY=true`

Notes:

- `PUBLIC_API_URL` should be the real public HTTPS URL for the backend.
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

## 4. Verify the backend manually

These must work from a browser or curl:

- `https://your-backend-url/health`
- `https://your-backend-url/api/health`
- `https://your-backend-url/ready`
- `https://your-backend-url/api/ready`
- `https://your-backend-url/api-docs`

If `/ready` fails, the deployed server cannot reach the database yet.

## 5. Point the mobile app at the deployed backend

Set the frontend build env:

```env
EXPO_PUBLIC_API_URL=https://your-backend-url
```

See [frontend/.env.example](/c:/Change-Now/frontend/.env.example:1).

## 6. Rebuild the Android app after changing the API URL

The app binary must be rebuilt after changing the production API URL for testers.

For EAS:

```bash
cd frontend
eas build --platform android --profile preview
```

If you deploy with Docker instead of PM2, use [backend/Dockerfile](/c:/Change-Now/backend/Dockerfile:1).

## 7. Sanity-check the full flow

- Sign up
- Log in
- Load exercise library
- Add custom exercise
- Add workout set
- Load history

If any of those fail, check backend logs first before assuming the Android app is broken.
