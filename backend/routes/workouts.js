const express = require("express");
const router = express.Router();
const pool = require('../dbconnection');

router.get('/:exerciseId/current', async (req, res) => {
  const exerciseId = parseInt(req.params.exerciseId);
  const userId = parseInt(req.query.userId);
  const today = new Date().toISOString().split('T')[0];

  try {
    const result = await pool.query(
      `SELECT id, reps, weight FROM workout_log
       WHERE exercise_id = $1 AND user_id = $2
       AND created_at >= $3::date
       AND created_at < ($3::date + interval '1 day')
       ORDER BY created_at ASC`,
      [exerciseId, userId, today]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/sets', async (req, res) => {
  const exerciseId = parseInt(req.body.exerciseId);
  const userId = parseInt(req.body.userId);
  const weight = parseFloat(req.body.weight);
  const reps = parseInt(req.body.reps);

  try {
    const result = await pool.query(
      `INSERT INTO workout_log (exercise_id, user_id, weight, reps)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [exerciseId, userId, weight, reps]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;