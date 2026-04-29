require("dotenv").config();

const { Pool } = require("pg");
const argon2 = require("argon2");

const EMAIL = process.env.E2E_EMAIL || "e2e.user@local.test";
const PASSWORD = process.env.E2E_PASSWORD || "e2e-password";
const FIRST = process.env.E2E_FIRST_NAME || "E2E";
const LAST = process.env.E2E_LAST_NAME || "User";

function must(name, value) {
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function main() {
  const pool = new Pool({
    connectionString: must("DATABASE_URL", process.env.DATABASE_URL),
  });

  // Ensure catalog tables exist so exercise library is never empty in fresh envs.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS exercise_templates (
      id SERIAL PRIMARY KEY,
      exercise_name VARCHAR NOT NULL,
      muscle_group VARCHAR NOT NULL,
      exercise_category VARCHAR NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Repair legacy schemas where id exists but is missing a default sequence.
  await pool.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'exercise_templates'
          AND column_name = 'id'
          AND column_default IS NULL
      ) THEN
        IF to_regclass('public.exercise_templates_id_seq') IS NULL THEN
          CREATE SEQUENCE public.exercise_templates_id_seq;
        END IF;

        ALTER TABLE public.exercise_templates
          ALTER COLUMN id SET DEFAULT nextval('public.exercise_templates_id_seq');

        PERFORM setval(
          'public.exercise_templates_id_seq',
          COALESCE((SELECT MAX(id) FROM public.exercise_templates), 0)
        );
      END IF;
    END $$;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_custom_exercises (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      exercise_name VARCHAR NOT NULL,
      muscle_group VARCHAR NOT NULL,
      exercise_category VARCHAR NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(
    `INSERT INTO exercise_templates (exercise_name, muscle_group, exercise_category)
     VALUES ($1,$2,$3), ($4,$5,$6)
     ON CONFLICT DO NOTHING`,
    [
      "Barbell Bench Press",
      "chest",
      "strength",
      "Treadmill Run",
      "cardio",
      "cardio",
    ]
  );

  const hash = await argon2.hash(PASSWORD);

  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
    EMAIL,
  ]);

  let userId;
  if (existing.rows.length > 0) {
    userId = existing.rows[0].id;
    await pool.query(
      "UPDATE users SET password_hash = $1, first_name = $2, last_name = $3 WHERE id = $4",
      [hash, FIRST, LAST, userId]
    );
  } else {
    const inserted = await pool.query(
      "INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1,$2,$3,$4) RETURNING id",
      [EMAIL, hash, FIRST, LAST]
    );
    userId = inserted.rows[0].id;
  }

  console.log(JSON.stringify({ email: EMAIL, password: PASSWORD, userId }, null, 2));

  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

