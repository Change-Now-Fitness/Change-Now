const express = require("express");
const {
  getExercises,
  createExercise,
  deleteExercise,
} = require("../controllers/exerciseController");

const router = express.Router();

/**
 * Exercise library endpoints.
 *
 * Mount points (see `backend/server.js`):
 * - `/exercises/*`
 *
 * Note: this router uses controller functions defined in
 * `backend/controllers/exerciseController.js`.
 */

/**
 * @openapi
 * /exercises:
 *   get:
 *     summary: List exercises (templates + optional user custom)
 *     tags: [Exercises]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         required: false
 *         schema: { type: string }
 *       - in: query
 *         name: muscleGroup
 *         required: false
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         required: false
 *         schema: { type: string }
 *       - in: query
 *         name: includeCustom
 *         required: false
 *         schema: { type: boolean }
 *     responses:
 *       '200': { description: OK }
 *       '400': { description: Missing/invalid userId }
 *       '500': { description: Server error }
 *   post:
 *     summary: Create a user custom exercise
 *     tags: [Exercises]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, userId]
 *             properties:
 *               name: { type: string }
 *               userId: { type: integer }
 *               muscleGroup: { type: string }
 *               type: { type: string }
 *     responses:
 *       '201': { description: Created }
 *       '400': { description: Missing/invalid fields }
 *       '409': { description: Duplicate exercise }
 *       '500': { description: Server error }
 * /exercises/{id}:
 *   delete:
 *     summary: Delete a user custom exercise
 *     tags: [Exercises]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '200': { description: Deleted }
 *       '400': { description: Invalid id/userId }
 *       '404': { description: Not found }
 *       '500': { description: Server error }
 */
router.get("/", getExercises);
router.post("/", createExercise);
router.delete("/:id", deleteExercise);

module.exports = router;
