const pool = require("../dbconnection");
const {
  ensureExerciseCatalogTables,
} = require("../services/exerciseCatalog");
const {
  CUSTOM_SOURCE,
  TEMPLATE_SOURCE,
  parseExerciseId,
  serializeExerciseId,
} = require("../services/exerciseIdentifiers");

const LEGACY_MUSCLE_GROUPS = {
  back: "lats",
  core: "abs",
  legs: "quads",
  shoulder: "shoulders",
};

const normalizeName = (value) =>
  typeof value === "string" ? value.trim() : "";

const normalizeValue = (value, fallback = "") => {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  return normalized || fallback;
};

const parseUserId = (value) => {
  const parsedUserId = Number.parseInt(String(value ?? ""), 10);
  return Number.isNaN(parsedUserId) ? null : parsedUserId;
};

const normalizeMuscleGroup = (value) => {
  const normalizedGroup = normalizeValue(value, "");
  return LEGACY_MUSCLE_GROUPS[normalizedGroup] ?? normalizedGroup;
};

const mapTemplateRow = (row) => ({
  id: serializeExerciseId(TEMPLATE_SOURCE, row.id),
  name: row.exercise_name,
  type: normalizeValue(row.exercise_category, "strength"),
  muscleGroup: normalizeMuscleGroup(row.muscle_group),
  isCustom: false,
  userId: null,
});

const mapCustomRow = (row) => ({
  id: serializeExerciseId(CUSTOM_SOURCE, row.id),
  name: row.exercise_name,
  type: normalizeValue(row.exercise_category, "strength"),
  muscleGroup: normalizeMuscleGroup(row.muscle_group),
  isCustom: true,
  userId: row.user_id,
});

/**
 * Exercise controller layer.
 *
 * How it fits:
 * - These handlers are mounted by `backend/routes/exerciseRoutes.js`.
 * - They unify legacy/template/custom exercise models into one API shape for the frontend.
 */
const getExercises = async (req, res) => {
  const search = normalizeValue(req.query.search, "");
  const muscleGroup = normalizeValue(req.query.muscleGroup, "");
  const type = normalizeValue(req.query.type, "");
  const includeCustom = req.query.includeCustom !== "false";
  const userId = parseUserId(req.query.userId);

  if (userId === null) {
    return res.status(400).json({ message: "A valid userId query param is required" });
  }

  try {
    await ensureExerciseCatalogTables();

    const [templateRows, customRows] = await Promise.all([
      pool.query(
        `SELECT id,
                exercise_name,
                muscle_group,
                exercise_category
           FROM exercise_templates`
      ),
      pool.query(
        `SELECT id,
                user_id,
                exercise_name,
                muscle_group,
                exercise_category
           FROM user_custom_exercises
          WHERE user_id = $1`,
        [userId]
      ),
    ]);

    let filteredExercises = [
      ...templateRows.rows.map(mapTemplateRow),
      ...customRows.rows.map(mapCustomRow),
    ];

    if (!includeCustom) {
      filteredExercises = filteredExercises.filter((exercise) => !exercise.isCustom);
    }

    if (muscleGroup) {
      filteredExercises = filteredExercises.filter(
        (exercise) => exercise.muscleGroup === muscleGroup
      );
    }

    if (type) {
      filteredExercises = filteredExercises.filter((exercise) => exercise.type === type);
    }

    if (search) {
      filteredExercises = filteredExercises.filter((exercise) =>
        exercise.name.toLowerCase().includes(search)
      );
    }

    filteredExercises.sort((left, right) =>
      left.name.localeCompare(right.name, undefined, { sensitivity: "base" })
    );

    return res.json(filteredExercises);
  } catch (error) {
    console.error("Failed to fetch exercises:", error);
    return res.status(500).json({ message: "Failed to fetch exercises" });
  }
};

/**
 * Create a user custom exercise if it doesn't already exist.
 *
 * Used by POST `/exercises`.
 */
const createExercise = async (req, res) => {
  const name = normalizeName(req.body.name);
  const userId = parseUserId(req.body.userId);
  const muscleGroup = normalizeValue(req.body.muscleGroup, "chest");
  const type = normalizeValue(req.body.type, "strength");

  if (!name) {
    return res.status(400).json({ message: "Exercise name is required" });
  }

  if (userId === null) {
    return res.status(400).json({ message: "A valid userId is required" });
  }

  try {
    await ensureExerciseCatalogTables();

    const duplicateCheck = await pool.query(
      `SELECT 1
         FROM exercise_templates
        WHERE LOWER(TRIM(exercise_name)) = LOWER(TRIM($1))
          AND LOWER(TRIM(muscle_group)) = LOWER(TRIM($2))
       UNION ALL
       SELECT 1
         FROM user_custom_exercises
        WHERE user_id = $3
          AND LOWER(TRIM(exercise_name)) = LOWER(TRIM($1))
          AND LOWER(TRIM(muscle_group)) = LOWER(TRIM($2))
       LIMIT 1`,
      [name, muscleGroup, userId]
    );

    if (duplicateCheck.rowCount > 0) {
      return res.status(409).json({
        message: "An exercise with that name and muscle group already exists",
      });
    }

    const insertResult = await pool.query(
      `INSERT INTO user_custom_exercises
        (user_id, exercise_name, muscle_group, exercise_category)
       VALUES ($1, $2, $3, $4)
       RETURNING id,
                 user_id,
                 exercise_name,
                 muscle_group,
                 exercise_category`,
      [userId, name, muscleGroup, type]
    );

    return res.status(201).json(mapCustomRow(insertResult.rows[0]));
  } catch (error) {
    console.error("Failed to create exercise:", error);
    return res.status(500).json({ message: "Failed to create exercise" });
  }
};

/**
 * Delete a user custom exercise.
 *
 * Used by DELETE `/exercises/{id}`.
 */
const deleteExercise = async (req, res) => {
  const parsedExerciseId = parseExerciseId(req.params.id);
  const userId = parseUserId(req.query.userId ?? req.body?.userId);

  if (!parsedExerciseId) {
    return res.status(400).json({ message: "Exercise id is invalid" });
  }

  if (userId === null) {
    return res.status(400).json({ message: "A valid userId is required" });
  }

  if (parsedExerciseId.source !== CUSTOM_SOURCE) {
    return res.status(400).json({ message: "Only custom exercises can be deleted" });
  }

  try {
    await ensureExerciseCatalogTables();

    const deleteResult = await pool.query(
      `DELETE FROM user_custom_exercises
        WHERE id = $1
          AND user_id = $2
      RETURNING id`,
      [parsedExerciseId.id, userId]
    );

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ message: "Exercise not found" });
    }

    return res.json({ message: "Exercise deleted successfully" });
  } catch (error) {
    console.error("Failed to delete exercise:", error);
    return res.status(500).json({ message: "Failed to delete exercise" });
  }
};

module.exports = {
  getExercises,
  createExercise,
  deleteExercise,
};
