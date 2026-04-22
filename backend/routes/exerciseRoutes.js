const express = require("express");
const {
  getExercises,
  createExercise,
  deleteExercise,
} = require("../controllers/exerciseController");

const router = express.Router();

/**
 * @openapi
 * /exercises:
 *   get:
 *     summary: List template and custom exercises for a user
 *     tags: [Exercises]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID used to scope custom exercises
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: muscleGroup
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         required: false
 *         schema:
 *           type: string
 *           enum: [strength, cardio]
 *       - in: query
 *         name: includeCustom
 *         required: false
 *         schema:
 *           type: boolean
 *     responses:
 *       '200':
 *         description: Exercise list
 *       '400':
 *         description: Invalid or missing userId
 *       '500':
 *         description: Failed to fetch exercises
 */
router.get("/", getExercises);

/**
 * @openapi
 * /exercises:
 *   post:
 *     summary: Create a custom exercise for a user
 *     tags: [Exercises]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, userId]
 *             properties:
 *               name:
 *                 type: string
 *               userId:
 *                 type: integer
 *               muscleGroup:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [strength, cardio]
 *     responses:
 *       '201':
 *         description: Custom exercise created
 *       '400':
 *         description: Missing name or invalid userId
 *       '409':
 *         description: A matching exercise already exists
 *       '500':
 *         description: Failed to create exercise
 */
router.post("/", createExercise);

/**
 * @openapi
 * /exercises/{id}:
 *   delete:
 *     summary: Delete a custom exercise
 *     tags: [Exercises]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Encoded exercise identifier
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Exercise deleted successfully
 *       '400':
 *         description: Invalid id, invalid userId, or non-custom exercise
 *       '404':
 *         description: Exercise not found
 *       '500':
 *         description: Failed to delete exercise
 */
router.delete("/:id", deleteExercise);

module.exports = router;
