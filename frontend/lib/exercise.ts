
export interface WorkoutSet {
  workout_log_id: number;
  exercise_id: number;
  exercise_name: string;
  created_at: string;
  sets: Sets[];
}

export interface Sets {
  id: number;
  set_number: number;
  weight: number;
  reps: number;
}

