import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchCurrentSets, fetchExerciseHistory, addSet, deleteSet, addLap } from "../../lib/api";
import React, { useState, useEffect } from "react";
import { checkLogin } from "../../services/auth";
import { colors, spacing, fontSize, borderRadius } from "@/lib/theme";
import { LineChart } from "react-native-chart-kit";
import { useWindowDimensions } from "react-native";



type WorkoutSet = {
  id?: number;
  set: number;
  weight: number;
  reps: number;
};

type PreviousWorkout = {
  date: string;
  sets: WorkoutSet[];
};

export default function SelectedExerciseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ 
    name?: string; 
    exerciseId?: string;
    exerciseCategory?: string;
  }>();
  
  const { width } = useWindowDimensions();
  const exerciseId = params.exerciseId ?? "";
  const isCardio = params.exerciseCategory === "cardio";
  const exerciseName =
    typeof params.name === "string" && params.name.length > 0
      ? params.name
      : "Selected Exercise";
  

  console.log('exerciseId param received:', exerciseId);

  const [weightText, setWeightText] = useState("");
  const [repsText, setRepsText] = useState("");
  const [currentSets, setCurrentSets] = useState<WorkoutSet[]>([]);
  const [previousWorkouts, setPreviousWorkouts] = useState<PreviousWorkout[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [loadingCurrent, setLoadingCurrent] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState("");

  // Cardio specific variables
  const [hoursText, setHoursText] = useState("");
  const [minutesText, setMinutesText] = useState("");
  const [secondsText, setSecondsText] = useState("");
  

  // Get the logged-in user's ID
  useEffect(() => {
    const loadUserId = async () => {
      const { success, user_id } = await checkLogin();
      if (success) {
        setUserId(parseInt(user_id));
      }
    };
    loadUserId();
  }, []);

  const loadCurrentSets = async () => {
    if (!exerciseId || !userId) return;

      setLoadingCurrent(true);
      try {
        const today = new Date().toISOString().split("T")[0];
        const data = await fetchCurrentSets(exerciseId, userId, today);
        const mapped: WorkoutSet[] = data.map((row: any, index: number) => {
        const isCardioRow =
          row.duration_seconds !== null && row.duration_seconds !== undefined;

        return {
          id: typeof row.id === "number" ? row.id : Number(row.id),
          set: index + 1,
          weight: isCardioRow
            ? Number(row.duration_seconds)
            : parseFloat(row.weight),
          reps: isCardioRow
            ? Number(row.distance)
            : row.reps,
        };
      });
        setCurrentSets(mapped);
      } catch (err: any) {
        console.error("Error fetching sets:", err.message);
        setError(err.message || "Failed to load today's sets");
      } finally {
        setLoadingCurrent(false);
      }
  };

  // Fetch today's sets
  useEffect(() => {
    if (!exerciseId || !userId) return;

    loadCurrentSets();
  }, [exerciseId, userId]);

  // Fetch previous workouts grouped by date
  useEffect(() => {
    if (!exerciseId || !userId) return;

    const loadHistory = async () => {
      setLoadingHistory(true);
      try {
        const grouped = await fetchExerciseHistory(exerciseId, userId);
        const shaped: PreviousWorkout[] = Object.entries(grouped).map(
          ([date, sets]: [string, any]) => ({
            date: date as string,
            sets: sets.map((s: any, i: number) => ({
              set: i + 1,
              weight: parseFloat(s.weight),
              reps: s.reps,
            })),
          })
        );
        // Sort oldest to newest for the chart
        shaped.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setPreviousWorkouts(shaped);
      } catch (err: any) {
        console.error("Error fetching history:", err.message);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();
  }, [exerciseId, userId]);

 const handleAddSet = async () => {
  if (!userId || !exerciseId) return;

  let weight: number | null = null;
  let durationSeconds: number | null = null;
  let distance: number | null = null;
  let reps: number | null = null;

  if (isCardio) {
    // Build duration
    const h = parseInt(hoursText || "0", 10);
    const m = Math.min(parseInt(minutesText || "0", 10), 59);
    const s = Math.min(parseInt(secondsText || "0", 10), 59);

    durationSeconds = h * 3600 + m * 60 + s;

    // Distance (reuse repsText)
    distance = parseFloat(repsText);

    // Validation
    if (!durationSeconds || isNaN(distance)) return;

  } else {
    // Strength mode
    weight = parseFloat(weightText);
    reps = parseInt(repsText, 10);

    if (isNaN(weight) || isNaN(reps)) return;
  }

  // Optimistic UI update
  const optimisticSet: WorkoutSet = {
    set: currentSets.length + 1,
    weight: isCardio ? durationSeconds! : weight!,
    reps: isCardio ? distance! : reps!,
  };

  setCurrentSets((prev) => [...prev, optimisticSet]);

  // Reset inputs
  if (isCardio) {
    setHoursText("");
    setMinutesText("");
    setSecondsText("");
  } else {
    setWeightText("");
  }
  setRepsText("");

  try {
    if (isCardio) {
      await addLap(exerciseId, userId, durationSeconds!, distance!);
    } else {
      await addSet(exerciseId, userId, weight!, reps!);
    }

    await loadCurrentSets();
  } catch (err: any) {
    setCurrentSets((prev) => prev.slice(0, -1));
    setError(err.message || "Failed to save set");
  }
};

  const handleDeleteSet = async (targetSet: WorkoutSet) => {
    const previous = currentSets;

    setCurrentSets((prev) =>
      prev
        .filter((item) => item.set !== targetSet.set)
        .map((item, index) => ({ ...item, set: index + 1 }))
    );

    if (!targetSet.id || !userId) return;

    try {
      await deleteSet(targetSet.id, userId);
    } catch (err: any) {
      setCurrentSets(previous);
      setError(err.message || "Failed to delete set");
    }
  };

  const confirmDeleteSet = (targetSet: WorkoutSet) => {
    const message = `Delete ${isCardio ? "lap" : "set"} ${targetSet.set}?`;

    if (Platform.OS === "web") {
      const confirmed = window.confirm(message);
      if (confirmed) {
        void handleDeleteSet(targetSet);
      }
      return;
    }

    Alert.alert("Delete set", message, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => void handleDeleteSet(targetSet) },
    ]);
  };

  const totalSeconds =
    parseInt(hoursText || "0", 10) * 3600 +
    parseInt(minutesText || "0", 10) * 60 +
    parseInt(secondsText || "0", 10);

  const isAddDisabled = isCardio
    ? totalSeconds === 0 || repsText.trim().length === 0
    : weightText.trim().length === 0 || repsText.trim().length === 0;

  // Build today's entry if currentSets exists
  const todayEntry: PreviousWorkout | null =
    currentSets.length > 0
      ? {
          date: new Date().toISOString().split("T")[0],
          sets: currentSets,
        }
      : null;

  // Combines history + today's sets, oldest to newest
  const allWorkoutsForChart = [
    ...previousWorkouts,
    ...(todayEntry ? [todayEntry] : []),
  ];

  // Build a point for every logged set so the chart shows true set-by-set changes
  // (e.g. 100 -> 120 -> 80 as three consecutive points).
  const setPoints = allWorkoutsForChart.flatMap((workout) =>
    workout.sets.map((set, index) => ({
      weight: set.weight,
      reps: set.reps,
      dateLabel: workout.date.slice(5),
      setNumber: index + 1,
    }))
  );

  // Reduce X-axis clutter: show date on the first set of each day,
  // then show only set numbers for the remaining sets on that same day.
  const labels = setPoints.map((point) =>
    point.setNumber === 1
      ? `${point.dateLabel} #${point.setNumber}`
      : `#${point.setNumber}`
  );


  // Calculates pace (time / distance) as the y-axis for the chart
  const chartValues = setPoints.map((point) => {
    if (!isCardio) return point.weight;

    const time = point.weight;   // seconds
    const dist = point.reps;     // distance

    if (!dist || dist === 0) return 0;

    return -time / dist; 
  });


  const chartData =
    setPoints.length > 0
      ? {
          labels,
          datasets: [
            {
              data: chartValues,
              color: () => colors.primary,
            },
          ],
          legend: [isCardio ? "Pace by Lap (time/mi)" : "Weight by Set (lbs)"],
        }
      : null;


  // Maps time from duration_seconds
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  // Formatting for the cardio Y-axis
  const formatPace = (secondsPerUnit: number) => {
  if (!secondsPerUnit || !isFinite(secondsPerUnit)) return "--";

  const m = Math.floor(secondsPerUnit / 60);
  const s = Math.round(secondsPerUnit % 60);

  return `${m}:${s.toString().padStart(2, "0")}/mi`;
};

  return (
    <ScrollView style={s.scrollView} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={s.headerRow}>
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/(tabs)/exerciselibrary"); // go back to this page on refresh
            }
          }}
          style={s.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={s.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>{exerciseName}</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Chart */}
      
      <View style={s.historyCard}>
        {loadingHistory ? (
          <View style={s.centeredRow}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : chartData ? (
          <LineChart
            data={chartData}
            width={width - 80}
            height={220}
            chartConfig={{
              backgroundGradientFrom: colors.bgCard,
              backgroundGradientTo: colors.bgCard,
              color: () => colors.primary,
              labelColor: () => colors.textSecondary,
              style: { borderRadius: borderRadius.md },
              propsForBackgroundLines: {
                strokeDasharray: "5,5",
                stroke: "rgba(255,255,255,0.15)",
              },
            }}
            formatYLabel={(value) =>
              isCardio ? formatPace(Math.abs(Number(value))) : value
            }
            bezier
          />
        ) : (
          <View style={{ height: 220, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>
              No history data yet
            </Text>
          </View>
        )}
      </View>

      {/* Current Workout */}
      <Text style={s.sectionTitle}>Current Workout</Text>
      {error ? <Text style={s.errorText}>{error}</Text> : null}
      <View style={s.card}>
        <View style={s.tableHeader}>
          <Text style={s.headerCell}>
            {isCardio ? "Lap" : "Set"}
          </Text>
          <Text style={s.headerCell}>
            {isCardio ? "Time" : "Weight"}
          </Text>
          <Text style={s.headerCell}>
            {isCardio ? "Distance" : "Reps"}
          </Text>
          <Text style={[s.headerCell, s.actionHeader]}>Action</Text>
        </View>

        {loadingCurrent ? (
          <View style={s.centeredRow}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : currentSets.length === 0 ? (
          <View style={s.centeredRow}>
            <Text style={s.emptyText}>
              {isCardio ? "No laps logged today" : "No sets logged today" }
            </Text>
          </View>
        ) : (
          currentSets.map((set) => (
            <View key={set.id ?? set.set} style={s.tableRow}>
              <Text style={s.cell}>{set.set}</Text>
              <Text style={s.cell}>
                {isCardio ? formatTime(set.weight) : `${set.weight} lbs`}
              </Text>
              <Text style={s.cell}>
                {isCardio ? `${set.reps} mi` : set.reps}
              </Text>
              <TouchableOpacity
                style={s.deleteButton}
                onPress={() => confirmDeleteSet(set)}
                accessibilityRole="button"
                accessibilityLabel={`Delete set ${set.set}`}
              >
                <Text style={s.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Add Set inputs */}
        <View style={s.addRow}>
          {isCardio ? (
            <>
              {/* Time input: HH MM SS */}
              <View style={s.timeGroup}>
                <TextInput
                  style={s.timeInput}
                  placeholder="HH"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={hoursText}
                  onChangeText={(t) => setHoursText(t.replace(/[^0-9]/g, ""))}
                  maxLength={2}
                />
                <TextInput
                  style={s.timeInput}
                  placeholder="MM"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={minutesText}
                  onChangeText={(t) => setMinutesText(t.replace(/[^0-9]/g, ""))}
                  maxLength={2}
                />
                <TextInput
                  style={s.timeInput}
                  placeholder="SS"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={secondsText}
                  onChangeText={(t) => setSecondsText(t.replace(/[^0-9]/g, ""))}
                  maxLength={2}
                />
              </View>

              {/* Distance input */}
              <TextInput
                style={s.setInput}
                placeholder="Distance"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={repsText}
                onChangeText={(text) =>
                  setRepsText(text.replace(/[^0-9.]/g, ""))
                }
              />
            </>
          ) : (
            <>
            {/* Strength inputs */}
            <TextInput
              style={s.setInput}
              placeholder="Weight"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={weightText}
              onChangeText={(text) =>
                setWeightText(text.replace(/[^0-9.]/g, ""))
              }
            />
            <TextInput
              style={s.setInput}
              placeholder="Reps"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={repsText}
              onChangeText={(text) =>
                setRepsText(text.replace(/[^0-9]/g, ""))
              }
            />
            </>
          )}
        </View>

        <View style={s.buttonRow}>
          <TouchableOpacity
            style={[s.solidButton, isAddDisabled && s.buttonDisabled]}
            onPress={handleAddSet}
            disabled={isAddDisabled}
          >
            <Text style={s.solidButtonText}>+ Add Set</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Previous Workouts */}
      <Text style={s.sectionTitle}>Previous Workouts</Text>

      {loadingHistory ? (
        <View style={s.centeredRow}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : previousWorkouts.length === 0 ? (
        <View style={[s.card, s.centeredRow]}>
          <Text style={s.emptyText}>No previous workouts recorded yet</Text>
        </View>
      ) : (
        // Show newest first in the list
        [...previousWorkouts].reverse().map((workout) => (
          <View key={workout.date} style={s.card}>
            <Text style={s.historyDate}>{workout.date}</Text>
            <View style={s.tableHeader}>
              <Text style={s.headerCell}>Set</Text>
              <Text style={s.headerCell}>Weight</Text>
              <Text style={s.headerCell}>Reps</Text>
            </View>
            {workout.sets.map((set) => (
              <View key={`${workout.date}-${set.set}`} style={s.tableRow}>
                <Text style={s.cell}>{set.set}</Text>
                <Text style={s.cell}>{set.weight} lbs</Text>
                <Text style={s.cell}>{set.reps}</Text>
              </View>
            ))}
          </View>
        ))
      )}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bgCard,
    justifyContent: "center",
    alignItems: "center",
  },
  backText: { fontSize: 22, color: colors.text, marginTop: -2 },
  title: {
    flex: 1,
    fontSize: fontSize.xl,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  tableHeader: {
    flexDirection: "row",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  headerCell: {
    flex: 1,
    fontSize: fontSize.xs,
    fontWeight: "600",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  actionHeader: {
    flex: 0,
    width: 72,
    textAlign: "right",
  },
  tableRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  cell: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  deleteButton: {
    width: 72,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,120,120,0.45)",
    borderRadius: borderRadius.sm,
    paddingVertical: 4,
    backgroundColor: "rgba(255,100,100,0.12)",
  },
  deleteButtonText: {
    color: "#ff8a80",
    fontSize: fontSize.xs,
    fontWeight: "700",
  },
  addRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.sm,
    flexWrap: "wrap",
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  setInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: fontSize.sm,
    textAlign: "center",
    color: colors.text,
    backgroundColor: colors.bgInput,
  },
  timeGroup: {
  flexDirection: "row",
  flex: 2,
  gap: 6,
  minWidth: 140, 
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 40,
    textAlign: "center",
    backgroundColor: colors.bgInput,
  },
  distanceInput: {
    flex: 1,
    minWidth: 90,
  },
  buttonRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    gap: spacing.sm,
  },
  solidButton: {
    flex: 1,
    height: 42,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  solidButtonText: {
    fontSize: fontSize.sm,
    fontWeight: "700",
    color: colors.text,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  historyCard: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  historyDate: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  centeredRow: {
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: "#ff8a80",
    marginBottom: spacing.sm,
  },
});