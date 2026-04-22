/**
 * Exercise catalog service (templates + per-user custom exercises).
 *
 * How it fits:
 * - Supports exercise library + workout logging endpoints.
 * - Creates/updates normalized tables (exercise_templates, user_custom_exercises).
 * - Provides a fallback template list so the app can function before a full sync.
 */
const pool = require("../dbconnection");

const DEFAULT_TEMPLATE_USER_EMAIL = "DEFAULT_EXERCISES";

// Safety net for environments where exercise_templates has not been synced yet.
const FALLBACK_EXERCISE_TEMPLATES = [
  ["Barbell Bench Press", "chest", "strength"],
  ["Incline Dumbbell Press", "chest", "strength"],
  ["Cable Fly", "chest", "strength"],
  ["Barbell Curl", "biceps", "strength"],
  ["Hammer Curl", "biceps", "strength"],
  ["Preacher Curl", "biceps", "strength"],
  ["Close-Grip Bench Press", "triceps", "strength"],
  ["Skull Crusher", "triceps", "strength"],
  ["Rope Pushdown", "triceps", "strength"],
  ["Wrist Curl", "forearms", "strength"],
  ["Reverse Wrist Curl", "forearms", "strength"],
  ["Farmer's Walk", "forearms", "strength"],
  ["Back Squat", "quads", "strength"],
  ["Leg Press", "quads", "strength"],
  ["Bulgarian Split Squat", "quads", "strength"],
  ["Romanian Deadlift", "hamstrings", "strength"],
  ["Seated Leg Curl", "hamstrings", "strength"],
  ["Nordic Hamstring Curl", "hamstrings", "bodyweight"],
  ["Barbell Hip Thrust", "glutes", "strength"],
  ["Cable Kickback", "glutes", "strength"],
  ["Glute Bridge", "glutes", "bodyweight"],
  ["Standing Calf Raise", "calves", "strength"],
  ["Seated Calf Raise", "calves", "strength"],
  ["Leg Press Calf Raise", "calves", "strength"],
  ["Pull-up", "lats", "bodyweight"],
  ["Lat Pulldown", "lats", "strength"],
  ["Single-arm Dumbbell Row", "lats", "strength"],
  ["Face Pull", "upper back", "strength"],
  ["Seated Cable Row", "upper back", "strength"],
  ["Chest-supported Row", "upper back", "strength"],
  ["Deadlift", "lower back", "strength"],
  ["Good Morning", "lower back", "strength"],
  ["Back Extension", "lower back", "bodyweight"],
  ["Barbell Shoulder Press", "shoulders", "strength"],
  ["Lateral Raise", "shoulders", "strength"],
  ["Reverse Pec Deck", "shoulders", "strength"],
  ["Plank", "abs", "bodyweight"],
  ["Hanging Leg Raise", "abs", "bodyweight"],
  ["Cable Crunch", "abs", "strength"],
  ["Treadmill Run", "cardio", "cardio"],
  ["Jump Rope", "cardio", "cardio"],
  ["Rowing Machine", "cardio", "cardio"],
].map(([name, muscleGroup, category]) => ({
  name,
  muscleGroup,
  category,
}));

const normalizeName = (value) =>
  typeof value === "string" ? value.trim() : "";

const normalizeValue = (value, fallback = "") => {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  return normalized || fallback;
};

const normalizeTemplate = (exercise) => ({
  name: normalizeName(exercise.name ?? exercise.exercise_name),
  muscleGroup: normalizeValue(exercise.muscleGroup ?? exercise.muscle_group, ""),
  category: normalizeValue(
    exercise.category ?? exercise.exercise_category,
    "strength"
  ),
});

/**
 * Ensure the template table exists and has its expected uniqueness constraint.
 */
async function ensureExerciseTemplatesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS exercise_templates (
      id SERIAL PRIMARY KEY,
      exercise_name VARCHAR NOT NULL,
      muscle_group VARCHAR NOT NULL,
      exercise_category VARCHAR NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(
    "DROP INDEX IF EXISTS exercise_templates_unique_idx"
  );
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS exercise_templates_name_group_unique_idx
      ON exercise_templates (exercise_name, muscle_group)
  `);
}

/**
 * Ensure the per-user custom exercise table exists.
 */
async function ensureUserCustomExercisesTable() {
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

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS user_custom_exercises_unique_idx
      ON user_custom_exercises (user_id, exercise_name, muscle_group)
  `);
}

/**
 * Ensure the exercise catalog tables exist.
 *
 * Called by endpoints before reads/writes so fresh environments self-heal.
 */
async function ensureExerciseCatalogTables() {
  await ensureExerciseTemplatesTable();
  await ensureUserCustomExercisesTable();
}

/**
 * Read the template exercise catalog; fall back to a baked-in list if empty.
 */
async function getExerciseTemplates() {
  await ensureExerciseTemplatesTable();

  const templateRows = await pool.query(
    `SELECT exercise_name,
            muscle_group,
            exercise_category
       FROM exercise_templates
      ORDER BY LOWER(exercise_name) ASC,
               LOWER(muscle_group) ASC`
  );

  if (templateRows.rows.length > 0) {
    return templateRows.rows.map(normalizeTemplate);
  }

  return FALLBACK_EXERCISE_TEMPLATES.map(normalizeTemplate);
}

/**
 * Build a single INSERT statement for bulk template upserts.
 */
const buildTemplateInsertStatement = (exercises) => {
  const values = [];
  const placeholders = exercises.map((exercise, index) => {
    const offset = index * 3;
    values.push(
      exercise.name,
      exercise.muscleGroup,
      exercise.category
    );

    return `($${offset + 1}, $${offset + 2}, $${offset + 3})`;
  });

  return {
    text:
      "INSERT INTO exercise_templates " +
      "(exercise_name, muscle_group, exercise_category) VALUES " +
      placeholders.join(", "),
    values,
  };
};

/**
 * Admin sync: rebuild `exercise_templates` from a designated "template user".
 *
 * Used by scripts and operational workflows.
 */
async function syncExerciseTemplatesFromUser(
  templateEmail = DEFAULT_TEMPLATE_USER_EMAIL
) {
  const normalizedTemplateEmail = normalizeName(templateEmail);

  if (!normalizedTemplateEmail) {
    throw new Error("A template email is required to sync exercise templates");
  }

  await ensureExerciseTemplatesTable();
  await pool.query("BEGIN");

  try {
    const sourceExercises = await pool.query(
      `SELECT exercise_name,
              muscle_group,
              exercise_category
         FROM (
           SELECT DISTINCT ON (
                    LOWER(TRIM(exercise.exercise_name)),
                    LOWER(TRIM(exercise.muscle_group))
                  )
                  exercise.exercise_name,
                  exercise.muscle_group,
                  exercise.exercise_category
             FROM exercise
             JOIN users
               ON users.id = exercise.user_id
            WHERE users.email = $1
              AND COALESCE(exercise.is_custom, false) = false
            ORDER BY LOWER(TRIM(exercise.exercise_name)) ASC,
                     LOWER(TRIM(exercise.muscle_group)) ASC,
                     CASE
                       WHEN LOWER(TRIM(exercise.exercise_category)) = 'temp' THEN 1
                       ELSE 0
                     END ASC,
                     exercise.id DESC
         ) source_exercises
        ORDER BY LOWER(exercise_name) ASC,
                 LOWER(muscle_group) ASC`,
      [normalizedTemplateEmail]
    );

    if (sourceExercises.rows.length === 0) {
      throw new Error(
        `No non-custom exercises were found for template user ${normalizedTemplateEmail}`
      );
    }

    const normalizedTemplates = sourceExercises.rows.map(normalizeTemplate);

    await pool.query("TRUNCATE TABLE exercise_templates RESTART IDENTITY");
    const insertStatement = buildTemplateInsertStatement(normalizedTemplates);
    await pool.query(insertStatement.text, insertStatement.values);
    await pool.query("COMMIT");

    return {
      syncedCount: normalizedTemplates.length,
      sourceEmail: normalizedTemplateEmail,
    };
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  }
}

async function preloadExerciseCatalog() {
  await ensureExerciseCatalogTables();
  const templates = await getExerciseTemplates();

  return {
    insertedCount: 0,
    totalCount: templates.length,
  };
}

module.exports = {
  DEFAULT_TEMPLATE_USER_EMAIL,
  ensureExerciseCatalogTables,
  ensureExerciseTemplatesTable,
  ensureUserCustomExercisesTable,
  getExerciseTemplates,
  preloadExerciseCatalog,
  syncExerciseTemplatesFromUser,
};
