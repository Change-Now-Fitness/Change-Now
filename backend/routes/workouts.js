
const express = require("express");

const router = express.Router();
const authMiddleware = require("../middleware/auth");
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

/**
 * Workout logging endpoints (sets/laps/history).
 *
 * Mount point (see `backend/server.js`):
 * - `/workouts/*`
 *
 * Note: These endpoints expect a `userId` parameter in query/body and do not
 * currently use auth middleware. Clients must ensure they only request their
 * own data.
 */

/**
 * Parse an integer from request query/body.
 */
const parseNumber = (value) => {
  const parsedValue = Number.parseInt(String(value ?? ""), 10);
  return Number.isNaN(parsedValue) ? null : parsedValue;
};

const MAX_WEIGHT = 999.99;
const MAX_REPS = 999;

/**
 * Map a parsed exercise identifier to the correct SQL columns for logging.
 */
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
 * /workouts/{exerciseId}/current:
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
  const tz = req.query.tz || "UTC";

  if (!exerciseReference) {
    return res.status(400).json({ error: "Exercise id is invalid" });
  }

  if (userId === null) {
    return res.status(400).json({ error: "A valid userId is required" });
  }

  const referenceConfig = buildWorkoutReferenceConfig(exerciseReference);

  try {
    await ensureExerciseCatalogTables();

    // Compute today in the user's timezone
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: tz,
    });

    const result = await pool.query(
      `SELECT id, reps, weight, duration_seconds, distance
         FROM workout_log
        WHERE ${referenceConfig.whereClause}
          AND user_id = $2
          AND DATE(created_at AT TIME ZONE $3) = $4
        ORDER BY created_at ASC`,
      [exerciseReference.id, userId, tz, today]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});


/**
 * @openapi
 * /workouts/sets:
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

  if (weight <= 0 || weight > MAX_WEIGHT) {
    return res.status(400).json({
      error: `Weight must be between 0.01 and ${MAX_WEIGHT} lbs`,
    });
  }

  if (reps <= 0 || reps > MAX_REPS) {
    return res.status(400).json({
      error: `Reps must be between 1 and ${MAX_REPS}`,
    });
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
 * /workouts/laps:
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
 * /workouts/sets/{setId}:
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
 * /workouts/{exerciseId}/history:
 *   get:
 *     summary: Get historical workout data grouped by date (excluding today)
 *     description: |
 *       Returns workout history grouped by the user's local date.
 *       Dates are normalized to YYYY-MM-DD format and sorted from oldest to newest.
 *       Each date contains an array of sets (strength) or laps (cardio).
 *
 *       - Strength entries include `weight` and `reps`
 *       - Cardio entries include `duration_seconds` and `distance`
 *     tags:
 *       - Workout
 *     parameters:
 *       - in: path
 *         name: exerciseId
 *         required: true
 *         description: Encoded exercise identifier
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         required: true
 *         description: ID of the user
 *         schema:
 *           type: integer
 *       - in: query
 *         name: tz
 *         required: false
 *         description: IANA timezone string (e.g., "America/New_York"). Defaults to UTC.
 *         schema:
 *           type: string
 *           example: America/New_York
 *     responses:
 *       '200':
 *         description: Workout history grouped by date
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Object keyed by date (YYYY-MM-DD), sorted oldest to newest
 *               additionalProperties:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     weight:
 *                       type: number
 *                       nullable: true
 *                       description: Weight used (strength only)
 *                       example: 135
 *                     reps:
 *                       type: integer
 *                       nullable: true
 *                       description: Number of repetitions (strength only)
 *                       example: 10
 *                     duration_seconds:
 *                       type: integer
 *                       nullable: true
 *                       description: Duration in seconds (cardio only)
 *                       example: 600
 *                     distance:
 *                       type: number
 *                       nullable: true
 *                       description: Distance covered (cardio only)
 *                       example: 1.25
 *       '400':
 *         description: Invalid exerciseId or userId
 *       '500':
 *         description: Database error
 */


router.get("/:exerciseId/history", async (req, res) => {
  const exerciseReference = parseExerciseId(req.params.exerciseId);
  const userId = parseNumber(req.query.userId);
  const tz = req.query.tz || "UTC";

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
      `
      SELECT 
        reps,
        weight,
        duration_seconds,
        distance,
        created_at,
        TO_CHAR(created_at AT TIME ZONE $3, 'YYYY-MM-DD') AS local_date
      FROM workout_log
      WHERE ${referenceConfig.whereClause}
        AND user_id = $2
        AND DATE(created_at AT TIME ZONE $3) < DATE(NOW() AT TIME ZONE $3)
      ORDER BY created_at ASC
      `,
      [exerciseReference.id, userId, tz]
    );

    const grouped = {};

    for (const row of result.rows) {
      const date = row.local_date; // already YYYY-MM-DD

      if (!grouped[date]) grouped[date] = [];

      grouped[date].push({
        weight: row.weight,
        reps: row.reps,
        duration_seconds: row.duration_seconds,
        distance: row.distance,
      });
    }

    const sorted = Object.fromEntries(
      Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))
    );

    res.json(sorted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});