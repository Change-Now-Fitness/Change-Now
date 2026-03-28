const pool = require("../dbconnection");

const DEFAULT_TEMPLATE_USER_EMAIL = "DEFAULT_EXERCISES";

// Safety net for environments where exercise_templates has not been synced yet.
const FALLBACK_EXERCISE_TEMPLATES = [
  { name: "Barbell Bench Press", muscleGroup: "chest", category: "strength", equipment: "barbell" },
  { name: "Incline Dumbbell Press", muscleGroup: "chest", category: "strength", equipment: "dumbbell" },
  { name: "Cable Fly", muscleGroup: "chest", category: "strength", equipment: "cable" },
  { name: "Barbell Curl", muscleGroup: "biceps", category: "strength", equipment: "barbell" },
  { name: "Hammer Curl", muscleGroup: "biceps", category: "strength", equipment: "dumbbell" },
  { name: "Preacher Curl", muscleGroup: "biceps", category: "strength", equipment: "barbell" },
  { name: "Close-Grip Bench Press", muscleGroup: "triceps", category: "strength", equipment: "barbell" },
  { name: "Skull Crusher", muscleGroup: "triceps", category: "strength", equipment: "barbell" },
  { name: "Rope Pushdown", muscleGroup: "triceps", category: "strength", equipment: "cable" },
  { name: "Wrist Curl", muscleGroup: "forearms", category: "strength", equipment: "barbell" },
  { name: "Reverse Wrist Curl", muscleGroup: "forearms", category: "strength", equipment: "barbell" },
  { name: "Farmer's Walk", muscleGroup: "forearms", category: "strength", equipment: "dumbbell" },
  { name: "Back Squat", muscleGroup: "quads", category: "strength", equipment: "barbell" },
  { name: "Leg Press", muscleGroup: "quads", category: "strength", equipment: "machine" },
  { name: "Bulgarian Split Squat", muscleGroup: "quads", category: "strength", equipment: "dumbbell" },
  { name: "Romanian Deadlift", muscleGroup: "hamstrings", category: "strength", equipment: "barbell" },
  { name: "Seated Leg Curl", muscleGroup: "hamstrings", category: "strength", equipment: "machine" },
  { name: "Nordic Hamstring Curl", muscleGroup: "hamstrings", category: "bodyweight", equipment: "bodyweight" },
  { name: "Barbell Hip Thrust", muscleGroup: "glutes", category: "strength", equipment: "barbell" },
  { name: "Cable Kickback", muscleGroup: "glutes", category: "strength", equipment: "cable" },
  { name: "Glute Bridge", muscleGroup: "glutes", category: "bodyweight", equipment: "bodyweight" },
  { name: "Standing Calf Raise", muscleGroup: "calves", category: "strength", equipment: "machine" },
  { name: "Seated Calf Raise", muscleGroup: "calves", category: "strength", equipment: "machine" },
  { name: "Leg Press Calf Raise", muscleGroup: "calves", category: "strength", equipment: "machine" },
  { name: "Pull-up", muscleGroup: "lats", category: "bodyweight", equipment: "bodyweight" },
  { name: "Lat Pulldown", muscleGroup: "lats", category: "strength", equipment: "cable" },
  { name: "Single-arm Dumbbell Row", muscleGroup: "lats", category: "strength", equipment: "dumbbell" },
  { name: "Face Pull", muscleGroup: "upper back", category: "strength", equipment: "cable" },
  { name: "Seated Cable Row", muscleGroup: "upper back", category: "strength", equipment: "cable" },
  { name: "Chest-supported Row", muscleGroup: "upper back", category: "strength", equipment: "machine" },
  { name: "Deadlift", muscleGroup: "lower back", category: "strength", equipment: "barbell" },
  { name: "Good Morning", muscleGroup: "lower back", category: "strength", equipment: "barbell" },
  { name: "Back Extension", muscleGroup: "lower back", category: "bodyweight", equipment: "bodyweight" },
  { name: "Barbell Shoulder Press", muscleGroup: "shoulders", category: "strength", equipment: "barbell" },
  { name: "Lateral Raise", muscleGroup: "shoulders", category: "strength", equipment: "dumbbell" },
  { name: "Reverse Pec Deck", muscleGroup: "shoulders", category: "strength", equipment: "machine" },
  { name: "Plank", muscleGroup: "abs", category: "bodyweight", equipment: "bodyweight" },
  { name: "Hanging Leg Raise", muscleGroup: "abs", category: "bodyweight", equipment: "bodyweight" },
  { name: "Cable Crunch", muscleGroup: "abs", category: "strength", equipment: "cable" },
  { name: "Treadmill Run", muscleGroup: "cardio", category: "cardio", equipment: "machine" },
  { name: "Jump Rope", muscleGroup: "cardio", category: "cardio", equipment: "other" },
  { name: "Rowing Machine", muscleGroup: "cardio", category: "cardio", equipment: "machine" },
];

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
  equipment: normalizeValue(
    exercise.equipment ?? exercise.exercise_type,
    "other"
  ),
});

const buildTemplateKey = (exercise) => {
  const normalizedExercise = normalizeTemplate(exercise);

  return [
    normalizedExercise.name.toLowerCase(),
    normalizedExercise.muscleGroup,
  ].join("|");
};

async function ensureExerciseTemplatesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS exercise_templates (
      id SERIAL PRIMARY KEY,
      exercise_name VARCHAR NOT NULL,
      muscle_group VARCHAR NOT NULL,
      exercise_category VARCHAR NOT NULL,
      exercise_type TEXT NOT NULL,
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

async function ensureUserCustomExercisesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_custom_exercises (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      exercise_name VARCHAR NOT NULL,
      muscle_group VARCHAR NOT NULL,
      exercise_category VARCHAR NOT NULL,
      exercise_type TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS user_custom_exercises_unique_idx
      ON user_custom_exercises (user_id, exercise_name, muscle_group)
  `);
}

async function ensureExerciseCatalogTables() {
  await ensureExerciseTemplatesTable();
  await ensureUserCustomExercisesTable();
}

async function getExerciseTemplates() {
  await ensureExerciseTemplatesTable();

  const templateRows = await pool.query(
    `SELECT exercise_name,
            muscle_group,
            exercise_category,
            exercise_type
       FROM exercise_templates
      ORDER BY LOWER(exercise_name) ASC,
               LOWER(muscle_group) ASC`
  );

  if (templateRows.rows.length > 0) {
    return templateRows.rows.map(normalizeTemplate);
  }

  return FALLBACK_EXERCISE_TEMPLATES.map(normalizeTemplate);
}

const buildTemplateInsertStatement = (exercises) => {
  const values = [];
  const placeholders = exercises.map((exercise, index) => {
    const offset = index * 4;
    values.push(
      exercise.name,
      exercise.muscleGroup,
      exercise.category,
      exercise.equipment
    );

    return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`;
  });

  return {
    text:
      "INSERT INTO exercise_templates " +
      "(exercise_name, muscle_group, exercise_category, exercise_type) VALUES " +
      placeholders.join(", "),
    values,
  };
};

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
              exercise_category,
              exercise_type
         FROM (
           SELECT DISTINCT ON (
                    LOWER(TRIM(exercise.exercise_name)),
                    LOWER(TRIM(exercise.muscle_group))
                  )
                  exercise.exercise_name,
                  exercise.muscle_group,
                  exercise.exercise_category,
                  exercise.exercise_type
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
                     CASE
                       WHEN LOWER(TRIM(COALESCE(exercise.exercise_type, 'other'))) = 'other' THEN 1
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
