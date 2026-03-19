const express = require("express");
const {
  getExercises,
  createExercise,
  deleteExercise,
} = require("../controllers/exerciseController");

const router = express.Router();

router.get("/", getExercises);
router.post("/", createExercise);
router.delete("/:id", deleteExercise);

module.exports = router;
