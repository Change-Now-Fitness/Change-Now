const pool = require("../dbconnection");
const { ensureDefaultExercises } = require("../services/exerciseCatalog");

const LEGACY_MUSCLE_GROUPS = {
  back: "lats",
  core: "abs",
  legs: "quads",
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

const mapExerciseRow = (row) => ({
  id: row.id,
  name: row.exercise_name,
  type: normalizeValue(row.exercise_category, "strength"),
  muscleGroup: normalizeMuscleGroup(row.muscle_group),
  equipment: normalizeValue(row.exercise_type, "other"),
  isCustom: Boolean(row.is_custom),
  userId: row.user_id,
});

const getExercises = async (req, res) => {
  const search = normalizeValue(req.query.search, "");
  const muscleGroup = normalizeValue(req.query.muscleGroup, "");
  const type = normalizeValue(req.query.type, "");
  const equipment = normalizeValue(req.query.equipment, "");
  const includeCustom = req.query.includeCustom !== "false";
  const userId = parseUserId(req.query.userId);

  if (userId === null) {
    return res.status(400).json({ message: "A valid userId query param is required" });
  }

  try {
    await ensureDefaultExercises(userId);

    const queryResult = await pool.query(
      `SELECT id,
              user_id,
              exercise_name,
              muscle_group,
              exercise_category,
              exercise_type,
              is_custom
         FROM exercise
        WHERE user_id = $1
        ORDER BY LOWER(exercise_name) ASC`,
      [userId]
    );

    let filteredExercises = queryResult.rows.map(mapExerciseRow);

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

    if (equipment) {
      filteredExercises = filteredExercises.filter(
        (exercise) => exercise.equipment === equipment
      );
    }

    if (search) {
      filteredExercises = filteredExercises.filter((exercise) =>
        exercise.name.toLowerCase().includes(search)
      );
    }

    return res.json(filteredExercises);
  } catch (error) {
    console.error("Failed to fetch exercises:", error);
    return res.status(500).json({ message: "Failed to fetch exercises" });
  }
};

const createExercise = async (req, res) => {
  const name = normalizeName(req.body.name);
  const userId = parseUserId(req.body.userId);

  if (!name) {
    return res.status(400).json({ message: "Exercise name is required" });
  }

  if (userId === null) {
    return res.status(400).json({ message: "A valid userId is required" });
  }

  try {
    const insertResult = await pool.query(
      `INSERT INTO exercise
        (user_id, exercise_name, muscle_group, exercise_category, exercise_type, is_custom)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id,
                 user_id,
                 exercise_name,
                 muscle_group,
                 exercise_category,
                 exercise_type,
                 is_custom`,
      [
        userId,
        name,
        normalizeValue(req.body.muscleGroup, "chest"),
        normalizeValue(req.body.type, "strength"),
        normalizeValue(req.body.equipment, "barbell"),
      ]
    );

    return res.status(201).json(mapExerciseRow(insertResult.rows[0]));
  } catch (error) {
    console.error("Failed to create exercise:", error);
    return res.status(500).json({ message: "Failed to create exercise" });
  }
};

const deleteExercise = async (req, res) => {
  const exerciseId = Number.parseInt(req.params.id, 10);
  const userId = parseUserId(req.query.userId ?? req.body?.userId);

  if (Number.isNaN(exerciseId)) {
    return res.status(400).json({ message: "Exercise id must be a number" });
  }

  if (userId === null) {
    return res.status(400).json({ message: "A valid userId is required" });
  }

  try {
    const deleteResult = await pool.query(
      `DELETE FROM exercise
        WHERE id = $1
          AND user_id = $2
          AND is_custom = true
      RETURNING id`,
      [exerciseId, userId]
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
