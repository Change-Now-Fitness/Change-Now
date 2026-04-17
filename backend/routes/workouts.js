

const express = require("express");

const router = express.Router();
const pool = require("../dbconnection");
const {
  ensureExerciseCatalogTables,
} = require("../services/exerciseCatalog");
const {
  CUSTOM_SOURCE,
  LEGACY_SOURCE,
  TEMPLATE_SOURCE,
  parseExerciseId,
} = require("../services/exerciseIdentifiers");

const parseNumber = (value) => {
  const parsedValue = Number.parseInt(String(value ?? ""), 10);
  return Number.isNaN(parsedValue) ? null : parsedValue;
};

const buildWorkoutReferenceConfig = (exerciseReference) => {
  switch (exerciseReference.source) {
    case TEMPLATE_SOURCE:
      return {
        whereClause: "exercise_template_id = $1",
        insertColumn: "exercise_template_id",
      };
    case CUSTOM_SOURCE:
      return {
        whereClause: "user_custom_exercise_id = $1",
        insertColumn: "user_custom_exercise_id",
      };
    case LEGACY_SOURCE:
      return {
        whereClause: "exercise_id = $1",
        insertColumn: "exercise_id",
      };
    default:
      return null;
  }
};

router.get("/:exerciseId/current", async (req, res) => {
  const exerciseReference = parseExerciseId(req.params.exerciseId);
  const userId = parseNumber(req.query.userId);
  const today = new Date().toISOString().split("T")[0];

  if (!exerciseReference) {
    return res.status(400).json({ error: "Exercise id is invalid" });
  }

  if (userId === null) {
    return res.status(400).json({ error: "A valid userId is required" });
  }

  const referenceConfig = buildWorkoutReferenceConfig(exerciseReference);

  try {
    await ensureExerciseCatalogTables();

    const result = await pool.query(
      `SELECT id, reps, weight
         FROM workout_log
        WHERE ${referenceConfig.whereClause}
          AND user_id = $2
          AND created_at >= $3::date
          AND created_at < ($3::date + interval '1 day')
        ORDER BY created_at ASC`,
      [exerciseReference.id, userId, today]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/sets", async (req, res) => {
  const exerciseReference = parseExerciseId(req.body.exerciseId);
  const userId = parseNumber(req.body.userId);
  const weight = Number.parseFloat(req.body.weight);
  const reps = parseNumber(req.body.reps);

  if (!exerciseReference) {
    return res.status(400).json({ error: "Exercise id is invalid" });
  }

  if (userId === null) {
    return res.status(400).json({ error: "A valid userId is required" });
  }

  if (Number.isNaN(weight) || reps === null) {
    return res.status(400).json({ error: "Weight and reps are required" });
  }

  const referenceConfig = buildWorkoutReferenceConfig(exerciseReference);

  try {
    await ensureExerciseCatalogTables();

    const result = await pool.query(
      `INSERT INTO workout_log (${referenceConfig.insertColumn}, user_id, weight, reps)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [exerciseReference.id, userId, weight, reps]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

router.delete("/sets/:setId", async (req, res) => {
  const setId = parseNumber(req.params.setId);
  const userId = parseNumber(req.query.userId);

  if (setId === null) {
    return res.status(400).json({ error: "A valid setId is required" });
  }

  if (userId === null) {
    return res.status(400).json({ error: "A valid userId is required" });
  }

  try {
    await ensureExerciseCatalogTables();

    const result = await pool.query(
      `DELETE FROM workout_log
        WHERE id = $1
          AND user_id = $2
       RETURNING id`,
      [setId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Set not found" });
    }

    return res.json({ deletedSetId: result.rows[0].id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Database error" });
  }
});

router.get("/:exerciseId/history", async (req, res) => {
  const exerciseReference = parseExerciseId(req.params.exerciseId);
  const userId = parseNumber(req.query.userId);
  const today = new Date().toISOString().split("T")[0];

  console.log('exerciseReference:', exerciseReference);
  console.log('userId:', userId);

  if (!exerciseReference) {
    return res.status(400).json({ error: "Exercise id is invalid" });
  }

  if (userId === null) {
    return res.status(400).json({ error: "A valid userId is required" });
  }

  const referenceConfig = buildWorkoutReferenceConfig(exerciseReference);

  try {
    await ensureExerciseCatalogTables();

    const result = await pool.query(
      `SELECT reps, weight, created_at
        FROM workout_log
        WHERE ${referenceConfig.whereClause}
          AND user_id = $2
          AND created_at < $3::date
        ORDER BY created_at DESC`,
      [exerciseReference.id, userId, today]
    );

    // Group rows by date
    const grouped = {};
    for (const row of result.rows) {
      const date = row.created_at.toISOString().split("T")[0];
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push({ weight: row.weight, reps: row.reps });
    }

    res.json(grouped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});


module.exports = router;
