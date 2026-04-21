# ChangeNow Course Staff Access

## Bug Database Access

The bug database for this project is GitHub Issues:

- Repository: `https://github.com/Change-Now-Fitness/Change-Now`
- Issues: `https://github.com/Change-Now-Fitness/Change-Now/issues`

## System Database Access

The application uses a PostgreSQL database hosted outside this package. The database itself is intentionally not bundled.

For grading convenience, the packaged backend already includes a ready-to-run `.env` file containing the course-use backend connection values.

Course staff can inspect those values in the unzipped backend package here:

- `ChangeNow-backend-server/.env`

If direct database access is needed outside the backend app, use the connection values from that `.env` file with a command in this format:

```powershell
psql "postgresql://USERNAME:PASSWORD@HOST:PORT/postgres"
```

The backend uses that same `.env` directly for startup, so no additional credential setup should be required for grading.

## Credential Note

- The packaged `.env` is included only to reduce setup work for course staff.
- Those credentials should be rotated by the team after grading is complete.
