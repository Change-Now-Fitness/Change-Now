

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


/**
 * @openapi
 * /routes/{exerciseId}/current:
 *   get:
 *     summary: Get today's workout sets/laps for an exercise
 *     tags: [Workout]
 *     parameters:
 *       - in: path
 *         name: exerciseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Encoded exercise identifier
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       '200':
 *         description: List of today's workout entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   reps:
 *                     type: integer
 *                     nullable: true
 *                   weight:
 *                     type: number
 *                     nullable: true
 *                   duration_seconds:
 *                     type: integer
 *                     nullable: true
 *                   distance:
 *                     type: number
 *                     nullable: true
 *       '400':
 *         description: Invalid exerciseId or userId
 *       '500':
 *         description: Database error
 */
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
      `SELECT id, reps, weight, duration_seconds, distance
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


/**
 * @openapi
 * /routes/sets:
 *   post:
 *     summary: Add a strength training set
 *     tags: [Workout]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - exerciseId
 *               - userId
 *               - weight
 *               - reps
 *             properties:
 *               exerciseId:
 *                 type: string
 *               userId:
 *                 type: integer
 *               weight:
 *                 type: number
 *               reps:
 *                 type: integer
 *     responses:
 *       '200':
 *         description: Created set
 *       '400':
 *         description: Missing or invalid fields
 *       '500':
 *         description: Database error
 */
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


// Add laps for cardio
/**
 * @openapi
 * /routes/laps:
 *   post:
 *     summary: Add a cardio lap entry
 *     tags: [Workout]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - exerciseId
 *               - userId
 *               - durationSeconds
 *               - distance
 *             properties:
 *               exerciseId:
 *                 type: string
 *               userId:
 *                 type: integer
 *               durationSeconds:
 *                 type: integer
 *               distance:
 *                 type: number
 *     responses:
 *       '200':
 *         description: Created lap entry
 *       '400':
 *         description: Missing or invalid fields
 *       '500':
 *         description: Database error
 */
router.post("/laps", async (req, res) => {
  const exerciseReference = parseExerciseId(req.body.exerciseId);
  const userId = parseNumber(req.body.userId);
  const durationSeconds = parseNumber(req.body.durationSeconds);
  const distance = Number.parseFloat(req.body.distance);

  if (!exerciseReference) {
    return res.status(400).json({ error: "Exercise id is invalid" });
  }

  if (userId === null) {
    return res.status(400).json({ error: "A valid userId is required" });
  }

  if (durationSeconds === null || Number.isNaN(distance)) {
    return res
      .status(400)
      .json({ error: "Duration and distance are required" });
  }

  const referenceConfig = buildWorkoutReferenceConfig(exerciseReference);

  try {
    await ensureExerciseCatalogTables();

    const result = await pool.query(
      `INSERT INTO workout_log (${referenceConfig.insertColumn}, user_id, duration_seconds, distance)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [exerciseReference.id, userId, durationSeconds, distance]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});


/**
 * @openapi
 * /routes/sets/{setId}:
 *   delete:
 *     summary: Delete a workout set
 *     tags: [Workout]
 *     parameters:
 *       - in: path
 *         name: setId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successfully deleted set
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deletedSetId:
 *                   type: integer
 *       '400':
 *         description: Invalid setId or userId
 *       '404':
 *         description: Set not found
 *       '500':
 *         description: Database error
 */
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

/** 
 * @openapi
 * /routes/{exerciseId}/history:
 *   get:
 *     summary: Get historical workout data grouped by date
 *     tags:
 *       - Workout
 *     parameters:
 *       - in: path
 *         name: exerciseId
 *         required: true
 *         description: The exercise identifier
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         required: true
 *         description: The ID of the user
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Workout history grouped by date
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Object where keys are ISO date strings (YYYY-MM-DD)
 *               additionalProperties:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     weight:
 *                       type: number
 *                       nullable: true
 *                       example: 135
 *                       description: Weight used for strength exercises
 *                     reps:
 *                       type: integer
 *                       nullable: true
 *                       example: 10
 *                       description: Number of repetitions
 *                     duration_seconds:
 *                       type: integer
 *                       nullable: true
 *                       example: 600
 *                       description: Duration of the exercise in seconds
 *                     distance:
 *                       type: number
 *                       nullable: true
 *                       example: 1.25
 *                       description: Distance covered (e.g., miles)
 *       400:
 *         description: Invalid exerciseId or userId
 *       500:
 *         description: Database error
 */


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
      `SELECT reps, weight, duration_seconds, distance, created_at
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
      grouped[date].push({ weight: row.weight, 
                           reps: row.reps, 
                           duration_seconds: row.duration_seconds,
                           distance: row.distance
                        });
    }

    res.json(grouped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});


module.exports = router;
