const EXERCISE_SEED = [
  {
    id: 1,
    name: "Bench Press",
    type: "strength",
    muscleGroup: "chest",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 2,
    name: "Incline Bench Press",
    type: "strength",
    muscleGroup: "chest",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 3,
    name: "Decline Bench Press",
    type: "strength",
    muscleGroup: "chest",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 4,
    name: "Lat Pulldown",
    type: "strength",
    muscleGroup: "back",
    equipment: "cable",
    isCustom: false,
    userId: null,
  },
  {
    id: 5,
    name: "Barbell Row",
    type: "strength",
    muscleGroup: "back",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 6,
    name: "Barbell Shoulder Press",
    type: "strength",
    muscleGroup: "shoulders",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 7,
    name: "Front Raise",
    type: "strength",
    muscleGroup: "shoulders",
    equipment: "dumbbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 8,
    name: "Squat",
    type: "strength",
    muscleGroup: "legs",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 9,
    name: "Leg Press",
    type: "strength",
    muscleGroup: "legs",
    equipment: "machine",
    isCustom: false,
    userId: null,
  },
  {
    id: 10,
    name: "Barbell Curl",
    type: "strength",
    muscleGroup: "biceps",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 11,
    name: "Skullcrusher",
    type: "strength",
    muscleGroup: "triceps",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 12,
    name: "Standing Calf Raise",
    type: "strength",
    muscleGroup: "calves",
    equipment: "machine",
    isCustom: false,
    userId: null,
  },
  {
    id: 13,
    name: "Wrist Curl",
    type: "strength",
    muscleGroup: "forearms",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
];

let exercises = [...EXERCISE_SEED];
let nextExerciseId = EXERCISE_SEED.length + 1;

const normalizeName = (value) =>
  typeof value === "string" ? value.trim() : "";

const normalizeValue = (value, fallback) => {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  return normalized || fallback;
};

// Query protocol scaffold:
// GET /exercises?search=&muscleGroup=&type=&equipment=&includeCustom=&userId=
// Every response uses the shared exercise shape expected by the frontend MVP.
const getExercises = (req, res) => {
  const search = normalizeValue(req.query.search, "");
  const muscleGroup = normalizeValue(req.query.muscleGroup, "");
  const type = normalizeValue(req.query.type, "");
  const equipment = normalizeValue(req.query.equipment, "");
  const userId =
    typeof req.query.userId === "string" ? req.query.userId.trim() : "";
  const includeCustom = req.query.includeCustom !== "false";

  let filteredExercises = [...exercises];

  if (userId) {
    filteredExercises = filteredExercises.filter(
      (exercise) => !exercise.isCustom || exercise.userId === userId
    );
  }

  if (!includeCustom) {
    filteredExercises = filteredExercises.filter(
      (exercise) => !exercise.isCustom
    );
  }

  if (muscleGroup) {
    filteredExercises = filteredExercises.filter(
      (exercise) => exercise.muscleGroup === muscleGroup
    );
  }

  if (type) {
    filteredExercises = filteredExercises.filter(
      (exercise) => exercise.type === type
    );
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
};

const createExercise = (req, res) => {
  const name = normalizeName(req.body.name);

  if (!name) {
    return res.status(400).json({ message: "Exercise name is required" });
  }

  const nextExercise = {
    id: nextExerciseId,
    name,
    type: normalizeValue(req.body.type, "strength"),
    muscleGroup: normalizeValue(req.body.muscleGroup, "chest"),
    equipment: normalizeValue(req.body.equipment, "barbell"),
    isCustom: true,
    userId: normalizeName(req.body.userId) || "mock-user-id",
  };

  nextExerciseId += 1;
  exercises.push(nextExercise);

  return res.status(201).json(nextExercise);
};

const deleteExercise = (req, res) => {
  const exerciseId = Number.parseInt(req.params.id, 10);

  if (Number.isNaN(exerciseId)) {
    return res.status(400).json({ message: "Exercise id must be a number" });
  }

  const exerciseIndex = exercises.findIndex(
    (exercise) => exercise.id === exerciseId
  );

  if (exerciseIndex === -1) {
    return res.status(404).json({ message: "Exercise not found" });
  }

  exercises.splice(exerciseIndex, 1);

  return res.json({ message: "Exercise deleted successfully" });
};

module.exports = {
  getExercises,
  createExercise,
  deleteExercise,
};
