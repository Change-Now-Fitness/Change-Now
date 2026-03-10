import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { styles } from "./styles";

type WorkoutSet = {
  set: number;
  weight: number;
  reps: number;
};

type PreviousWorkout = {
  date: string;
  sets: WorkoutSet[];
};

const CURRENT_WORKOUT_SETS: WorkoutSet[] = [
  { set: 1, weight: 110, reps: 8 },
  { set: 2, weight: 115, reps: 7 },
  { set: 3, weight: 120, reps: 6 },
];

const PREVIOUS_WORKOUTS: PreviousWorkout[] = [
  {
    date: "2025-01-21",
    sets: [
      { set: 1, weight: 110, reps: 8 },
      { set: 2, weight: 110, reps: 7 },
    ],
  },
  {
    date: "2025-01-19",
    sets: [
      { set: 1, weight: 105, reps: 8 },
      { set: 2, weight: 105, reps: 6 },
    ],
  },
];

export default function SelectedExerciseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string }>();

  const exerciseName =
    typeof params.name === "string" && params.name.length > 0
      ? params.name
      : "Selected Exercise";

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backText}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{exerciseName}</Text>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartPlaceholderText}>
          Progress chart (placeholder)
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Current Workout</Text>
      <View style={styles.currentWorkoutCard}>
        <View style={styles.tableHeaderRow}>
          <Text style={styles.tableCellHeader}>Set</Text>
          <Text style={styles.tableCellHeader}>Weight</Text>
          <Text style={styles.tableCellHeader}>Reps</Text>
        </View>
        {CURRENT_WORKOUT_SETS.map((set) => (
          <View key={set.set} style={styles.tableRow}>
            <Text style={styles.tableCell}>{set.set}</Text>
            <Text style={styles.tableCell}>{set.weight}</Text>
            <Text style={styles.tableCell}>{set.reps}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Previous Workouts</Text>
      <View style={styles.previousContainer}>
        <ScrollView
          style={styles.previousScroll}
          showsVerticalScrollIndicator={false}
        >
          {PREVIOUS_WORKOUTS.map((workout) => (
            <View key={workout.date}>
              <Text style={styles.previousDate}>{workout.date}</Text>
              <View style={styles.tableHeaderRow}>
                <Text style={styles.tableCellHeader}>Set</Text>
                <Text style={styles.tableCellHeader}>Weight</Text>
                <Text style={styles.tableCellHeader}>Reps</Text>
              </View>
              {workout.sets.map((set) => (
                <View
                  key={`${workout.date}-${set.set}`}
                  style={styles.tableRow}
                >
                  <Text style={styles.tableCell}>{set.set}</Text>
                  <Text style={styles.tableCell}>{set.weight}</Text>
                  <Text style={styles.tableCell}>{set.reps}</Text>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}