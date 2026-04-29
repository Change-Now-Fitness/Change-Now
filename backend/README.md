## Backend Setup

```bash
npm install
npm run validate:env
npm start
```

For local development, copy values from [backend/.env.example](/c:/Change-Now/backend/.env.example:1).

For hosted Android testing, follow [docs/deployment/android-testing-backend.md](/c:/Change-Now/docs/deployment/android-testing-backend.md:1).

## Main Files: 

- [server.js](/c:/Change-Now/backend/server.js:1): Express server, route mounting, health checks, Swagger
- [routes/auth.js](/c:/Change-Now/backend/routes/auth.js:1): signup, login, auth validation
- [routes/user.js](/c:/Change-Now/backend/routes/user.js:1): profile and logout
- [routes/workouts.js](/c:/Change-Now/backend/routes/workouts.js:1): current sets, history, set creation and deletion
- [dbconnection.js](/c:/Change-Now/backend/dbconnection.js:1): PostgreSQL connection pool





