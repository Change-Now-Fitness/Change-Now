# Change-Now Beta Binary Distribution

This package contains an installable beta distribution for administrators.

## Package Contents

- `frontend-dist/` - built web frontend artifact (`expo export --platform web`)
- `backend-runtime/` - runnable Node/Express backend package
- `backend-runtime/.env.example` - backend environment template (no secrets)
- `live-urls.md` - stable deployed beta URLs

## Prerequisites

- Node.js `v20.20.0`
- npm `10.8.2`
- Network access to PostgreSQL database (not packaged per assignment rubric)

## Install and Run (Local Binary Package)

Run backend first:

```bash
cd backend-runtime
cp .env.example .env
npm install
npm start
```

The backend starts on `http://localhost:4000` by default.

Run frontend build artifact in a second terminal:

```bash
cd frontend-dist
npx serve .
```

If `serve` is not available, use:

```bash
python3 -m http.server 3000
```

Then open `http://localhost:3000`.

## Working Commands / Features in Beta

The following operations are implemented end-to-end (client -> server -> client):

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/requireAuth`
- `GET /exercises?userId=<id>`
- `POST /exercises`
- `DELETE /exercises/:id`
- `GET /workouts/:exerciseId/current?userId=<id>&date=<yyyy-mm-dd>`
- `POST /workouts/sets`
- `GET /workouts/:exerciseId/history?userId=<id>`

UI flows currently working in beta:

- account signup/login
- exercise library loading/filtering
- custom exercise creation
- add workout sets
- current sets retrieval
- exercise history retrieval

## Known Issues

- Favicon warning appears during frontend build (`assets/images/favicon.png` missing).
- Backend relies on external PostgreSQL database credentials in `.env`; database is intentionally not packaged.
- CORS is configured for local HTTP and one deployed frontend origin; additional deployed origins must be explicitly added for remote browser testing.
- API response messaging is still being standardized across routes.

## Isolation for Stable Beta

This distribution is intended to be run independently of ongoing development:

- local package uses `localhost` ports (frontend static host + backend `4000`)
- deployed beta URLs are documented separately in `live-urls.md`
- source development branch/workflow is not required to run this package
