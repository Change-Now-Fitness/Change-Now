require("dotenv").config();

const pool = require("../dbconnection");
const {
  DEFAULT_TEMPLATE_USER_EMAIL,
  ensureExerciseCatalogTables,
  syncExerciseTemplatesFromUser,
} = require("../services/exerciseCatalog");

async function ensureWorkoutLogNormalizedColumns() {
  await pool.query(`
    ALTER TABLE workout_log
    ADD COLUMN IF NOT EXISTS exercise_template_id INTEGER,
    ADD COLUMN IF NOT EXISTS user_custom_exercise_id INTEGER
  `);

  await pool.query(`
    ALTER TABLE workout_log
    ALTER COLUMN exercise_id DROP NOT NULL
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS workout_log_exercise_template_id_idx
      ON workout_log (exercise_template_id)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS workout_log_user_custom_exercise_id_idx
      ON workout_log (user_custom_exercise_id)
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'workout_log_exercise_template_id_fkey'
      ) THEN
        ALTER TABLE workout_log
        ADD CONSTRAINT workout_log_exercise_template_id_fkey
        FOREIGN KEY (exercise_template_id)
        REFERENCES exercise_templates(id);
      END IF;
    END $$;
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'workout_log_user_custom_exercise_id_fkey'
      ) THEN
        ALTER TABLE workout_log
        ADD CONSTRAINT workout_log_user_custom_exercise_id_fkey
        FOREIGN KEY (user_custom_exercise_id)
        REFERENCES user_custom_exercises(id);
      END IF;
    END $$;
  `);
}

async function migrateLegacyCustomExercises() {
  const result = await pool.query(`
    INSERT INTO user_custom_exercises (
      user_id,
      exercise_name,
      muscle_group,
      exercise_category,
      exercise_type
    )
    SELECT legacy.user_id,
           legacy.exercise_name,
           legacy.muscle_group,
           legacy.exercise_category,
           COALESCE(legacy.exercise_type, 'other')
      FROM (
        SELECT DISTINCT ON (
                 exercise.user_id,
                 LOWER(TRIM(exercise.exercise_name)),
                 LOWER(TRIM(exercise.muscle_group))
               )
               exercise.user_id,
               exercise.exercise_name,
               exercise.muscle_group,
               exercise.exercise_category,
               exercise.exercise_type,
               exercise.id
          FROM exercise
         WHERE COALESCE(exercise.is_custom, false) = true
         ORDER BY exercise.user_id ASC,
                  LOWER(TRIM(exercise.exercise_name)) ASC,
                  LOWER(TRIM(exercise.muscle_group)) ASC,
                  exercise.id DESC
      ) legacy
    ON CONFLICT (user_id, exercise_name, muscle_group) DO NOTHING
    RETURNING id
  `);

  return result.rowCount;
}

async function migrateWorkoutLogsToNormalizedRefs() {
  const customResult = await pool.query(`
    WITH updated AS (
      UPDATE workout_log AS wl
         SET user_custom_exercise_id = uc.id
        FROM exercise AS legacy
        JOIN user_custom_exercises AS uc
          ON uc.user_id = legacy.user_id
         AND LOWER(TRIM(uc.exercise_name)) = LOWER(TRIM(legacy.exercise_name))
         AND LOWER(TRIM(uc.muscle_group)) = LOWER(TRIM(legacy.muscle_group))
       WHERE wl.exercise_id = legacy.id
         AND wl.user_custom_exercise_id IS NULL
         AND COALESCE(legacy.is_custom, false) = true
      RETURNING wl.id
    )
    SELECT COUNT(*)::int AS count FROM updated
  `);

  const templateResult = await pool.query(`
    WITH updated AS (
      UPDATE workout_log AS wl
         SET exercise_template_id = et.id
        FROM exercise AS legacy
        JOIN exercise_templates AS et
          ON LOWER(TRIM(et.exercise_name)) = LOWER(TRIM(legacy.exercise_name))
         AND LOWER(TRIM(et.muscle_group)) = LOWER(TRIM(legacy.muscle_group))
       WHERE wl.exercise_id = legacy.id
         AND wl.exercise_template_id IS NULL
         AND COALESCE(legacy.is_custom, false) = false
      RETURNING wl.id
    )
    SELECT COUNT(*)::int AS count FROM updated
  `);

  const nullLegacyRefResult = await pool.query(`
    WITH updated AS (
      UPDATE workout_log
         SET exercise_id = NULL
       WHERE exercise_id IS NOT NULL
         AND (exercise_template_id IS NOT NULL OR user_custom_exercise_id IS NOT NULL)
      RETURNING id
    )
    SELECT COUNT(*)::int AS count FROM updated
  `);

  return {
    customLogsUpdated: customResult.rows[0].count,
    templateLogsUpdated: templateResult.rows[0].count,
    legacyRefsCleared: nullLegacyRefResult.rows[0].count,
  };
}

(async () => {
  try {
    const syncSummary = await syncExerciseTemplatesFromUser(
      process.argv[2] || DEFAULT_TEMPLATE_USER_EMAIL
    );

    await ensureExerciseCatalogTables();
    await pool.query("BEGIN");

    await ensureWorkoutLogNormalizedColumns();
    const migratedCustomCount = await migrateLegacyCustomExercises();
    const workoutLogSummary = await migrateWorkoutLogsToNormalizedRefs();

    await pool.query("COMMIT");

    console.log(
      JSON.stringify(
        {
          syncSummary,
          migratedCustomCount,
          workoutLogSummary,
        },
        null,
        2
      )
    );
  } catch (error) {
    await pool.query("ROLLBACK").catch(() => {});
    console.error("Failed to migrate normalized exercise model:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
