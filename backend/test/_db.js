const { Pool } = require("pg");
const argon2 = require("argon2");

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  return url && url.trim().length > 0 ? url : null;
}

function createTestPool() {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    return null;
  }
  return new Pool({ connectionString: databaseUrl });
}

async function ensureUser(pool, { email, password, firstName, lastName }) {
  const passwordHash = await argon2.hash(password);

  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);

  if (existing.rows.length > 0) {
    const id = existing.rows[0].id;
    await pool.query(
      "UPDATE users SET password_hash = $1, first_name = $2, last_name = $3 WHERE id = $4",
      [passwordHash, firstName, lastName, id]
    );
    return { id };
  }

  const inserted = await pool.query(
    "INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1,$2,$3,$4) RETURNING id",
    [email, passwordHash, firstName, lastName]
  );

  return { id: inserted.rows[0].id };
}

async function deleteUserByEmail(pool, email) {
  await pool.query("DELETE FROM users WHERE email = $1", [email]);
}

module.exports = {
  getDatabaseUrl,
  createTestPool,
  ensureUser,
  deleteUserByEmail,
};

