/**
 * Postgres connection pool.
 *
 * How it fits:
 * - Imported by route handlers/controllers that need database access.
 * - Uses `process.env.DATABASE_URL` (configured at runtime in prod via env-file).
 */
// Connect to Postgres with `pg`
const { Pool } = require('pg');
// Shared connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = pool