import {apiFetch} from "./api";
export interface WorkoutSet {
  workout_log_id: number;
  exercise_id: number;
  exercise_name: string;
  exercise_type: string;
  created_at: string;
  sets: Sets[];
}

export interface Sets {
  id: number;
  set_number: number;
  weight: number;
  reps: number;
}
export async function fetchExerciseHistory(
  exerciseId: number
): Promise<WorkoutSet[]> {
  const data = await apiFetch<{ history: WorkoutSet[] }>(
    `/workouts/${exerciseId}/history`
  );
  return data.history;
}
