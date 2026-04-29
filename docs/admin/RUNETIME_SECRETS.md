Secrets and configuration
Two separate places:

CI secrets (GitHub): used for CI and deployment wiring
Runtime secrets (EC2): used by the production backend process
GitHub secrets (examples):

EC2_INSTANCE_ID (SSM deploy target)
Optional: test DB/JWT secrets if the CI test job needs them

CI testing note:

CI runs backend integration tests and Playwright E2E tests that can write to the database (seeding a test user and exercise template rows).
For safety, DATABASE_URL stored in GitHub Secrets should point to a dedicated test database (not the production database).
EC2 runtime env:

/opt/change-now/backend.env is the production env file.
The deploy script must run Docker with --env-file /opt/change-now/backend.env (or equivalent).
Do not commit production values into the repo.
Supabase database:

DATABASE_URL must be a Postgres URI from Supabase Database settings.
If the password contains special characters, ensure they are URL-encoded or use a generated password that avoids URL-reserved characters.
JWT:

Use JWT_SECRET (this is what the backend code expects).
Rotating JWT_SECRET invalidates existing tokens; users may need to log in again.
If secrets were posted in screenshots/chats/logs:

Rotate Supabase DB password and update DATABASE_URL.
Rotate JWT_SECRET.
