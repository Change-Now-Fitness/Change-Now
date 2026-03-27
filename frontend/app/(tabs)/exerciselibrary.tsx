import React, { useRef, useState, useEffect } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  StyleSheet
} from "react-native";

import { checkLogin } from '../../services/auth';
import { useRouter } from 'expo-router';
import { ApiError, Exercise, createExercise, fetchExercises } from "../../lib/api";

type ExerciseForm = {
  name: string;
  type: string;
  muscleGroup: string;
  equipment: string;
};

const MUSCLE_GROUPS = [
  { key: "chest", label: "Chest" },
  { key: "biceps", label: "Biceps" },
  { key: "triceps", label: "Triceps" },
  { key: "forearms", label: "Forearms" },
  { key: "quads", label: "Quads" },
  { key: "hamstrings", label: "Hamstrings" },
  { key: "glutes", label: "Glutes" },
  { key: "calves", label: "Calves" },
  { key: "lats", label: "Lats" },
  { key: "upper back", label: "Upper Back" },
  { key: "lower back", label: "Lower Back" },
  { key: "shoulders", label: "Shoulders" },
  { key: "abs", label: "Abs" },
  { key: "cardio", label: "Cardio" },
];

const EXERCISE_TYPES = ["strength", "cardio", "mobility", "bodyweight"];
// Temporary data for UI.
// Replace this with a backend fetch once the exercises table is populated.
const PRESET_EXERCISES: Exercise[] = [
  {
    id: 1,
    name: "Barbell Curl",
    type: "strength",
    muscleGroup: "biceps",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 2,
    name: "EZ Bar Curl",
    type: "strength",
    muscleGroup: "biceps",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 3,
    name: "Dumbbell Curl",
    type: "strength",
    muscleGroup: "biceps",
    equipment: "dumbbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 4,
    name: "Alternating Dumbbell Curl",
    type: "strength",
    muscleGroup: "biceps",
    equipment: "dumbbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 5,
    name: "Hammer Curl",
    type: "strength",
    muscleGroup: "biceps",
    equipment: "dumbbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 6,
    name: "Incline Dumbbell Curl",
    type: "strength",
    muscleGroup: "biceps",
    equipment: "dumbbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 7,
    name: "Preacher Curl",
    type: "strength",
    muscleGroup: "biceps",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 8,
    name: "Cable Curl",
    type: "strength",
    muscleGroup: "biceps",
    equipment: "cable",
    isCustom: false,
    userId: null,
  },
  {
    id: 9,
    name: "Rope Hammer Curl",
    type: "strength",
    muscleGroup: "biceps",
    equipment: "cable",
    isCustom: false,
    userId: null,
  },
  {
    id: 10,
    name: "Chin-up (Underhand Grip)",
    type: "strength",
    muscleGroup: "biceps",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 11,
    name: "Close-Grip Bench Press",
    type: "strength",
    muscleGroup: "triceps",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 12,
    name: "Skull Crusher (Lying Triceps Extension)",
    type: "strength",
    muscleGroup: "triceps",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 13,
    name: "Overhead Triceps Extension (Dumbbell)",
    type: "strength",
    muscleGroup: "triceps",
    equipment: "dumbbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 14,
    name: "Cable Triceps Pushdown (Straight Bar)",
    type: "strength",
    muscleGroup: "triceps",
    equipment: "cable",
    isCustom: false,
    userId: null,
  },
  {
    id: 15,
    name: "Rope Pushdown",
    type: "strength",
    muscleGroup: "triceps",
    equipment: "cable",
    isCustom: false,
    userId: null,
  },
  {
    id: 16,
    name: "Overhead Cable Extension",
    type: "strength",
    muscleGroup: "triceps",
    equipment: "cable",
    isCustom: false,
    userId: null,
  },
  {
    id: 17,
    name: "Dips (Parallel Bar Dip)",
    type: "strength",
    muscleGroup: "triceps",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 18,
    name: "Bench Dip",
    type: "strength",
    muscleGroup: "triceps",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 19,
    name: "Single-arm Cable Pushdown",
    type: "strength",
    muscleGroup: "triceps",
    equipment: "cable",
    isCustom: false,
    userId: null,
  },
  {
    id: 20,
    name: "Kickback (Dumbbell)",
    type: "strength",
    muscleGroup: "triceps",
    equipment: "dumbbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 21,
    name: "Wrist Curl (Barbell / Dumbbell)",
    type: "strength",
    muscleGroup: "forearms",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 22,
    name: "Reverse Wrist Curl",
    type: "strength",
    muscleGroup: "forearms",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 23,
    name: "Hammer Curl",
    type: "strength",
    muscleGroup: "forearms",
    equipment: "dumbbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 24,
    name: "Reverse Barbell Curl",
    type: "strength",
    muscleGroup: "forearms",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 25,
    name: "Farmer's Walk",
    type: "strength",
    muscleGroup: "forearms",
    equipment: "dumbbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 26,
    name: "Dead Hang",
    type: "strength",
    muscleGroup: "forearms",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 27,
    name: "Plate Pinch Hold",
    type: "strength",
    muscleGroup: "forearms",
    equipment: "plate",
    isCustom: false,
    userId: null,
  },
  {
    id: 28,
    name: "Towel Pull-up",
    type: "strength",
    muscleGroup: "forearms",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 29,
    name: "Behind-the-Back Wrist Curl",
    type: "strength",
    muscleGroup: "forearms",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 30,
    name: "Grip Trainer Squeeze",
    type: "strength",
    muscleGroup: "forearms",
    equipment: "other",
    isCustom: false,
    userId: null,
  },
  {
    id: 31,
    name: "Barbell Bench Press",
    type: "strength",
    muscleGroup: "chest",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 32,
    name: "Dumbbell Bench Press",
    type: "strength",
    muscleGroup: "chest",
    equipment: "dumbbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 33,
    name: "Incline Barbell Bench Press",
    type: "strength",
    muscleGroup: "chest",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 34,
    name: "Incline Dumbbell Press",
    type: "strength",
    muscleGroup: "chest",
    equipment: "dumbbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 35,
    name: "Decline Bench Press",
    type: "strength",
    muscleGroup: "chest",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 36,
    name: "Chest Press Machine",
    type: "strength",
    muscleGroup: "chest",
    equipment: "machine",
    isCustom: false,
    userId: null,
  },
  {
    id: 37,
    name: "Cable Chest Press",
    type: "strength",
    muscleGroup: "chest",
    equipment: "cable",
    isCustom: false,
    userId: null,
  },
  {
    id: 38,
    name: "Dumbbell Fly",
    type: "strength",
    muscleGroup: "chest",
    equipment: "dumbbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 39,
    name: "Cable Fly",
    type: "strength",
    muscleGroup: "chest",
    equipment: "cable",
    isCustom: false,
    userId: null,
  },
  {
    id: 40,
    name: "Pec Deck Machine",
    type: "strength",
    muscleGroup: "chest",
    equipment: "machine",
    isCustom: false,
    userId: null,
  },
  {
    id: 41,
    name: "Push-up",
    type: "strength",
    muscleGroup: "chest",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 42,
    name: "Weighted Push-up",
    type: "strength",
    muscleGroup: "chest",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 43,
    name: "Dips (Chest Lean Variation)",
    type: "strength",
    muscleGroup: "chest",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 44,
    name: "Back Squat",
    type: "strength",
    muscleGroup: "quads",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 45,
    name: "Front Squat",
    type: "strength",
    muscleGroup: "quads",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 46,
    name: "Leg Press",
    type: "strength",
    muscleGroup: "quads",
    equipment: "machine",
    isCustom: false,
    userId: null,
  },
  {
    id: 47,
    name: "Hack Squat (Machine)",
    type: "strength",
    muscleGroup: "quads",
    equipment: "machine",
    isCustom: false,
    userId: null,
  },
  {
    id: 48,
    name: "Bulgarian Split Squat",
    type: "strength",
    muscleGroup: "quads",
    equipment: "dumbbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 49,
    name: "Walking Lunges",
    type: "strength",
    muscleGroup: "quads",
    equipment: "dumbbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 50,
    name: "Leg Extension (Machine)",
    type: "strength",
    muscleGroup: "quads",
    equipment: "machine",
    isCustom: false,
    userId: null,
  },
  {
    id: 51,
    name: "Step-up",
    type: "strength",
    muscleGroup: "quads",
    equipment: "dumbbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 52,
    name: "Smith Machine Squat",
    type: "strength",
    muscleGroup: "quads",
    equipment: "machine",
    isCustom: false,
    userId: null,
  },
  {
    id: 53,
    name: "Romanian Deadlift (RDL)",
    type: "strength",
    muscleGroup: "hamstrings",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 54,
    name: "Stiff-Leg Deadlift",
    type: "strength",
    muscleGroup: "hamstrings",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 55,
    name: "Conventional Deadlift",
    type: "strength",
    muscleGroup: "hamstrings",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 56,
    name: "Seated Leg Curl (Machine)",
    type: "strength",
    muscleGroup: "hamstrings",
    equipment: "machine",
    isCustom: false,
    userId: null,
  },
  {
    id: 57,
    name: "Lying Leg Curl (Machine)",
    type: "strength",
    muscleGroup: "hamstrings",
    equipment: "machine",
    isCustom: false,
    userId: null,
  },
  {
    id: 58,
    name: "Nordic Hamstring Curl",
    type: "strength",
    muscleGroup: "hamstrings",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 59,
    name: "Good Morning",
    type: "strength",
    muscleGroup: "hamstrings",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 60,
    name: "Cable Pull-through",
    type: "strength",
    muscleGroup: "hamstrings",
    equipment: "cable",
    isCustom: false,
    userId: null,
  },
  {
    id: 61,
    name: "Single-leg Romanian Deadlift",
    type: "strength",
    muscleGroup: "hamstrings",
    equipment: "dumbbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 62,
    name: "Glute Bridge (Hamstring Focus)",
    type: "strength",
    muscleGroup: "hamstrings",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 63,
    name: "Kettlebell Swing",
    type: "strength",
    muscleGroup: "hamstrings",
    equipment: "other",
    isCustom: false,
    userId: null,
  },
  {
    id: 64,
    name: "Swiss Ball Leg Curl",
    type: "strength",
    muscleGroup: "hamstrings",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 65,
    name: "Barbell Hip Thrust",
    type: "strength",
    muscleGroup: "glutes",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 66,
    name: "Glute Bridge",
    type: "strength",
    muscleGroup: "glutes",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 67,
    name: "Back Squat",
    type: "strength",
    muscleGroup: "glutes",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 68,
    name: "Front Squat",
    type: "strength",
    muscleGroup: "glutes",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 69,
    name: "Romanian Deadlift (RDL)",
    type: "strength",
    muscleGroup: "glutes",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 70,
    name: "Sumo Deadlift",
    type: "strength",
    muscleGroup: "glutes",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 71,
    name: "Bulgarian Split Squat",
    type: "strength",
    muscleGroup: "glutes",
    equipment: "dumbbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 72,
    name: "Walking Lunges",
    type: "strength",
    muscleGroup: "glutes",
    equipment: "dumbbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 73,
    name: "Cable Kickback",
    type: "strength",
    muscleGroup: "glutes",
    equipment: "cable",
    isCustom: false,
    userId: null,
  },
  {
    id: 74,
    name: "Glute Kickback Machine",
    type: "strength",
    muscleGroup: "glutes",
    equipment: "machine",
    isCustom: false,
    userId: null,
  },
  {
    id: 75,
    name: "Step-up (Glute Focus)",
    type: "strength",
    muscleGroup: "glutes",
    equipment: "dumbbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 76,
    name: "Cable Pull-through",
    type: "strength",
    muscleGroup: "glutes",
    equipment: "cable",
    isCustom: false,
    userId: null,
  },
  {
    id: 77,
    name: "Frog Pump",
    type: "strength",
    muscleGroup: "glutes",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 78,
    name: "Single-leg Hip Thrust",
    type: "strength",
    muscleGroup: "glutes",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 79,
    name: "Standing Calf Raise (Machine)",
    type: "strength",
    muscleGroup: "calves",
    equipment: "machine",
    isCustom: false,
    userId: null,
  },
  {
    id: 80,
    name: "Seated Calf Raise (Machine)",
    type: "strength",
    muscleGroup: "calves",
    equipment: "machine",
    isCustom: false,
    userId: null,
  },
  {
    id: 81,
    name: "Leg Press Calf Raise",
    type: "strength",
    muscleGroup: "calves",
    equipment: "machine",
    isCustom: false,
    userId: null,
  },
  {
    id: 82,
    name: "Smith Machine Calf Raise",
    type: "strength",
    muscleGroup: "calves",
    equipment: "machine",
    isCustom: false,
    userId: null,
  },
  {
    id: 83,
    name: "Donkey Calf Raise",
    type: "strength",
    muscleGroup: "calves",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 84,
    name: "Single-leg Calf Raise",
    type: "strength",
    muscleGroup: "calves",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 85,
    name: "Dumbbell Standing Calf Raise",
    type: "strength",
    muscleGroup: "calves",
    equipment: "dumbbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 86,
    name: "Jump Rope",
    type: "strength",
    muscleGroup: "calves",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 87,
    name: "Box Jump (Calf Emphasis)",
    type: "strength",
    muscleGroup: "calves",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 88,
    name: "Farmer's Walk on Toes",
    type: "strength",
    muscleGroup: "calves",
    equipment: "dumbbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 89,
    name: "Pull-up (Overhand Grip)",
    type: "strength",
    muscleGroup: "lats",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 90,
    name: "Chin-up (Underhand Grip)",
    type: "strength",
    muscleGroup: "lats",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 91,
    name: "Lat Pulldown (Wide Grip)",
    type: "strength",
    muscleGroup: "lats",
    equipment: "cable",
    isCustom: false,
    userId: null,
  },
  {
    id: 92,
    name: "Lat Pulldown (Neutral Grip)",
    type: "strength",
    muscleGroup: "lats",
    equipment: "cable",
    isCustom: false,
    userId: null,
  },
  {
    id: 93,
    name: "Close-grip Lat Pulldown",
    type: "strength",
    muscleGroup: "lats",
    equipment: "cable",
    isCustom: false,
    userId: null,
  },
  {
    id: 94,
    name: "Barbell Row",
    type: "strength",
    muscleGroup: "lats",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 95,
    name: "Pendlay Row",
    type: "strength",
    muscleGroup: "lats",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 96,
    name: "Single-arm Dumbbell Row",
    type: "strength",
    muscleGroup: "lats",
    equipment: "dumbbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 97,
    name: "Seated Cable Row",
    type: "strength",
    muscleGroup: "lats",
    equipment: "cable",
    isCustom: false,
    userId: null,
  },
  {
    id: 98,
    name: "Chest-supported Row",
    type: "strength",
    muscleGroup: "lats",
    equipment: "machine",
    isCustom: false,
    userId: null,
  },
  {
    id: 99,
    name: "T-bar Row",
    type: "strength",
    muscleGroup: "lats",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 100,
    name: "Straight-arm Pulldown",
    type: "strength",
    muscleGroup: "lats",
    equipment: "cable",
    isCustom: false,
    userId: null,
  },
  {
    id: 101,
    name: "Meadows Row",
    type: "strength",
    muscleGroup: "lats",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 102,
    name: "Machine High Row",
    type: "strength",
    muscleGroup: "lats",
    equipment: "machine",
    isCustom: false,
    userId: null,
  },
  {
    id: 103,
    name: "Face Pull",
    type: "strength",
    muscleGroup: "upper back",
    equipment: "cable",
    isCustom: false,
    userId: null,
  },
  {
    id: 104,
    name: "Barbell Row (High Pull to Upper Chest)",
    type: "strength",
    muscleGroup: "upper back",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 105,
    name: "Chest-supported Row",
    type: "strength",
    muscleGroup: "upper back",
    equipment: "machine",
    isCustom: false,
    userId: null,
  },
  {
    id: 106,
    name: "Seated Cable Row (Upper Chest Focus)",
    type: "strength",
    muscleGroup: "upper back",
    equipment: "cable",
    isCustom: false,
    userId: null,
  },
  {
    id: 107,
    name: "T-bar Row",
    type: "strength",
    muscleGroup: "upper back",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 108,
    name: "Rear Delt Fly (Dumbbell)",
    type: "strength",
    muscleGroup: "upper back",
    equipment: "dumbbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 109,
    name: "Reverse Pec Deck",
    type: "strength",
    muscleGroup: "upper back",
    equipment: "machine",
    isCustom: false,
    userId: null,
  },
  {
    id: 110,
    name: "Wide-grip Lat Pulldown (Upper Back Emphasis)",
    type: "strength",
    muscleGroup: "upper back",
    equipment: "cable",
    isCustom: false,
    userId: null,
  },
  {
    id: 111,
    name: "Trap Bar Shrug",
    type: "strength",
    muscleGroup: "upper back",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 112,
    name: "Barbell Shrug",
    type: "strength",
    muscleGroup: "upper back",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 113,
    name: "Farmer's Carry",
    type: "strength",
    muscleGroup: "upper back",
    equipment: "dumbbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 114,
    name: "High Row Machine",
    type: "strength",
    muscleGroup: "upper back",
    equipment: "machine",
    isCustom: false,
    userId: null,
  },
  {
    id: 115,
    name: "Conventional Deadlift",
    type: "strength",
    muscleGroup: "lower back",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 116,
    name: "Romanian Deadlift (RDL)",
    type: "strength",
    muscleGroup: "lower back",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 117,
    name: "Sumo Deadlift",
    type: "strength",
    muscleGroup: "lower back",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 118,
    name: "Good Morning",
    type: "strength",
    muscleGroup: "lower back",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 119,
    name: "Back Extension (45deg Hyperextension)",
    type: "strength",
    muscleGroup: "lower back",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 120,
    name: "Reverse Hyperextension",
    type: "strength",
    muscleGroup: "lower back",
    equipment: "machine",
    isCustom: false,
    userId: null,
  },
  {
    id: 121,
    name: "Superman Hold",
    type: "strength",
    muscleGroup: "lower back",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 122,
    name: "Bird Dog",
    type: "strength",
    muscleGroup: "lower back",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 123,
    name: "Cable Pull-through",
    type: "strength",
    muscleGroup: "lower back",
    equipment: "cable",
    isCustom: false,
    userId: null,
  },
  {
    id: 124,
    name: "Kettlebell Swing",
    type: "strength",
    muscleGroup: "lower back",
    equipment: "other",
    isCustom: false,
    userId: null,
  },
  {
    id: 125,
    name: "Rack Pull",
    type: "strength",
    muscleGroup: "lower back",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 126,
    name: "Glute Bridge (Posterior Chain Focus)",
    type: "strength",
    muscleGroup: "lower back",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 127,
    name: "Barbell Overhead Press",
    type: "strength",
    muscleGroup: "shoulders",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 128,
    name: "Dumbbell Shoulder Press",
    type: "strength",
    muscleGroup: "shoulders",
    equipment: "dumbbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 129,
    name: "Arnold Press",
    type: "strength",
    muscleGroup: "shoulders",
    equipment: "dumbbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 130,
    name: "Seated Dumbbell Press",
    type: "strength",
    muscleGroup: "shoulders",
    equipment: "dumbbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 131,
    name: "Lateral Raise (Dumbbell)",
    type: "strength",
    muscleGroup: "shoulders",
    equipment: "dumbbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 132,
    name: "Cable Lateral Raise",
    type: "strength",
    muscleGroup: "shoulders",
    equipment: "cable",
    isCustom: false,
    userId: null,
  },
  {
    id: 133,
    name: "Front Raise (Dumbbell / Plate)",
    type: "strength",
    muscleGroup: "shoulders",
    equipment: "dumbbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 134,
    name: "Rear Delt Fly (Dumbbell)",
    type: "strength",
    muscleGroup: "shoulders",
    equipment: "dumbbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 135,
    name: "Reverse Pec Deck",
    type: "strength",
    muscleGroup: "shoulders",
    equipment: "machine",
    isCustom: false,
    userId: null,
  },
  {
    id: 136,
    name: "Face Pull",
    type: "strength",
    muscleGroup: "shoulders",
    equipment: "cable",
    isCustom: false,
    userId: null,
  },
  {
    id: 137,
    name: "Upright Row",
    type: "strength",
    muscleGroup: "shoulders",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 138,
    name: "Machine Shoulder Press",
    type: "strength",
    muscleGroup: "shoulders",
    equipment: "machine",
    isCustom: false,
    userId: null,
  },
  {
    id: 139,
    name: "Crunch",
    type: "strength",
    muscleGroup: "abs",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 140,
    name: "Cable Crunch",
    type: "strength",
    muscleGroup: "abs",
    equipment: "cable",
    isCustom: false,
    userId: null,
  },
  {
    id: 141,
    name: "Decline Crunch",
    type: "strength",
    muscleGroup: "abs",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 142,
    name: "Leg Raise (Lying)",
    type: "strength",
    muscleGroup: "abs",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 143,
    name: "Hanging Leg Raise",
    type: "strength",
    muscleGroup: "abs",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 144,
    name: "Knee Raise (Captain's Chair)",
    type: "strength",
    muscleGroup: "abs",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 145,
    name: "Plank",
    type: "strength",
    muscleGroup: "abs",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 146,
    name: "Side Plank",
    type: "strength",
    muscleGroup: "abs",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 147,
    name: "Ab Wheel Rollout",
    type: "strength",
    muscleGroup: "abs",
    equipment: "other",
    isCustom: false,
    userId: null,
  },
  {
    id: 148,
    name: "Russian Twist",
    type: "strength",
    muscleGroup: "abs",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 149,
    name: "Mountain Climbers",
    type: "strength",
    muscleGroup: "abs",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 150,
    name: "Toe Touch Crunch",
    type: "strength",
    muscleGroup: "abs",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 151,
    name: "Dead Bug",
    type: "strength",
    muscleGroup: "abs",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 152,
    name: "Pallof Press",
    type: "strength",
    muscleGroup: "abs",
    equipment: "cable",
    isCustom: false,
    userId: null,
  },
  {
    id: 153,
    name: "V-up",
    type: "strength",
    muscleGroup: "abs",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 154,
    name: "Treadmill Running",
    type: "cardio",
    muscleGroup: "cardio",
    equipment: "machine",
    isCustom: false,
    userId: null,
  },
  {
    id: 155,
    name: "Incline Walking",
    type: "cardio",
    muscleGroup: "cardio",
    equipment: "machine",
    isCustom: false,
    userId: null,
  },
  {
    id: 156,
    name: "Outdoor Running",
    type: "cardio",
    muscleGroup: "cardio",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 157,
    name: "Cycling (Stationary Bike)",
    type: "cardio",
    muscleGroup: "cardio",
    equipment: "machine",
    isCustom: false,
    userId: null,
  },
  {
    id: 158,
    name: "Spinning Class",
    type: "cardio",
    muscleGroup: "cardio",
    equipment: "machine",
    isCustom: false,
    userId: null,
  },
  {
    id: 159,
    name: "Rowing Machine",
    type: "cardio",
    muscleGroup: "cardio",
    equipment: "machine",
    isCustom: false,
    userId: null,
  },
  {
    id: 160,
    name: "Stair Climber",
    type: "cardio",
    muscleGroup: "cardio",
    equipment: "machine",
    isCustom: false,
    userId: null,
  },
  {
    id: 161,
    name: "Elliptical Trainer",
    type: "cardio",
    muscleGroup: "cardio",
    equipment: "machine",
    isCustom: false,
    userId: null,
  },
  {
    id: 162,
    name: "Jump Rope",
    type: "cardio",
    muscleGroup: "cardio",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 163,
    name: "HIIT Sprints",
    type: "cardio",
    muscleGroup: "cardio",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 164,
    name: "Battle Ropes",
    type: "cardio",
    muscleGroup: "cardio",
    equipment: "other",
    isCustom: false,
    userId: null,
  },
  {
    id: 165,
    name: "Kettlebell Swing (Conditioning)",
    type: "cardio",
    muscleGroup: "cardio",
    equipment: "other",
    isCustom: false,
    userId: null,
  },
  {
    id: 166,
    name: "Burpees",
    type: "cardio",
    muscleGroup: "cardio",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 167,
    name: "Swimming",
    type: "cardio",
    muscleGroup: "cardio",
    equipment: "bodyweight",
    isCustom: false,
    userId: null,
  },
  {
    id: 168,
    name: "Boxing / Heavy Bag Work",
    type: "cardio",
    muscleGroup: "cardio",
    equipment: "other",
    isCustom: false,
    userId: null,
  },
];

const INITIAL_FORM_STATE: ExerciseForm = {
  name: "",
  type: "strength",
  muscleGroup: "chest",
  equipment: "barbell",
};

const toLabel = (value: string) =>
  value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export default function ExerciseLibrary() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView | null>(null);
  const sectionOffsets = useRef<Record<string, number>>({});

  const [searchText, setSearchText] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("chest");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [formState, setFormState] = useState<ExerciseForm>(INITIAL_FORM_STATE);
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoadingExercises, setIsLoadingExercises] = useState(true);
  const [isSavingExercise, setIsSavingExercise] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");

  const loadExercises = async () => {
    setIsLoadingExercises(true);
    setLoadError("");
    try {
      console.log("checking login on library");
      const loginStatus = await checkLogin();
      if (loginStatus.success !== true) {
        console.log("check login returned false");
        router.replace('/');
        return;
      }

      const nextUserId = Number.parseInt(loginStatus.user_id, 10);
      if (Number.isNaN(nextUserId)) {
        throw new Error("Unable to resolve the current user");
      }

      console.log("exercise library user id:", nextUserId);
      setUserId(nextUserId);

      const fetchedExercises = await fetchExercises(nextUserId);
      setExercises(fetchedExercises);
    } catch (error) {
      const apiError = error as ApiError;
      const message =
        (error instanceof Error ? error.message : apiError.message) ||
        "Failed to load exercises";
      console.log(`error loading exercise library ${message}`);
      setLoadError(message);
    } finally {
      setIsLoadingExercises(false);
    }
  };

  useEffect(() => {
    void loadExercises();
  }, []);

  const showTwoColumnCards = width >= 960;
  const allExercises = exercises;
  const normalizedSearchText = searchText.trim().toLowerCase();
  const exerciseSections = MUSCLE_GROUPS.map((group) => ({
    ...group,
    exercises: allExercises.filter((exercise) => {
      const isMatchingGroup = exercise.muscleGroup === group.key;
      const isMatchingSearch =
        normalizedSearchText.length === 0 ||
        exercise.name.toLowerCase().includes(normalizedSearchText);

      return isMatchingGroup && isMatchingSearch;
    }),
  })).filter((group) => group.exercises.length > 0);

  const updateFormField = (field: keyof ExerciseForm, value: string) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSectionLayout = (
    muscleGroup: string,
    event: LayoutChangeEvent
  ) => {
    sectionOffsets.current[muscleGroup] = event.nativeEvent.layout.y;
  };

  // The sidebar uses measured section offsets so a tap can jump the main list
  // to the matching muscle group without introducing nested routes/screens.
  const scrollToSection = (muscleGroup: string) => {
    setSelectedMuscleGroup(muscleGroup);

    const sectionOffset = sectionOffsets.current[muscleGroup] ?? 0;
    scrollRef.current?.scrollTo({
      y: Math.max(sectionOffset - 8, 0),
      animated: true,
    });
  };

  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    // As the user scrolls, keep the sidebar highlight in sync with the section
    // currently closest to the top of the viewport.
    const scrollY = event.nativeEvent.contentOffset.y + 40;
    const activeGroup = [...MUSCLE_GROUPS]
      .reverse()
      .find((group) => (sectionOffsets.current[group.key] ?? Infinity) <= scrollY);

    if (activeGroup && activeGroup.key !== selectedMuscleGroup) {
      setSelectedMuscleGroup(activeGroup.key);
    }
  };

  const openModal = () => {
    setSaveError("");
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setFormState(INITIAL_FORM_STATE);
    setSaveError("");
  };

  const handleSaveExercise = async () => {
    const trimmedName = formState.name.trim();

    if (!trimmedName || userId === null) {
      return;
    }

    setIsSavingExercise(true);
    setSaveError("");

    try {
      const savedExercise = await createExercise({
        name: trimmedName,
        type: formState.type,
        muscleGroup: formState.muscleGroup,
        equipment: formState.equipment,
        userId,
      });

      console.log("Custom exercise saved:", savedExercise);
      setExercises((current) => [...current, savedExercise]);
      setSearchText("");
      closeModal();

      requestAnimationFrame(() => {
        scrollToSection(savedExercise.muscleGroup);
      });
    } catch (error) {
      const apiError = error as ApiError;
      setSaveError(apiError.message || "Failed to save exercise");
    } finally {
      setIsSavingExercise(false);
    }
  };

  const isSaveDisabled =
    formState.name.trim().length === 0 || isSavingExercise || userId === null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerBlock}>
          <Text style={styles.screenTitle}>Exercise Library</Text>
          <Text style={styles.screenSubtitle}>
            Browse core lifts and add quick custom movements without leaving the
            page.
          </Text>
        </View>

        <View style={styles.searchRow}>
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Enter exercise name to search"
            placeholderTextColor="#6a6f74"
            style={styles.searchInput}
            autoCapitalize="words"
          />

          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
            ]}
            onPress={openModal}
            accessibilityRole="button"
            accessibilityLabel="Add custom exercise"
          >
            <Text style={styles.addButtonText}>+</Text>
          </Pressable>
        </View>

        <View style={styles.libraryShell}>
          <ScrollView
            style={styles.sidebar}
            contentContainerStyle={styles.sidebarContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sidebarHeading}>Muscle Groups</Text>
            {MUSCLE_GROUPS.map((group) => {
              const isSelected = selectedMuscleGroup === group.key;

              return (
                <Pressable
                  key={group.key}
                  style={[
                    styles.sidebarItem,
                    isSelected && styles.sidebarItemSelected,
                  ]}
                  onPress={() => scrollToSection(group.key)}
                >
                  <Text
                    style={[
                      styles.sidebarItemText,
                      isSelected && styles.sidebarItemTextSelected,
                    ]}
                  >
                    {group.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <ScrollView
            ref={scrollRef}
            style={styles.exerciseScroll}
            contentContainerStyle={styles.exerciseScrollContent}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {isLoadingExercises ? (
              <View style={styles.emptyState}>
                <ActivityIndicator size="large" color="#1db954" />
                <Text style={styles.emptyStateTitle}>Loading exercises...</Text>
              </View>
            ) : loadError ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>Could not load exercises</Text>
                <Text style={styles.emptyStateText}>{loadError}</Text>
              </View>
            ) : exerciseSections.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>No exercises found</Text>
                <Text style={styles.emptyStateText}>
                  Try a different search term or add a custom exercise with the
                  green plus button.
                </Text>
              </View>
            ) : (
              exerciseSections.map((group) => (
                <View
                  key={group.key}
                  style={styles.sectionBlock}
                  onLayout={(event) => handleSectionLayout(group.key, event)}
                >
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{group.label}</Text>
                    <Text style={styles.sectionCount}>
                      {group.exercises.length} exercise
                      {group.exercises.length === 1 ? "" : "s"}
                    </Text>
                  </View>

                  <View style={styles.cardGrid}>
                    {group.exercises.map((exercise) => (
                      <View
                        key={exercise.id}
                        style={[
                          styles.exerciseCard,
                          showTwoColumnCards
                            ? styles.exerciseCardWide
                            : styles.exerciseCardFull,
                        ]}
                      >
                        <View style={styles.cardTitleRow}>
                          <Text style={styles.exerciseName}>{exercise.name}</Text>
                          {exercise.isCustom ? (
                            <View style={styles.customBadge}>
                              <Text style={styles.customBadgeText}>Custom</Text>
                            </View>
                          ) : null}
                        </View>
                        <Text style={styles.exerciseMeta}>
                          {toLabel(exercise.type)} | {toLabel(exercise.equipment)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>

      <Modal
        visible={isModalVisible}
        animationType="fade"
        transparent
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalRoot}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable style={styles.modalBackdrop} onPress={closeModal} />
          <View style={styles.modalSheet}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalScrollContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Custom Exercise</Text>
                <Pressable
                  onPress={closeModal}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Close custom exercise modal"
                >
                  <Text style={styles.modalCloseText}>X</Text>
                </Pressable>
              </View>

              <Text style={styles.fieldLabel}>Exercise Name</Text>
              <TextInput
                value={formState.name}
                onChangeText={(value) => updateFormField("name", value)}
                placeholder="e.g. Adam Press"
                placeholderTextColor="#6a6f74"
                style={styles.modalInput}
                autoCapitalize="words"
              />

              <Text style={styles.fieldLabel}>Exercise Type</Text>
              <View style={styles.optionRow}>
                {EXERCISE_TYPES.map((option) => {
                  const isActive = formState.type === option;
 
                  return (
                    <Pressable
                      key={option}
                      style={[styles.optionChip, isActive && styles.optionChipActive]}
                      onPress={() => updateFormField("type", option)}
                    >
                      <Text
                        style={[
                          styles.optionChipText,
                          isActive && styles.optionChipTextActive,
                        ]}
                      >
                        {toLabel(option)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>Muscle Group</Text>
              <View style={styles.optionRow}>
                {MUSCLE_GROUPS.map((option) => {
                  const isActive = formState.muscleGroup === option.key;

                  return (
                    <Pressable
                      key={option.key}
                      style={[styles.optionChip, isActive && styles.optionChipActive]}
                      onPress={() => updateFormField("muscleGroup", option.key)}
                    >
                      <Text
                        style={[
                          styles.optionChipText,
                          isActive && styles.optionChipTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {saveError ? (
                <Text style={styles.modalErrorText}>{saveError}</Text>
              ) : null}

              <View style={styles.modalActions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.cancelButton,
                    pressed && styles.cancelButtonPressed,
                  ]}
                  onPress={closeModal}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.saveButton,
                    isSaveDisabled && styles.saveButtonDisabled,
                    pressed && !isSaveDisabled && styles.saveButtonPressed,
                  ]}
                  onPress={handleSaveExercise}
                  disabled={isSaveDisabled}
                >
                  {isSavingExercise ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save</Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#2b2f33",
  },

  container: {
    flex: 1,
    backgroundColor: "#2b2f33",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
  },

  headerBlock: {
    marginBottom: 18,
  },

  screenTitle: {
    color: "#f5f7f8",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  screenSubtitle: {
    color: "#b5bcc3",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    maxWidth: 560,
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  searchInput: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    color: "#101214",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginRight: 12,
  },

  addButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#1db954",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  addButtonPressed: {
    transform: [{ scale: 0.97 }],
    backgroundColor: "#17a14a",
  },

  addButtonText: {
    color: "#ffffff",
    fontSize: 30,
    lineHeight: 30,
    fontWeight: "600",
  },

  libraryShell: {
    flex: 1,
    flexDirection: "row",
    minHeight: 0,
  },

  sidebar: {
    width: "24%",
    backgroundColor: "#34393f",
    borderRadius: 20,
    marginRight: 8,
  },

  sidebarContent: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },

  sidebarHeading: {
    color: "#e7eaec",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 14,
    paddingHorizontal: 8,
  },

  sidebarItem: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 6,
  },

  sidebarItemSelected: {
    backgroundColor: "#1db954",
  },

  sidebarItemText: {
    color: "#c6ccd1",
    fontSize: 13,
    fontWeight: "600",
  },

  sidebarItemTextSelected: {
    color: "#ffffff",
  },

  exerciseScroll: {
    width: "74%",
    backgroundColor: "#31363b",
    borderRadius: 20,
  },

  exerciseScrollContent: {
    padding: 18,
    paddingBottom: 32,
  },

  sectionBlock: {
    marginBottom: 24,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  sectionTitle: {
    color: "#f5f7f8",
    fontSize: 22,
    fontWeight: "700",
  },

  sectionCount: {
    color: "#a8b0b7",
    fontSize: 13,
  },

  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },

  exerciseCard: {
    backgroundColor: "#3b4147",
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#464d54",
  },

  exerciseCardWide: {
    width: "47%",
  },

  exerciseCardFull: {
    width: "100%",
  },

  cardTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },

  exerciseName: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    paddingRight: 12,
  },

  exerciseMeta: {
    color: "#b5bcc3",
    fontSize: 13,
  },

  customBadge: {
    backgroundColor: "rgba(29, 185, 84, 0.16)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  customBadgeText: {
    color: "#7ef0aa",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  emptyState: {
    backgroundColor: "#3b4147",
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: "#464d54",
  },

  emptyStateTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },

  emptyStateText: {
    color: "#b5bcc3",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },

  modalRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8, 10, 12, 0.78)",
  },

  modalSheet: {
    width: "100%",
    maxWidth: 620,
    maxHeight: "88%",
    backgroundColor: "#31363b",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#464d54",
    padding: 22,
  },

  modalScrollContent: {
    paddingBottom: 4,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  modalTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
  },

  modalCloseText: {
    color: "#c6ccd1",
    fontSize: 18,
    fontWeight: "700",
  },

  fieldLabel: {
    color: "#f5f7f8",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 6,
  },

  modalInput: {
    backgroundColor: "#f5f5f5",
    color: "#101214",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 10,
  },

  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },

  optionChip: {
    backgroundColor: "#3c4248",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#4b535b",
  },

  optionChipActive: {
    backgroundColor: "#1db954",
    borderColor: "#1db954",
  },

  optionChipText: {
    color: "#d2d7dc",
    fontSize: 13,
    fontWeight: "600",
  },

  optionChipTextActive: {
    color: "#ffffff",
  },

  modalErrorText: {
    color: "#ff8d8d",
    fontSize: 13,
    marginTop: 8,
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },

  cancelButton: {
    backgroundColor: "#3b4147",
    borderWidth: 1,
    borderColor: "#535b63",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    marginRight: 10,
  },

  cancelButtonPressed: {
    backgroundColor: "#444b51",
  },

  cancelButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },

  saveButton: {
    backgroundColor: "#1db954",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },

  saveButtonPressed: {
    backgroundColor: "#18a34c",
  },

  saveButtonDisabled: {
    opacity: 0.55,
  },

  saveButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});

