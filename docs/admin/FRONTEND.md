Frontend (dev + runtime)
What it is:

Expo/React Native frontend located in frontend/
It calls the backend via a base API URL.
Key paths:

frontend/app/ (screens/routes)
frontend/lib/api.ts (typical place where API base URL is used)
frontend/services/auth.ts (auth client logic)
frontend/.env (local environment values)
Important config:

API base URL is typically set via an Expo public env var (example: EXPO_PUBLIC_API_URL).
In local dev, it may be http://localhost:4000.
In production, it should be the public domain served by Nginx (https).
Local dev (typical):

Install deps: npm run ci:all (repo root) or npm install in frontend/ depending on scripts
Start frontend: npm run start (or Expo command used by the project)
Common pitfalls:

Wrong API URL (frontend points at localhost while running on device)
CORS or cookie/auth mismatch between mobile and web (check backend CORS config)
