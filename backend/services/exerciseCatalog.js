const pool = require("../dbconnection");

const DEFAULT_EXERCISES = [
  { name: "Barbell Bench Press", muscleGroup: "chest", category: "strength", equipment: "barbell" },
  { name: "Incline Dumbbell Press", muscleGroup: "chest", category: "strength", equipment: "dumbbell" },
  { name: "Cable Fly", muscleGroup: "chest", category: "strength", equipment: "cable" },
  { name: "Barbell Curl", muscleGroup: "biceps", category: "strength", equipment: "barbell" },
  { name: "Hammer Curl", muscleGroup: "biceps", category: "strength", equipment: "dumbbell" },
  { name: "Preacher Curl", muscleGroup: "biceps", category: "strength", equipment: "barbell" },
  { name: "Close-Grip Bench Press", muscleGroup: "triceps", category: "strength", equipment: "barbell" },
  { name: "Skull Crusher", muscleGroup: "triceps", category: "strength", equipment: "barbell" },
  { name: "Rope Pushdown", muscleGroup: "triceps", category: "strength", equipment: "cable" },
  { name: "Wrist Curl", muscleGroup: "forearms", category: "strength", equipment: "barbell" },
  { name: "Reverse Wrist Curl", muscleGroup: "forearms", category: "strength", equipment: "barbell" },
  { name: "Farmer's Walk", muscleGroup: "forearms", category: "strength", equipment: "dumbbell" },
  { name: "Back Squat", muscleGroup: "quads", category: "strength", equipment: "barbell" },
  { name: "Leg Press", muscleGroup: "quads", category: "strength", equipment: "machine" },
  { name: "Bulgarian Split Squat", muscleGroup: "quads", category: "strength", equipment: "dumbbell" },
  { name: "Romanian Deadlift", muscleGroup: "hamstrings", category: "strength", equipment: "barbell" },
  { name: "Seated Leg Curl", muscleGroup: "hamstrings", category: "strength", equipment: "machine" },
  { name: "Nordic Hamstring Curl", muscleGroup: "hamstrings", category: "bodyweight", equipment: "bodyweight" },
  { name: "Barbell Hip Thrust", muscleGroup: "glutes", category: "strength", equipment: "barbell" },
  { name: "Cable Kickback", muscleGroup: "glutes", category: "strength", equipment: "cable" },
  { name: "Glute Bridge", muscleGroup: "glutes", category: "bodyweight", equipment: "bodyweight" },
  { name: "Standing Calf Raise", muscleGroup: "calves", category: "strength", equipment: "machine" },
  { name: "Seated Calf Raise", muscleGroup: "calves", category: "strength", equipment: "machine" },
  { name: "Leg Press Calf Raise", muscleGroup: "calves", category: "strength", equipment: "machine" },
  { name: "Pull-up", muscleGroup: "lats", category: "bodyweight", equipment: "bodyweight" },
  { name: "Lat Pulldown", muscleGroup: "lats", category: "strength", equipment: "cable" },
  { name: "Single-arm Dumbbell Row", muscleGroup: "lats", category: "strength", equipment: "dumbbell" },
  { name: "Face Pull", muscleGroup: "upper back", category: "strength", equipment: "cable" },
  { name: "Seated Cable Row", muscleGroup: "upper back", category: "strength", equipment: "cable" },
  { name: "Chest-supported Row", muscleGroup: "upper back", category: "strength", equipment: "machine" },
  { name: "Deadlift", muscleGroup: "lower back", category: "strength", equipment: "barbell" },
  { name: "Good Morning", muscleGroup: "lower back", category: "strength", equipment: "barbell" },
  { name: "Back Extension", muscleGroup: "lower back", category: "bodyweight", equipment: "bodyweight" },
  { name: "Barbell Shoulder Press", muscleGroup: "shoulders", category: "strength", equipment: "barbell" },
  { name: "Lateral Raise", muscleGroup: "shoulders", category: "strength", equipment: "dumbbell" },
  { name: "Reverse Pec Deck", muscleGroup: "shoulders", category: "strength", equipment: "machine" },
  { name: "Plank", muscleGroup: "abs", category: "bodyweight", equipment: "bodyweight" },
  { name: "Hanging Leg Raise", muscleGroup: "abs", category: "bodyweight", equipment: "bodyweight" },
  { name: "Cable Crunch", muscleGroup: "abs", category: "strength", equipment: "cable" },
  { name: "Treadmill Run", muscleGroup: "cardio", category: "cardio", equipment: "machine" },
  { name: "Jump Rope", muscleGroup: "cardio", category: "cardio", equipment: "other" },
  { name: "Rowing Machine", muscleGroup: "cardio", category: "cardio", equipment: "machine" },
];

const buildInsertStatement = (userId, exercises) => {
  const values = [];
  const placeholders = exercises.map((exercise, index) => {
    const offset = index * 5;
    values.push(
      userId,
      exercise.name,
      exercise.muscleGroup,
      exercise.category,
      exercise.equipment
    );

    return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, false)`;
  });

  return {
    text:
      "INSERT INTO exercise " +
      "(user_id, exercise_name, muscle_group, exercise_category, exercise_type, is_custom) VALUES " +
      placeholders.join(", "),
    values,
  };
};

async function ensureDefaultExercises(userId) {
  const normalizedUserId = Number.parseInt(String(userId), 10);

  if (Number.isNaN(normalizedUserId)) {
    throw new Error("A valid user id is required to preload exercises");
  }

  const existingExercises = await pool.query(
    `SELECT LOWER(TRIM(exercise_name)) AS exercise_name
       FROM exercise
      WHERE user_id = $1
        AND is_custom = false`,
    [normalizedUserId]
  );

  const existingExerciseNames = new Set(
    existingExercises.rows.map((row) => row.exercise_name)
  );

  const missingExercises = DEFAULT_EXERCISES.filter(
    (exercise) => !existingExerciseNames.has(exercise.name.toLowerCase())
  );

  if (missingExercises.length === 0) {
    return { insertedCount: 0, totalCount: DEFAULT_EXERCISES.length };
  }

  const insertStatement = buildInsertStatement(normalizedUserId, missingExercises);
  const uploadExercises = await pool.query(
    insertStatement.text,
    insertStatement.values
  );

  return {
    insertedCount: uploadExercises.rowCount,
    totalCount: DEFAULT_EXERCISES.length,
  };
}

module.exports = {
  DEFAULT_EXERCISES,
  ensureDefaultExercises,
};
