
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchCurrentSets, fetchExerciseHistory, addSet } from "../../lib/api";
import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { checkLogin } from '../../services/auth';
import { colors, spacing, fontSize, borderRadius } from "@/lib/theme";
import * as Api from "../../lib/api";
console.log("Api exports:", Object.keys(Api));

type WorkoutSet = {
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
  const params = useLocalSearchParams<{ name?: string; exerciseId?: string }>();

  const exerciseId = params.exerciseId ?? "";
  const exerciseName =
    typeof params.name === "string" && params.name.length > 0
      ? params.name
      : "Selected Exercise";


  const [weightText, setWeightText] = useState("");
  const [repsText, setRepsText] = useState("");
  const [currentSets, setCurrentSets] = useState<WorkoutSet[]>([]);
  const [previousWorkouts, setPreviousWorkouts] = useState<PreviousWorkout[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [loadingCurrent, setLoadingCurrent] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState("");

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
  
  // Fetch today's sets 
  useEffect(() => {
    if (!exerciseId || !userId) return;
 
    const loadSets = async () => {
      setLoadingCurrent(true);
      try {
        const today = new Date().toISOString().split("T")[0];
        const data = await fetchCurrentSets(exerciseId, userId, today);
        const mapped: WorkoutSet[] = data.map((row: any, index: number) => ({
          set: index + 1,
          weight: parseFloat(row.weight),
          reps: row.reps,
        }));
        setCurrentSets(mapped);
      } catch (err: any) {
        console.error("Error fetching sets:", err.message);
        setError(err.message || "Failed to load today's sets");
      } finally {
        setLoadingCurrent(false);
      }
    };
 
    loadSets();
  }, [exerciseId, userId]);
 
  // Fetch previous workouts (all past dates)
  useEffect(() => {
    if (!exerciseId || !userId) return;
 
    const loadHistory = async () => {
      setLoadingHistory(true);
      try {
         const grouped = await fetchExerciseHistory(exerciseId, userId);
         const shaped: PreviousWorkout[] = Object.entries(grouped).map(
          ([date, sets]: [string, any]) => ({
            date,
            sets: sets.map((s: any, i: number) => ({
              set: i + 1,
              weight: parseFloat(s.weight),
              reps: s.reps,
            })),
          })
        );
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
    const weight = parseFloat(weightText);
    const reps = parseInt(repsText, 10);
 
    if (isNaN(weight) || isNaN(reps)) return;
 
    const newSet: WorkoutSet = {
      set: currentSets.length + 1,
      weight,
      reps,
    };
 
    setCurrentSets((prev) => [...prev, newSet]);
    setWeightText("");
    setRepsText("");
 
    try {
      await addSet(exerciseId, userId!, weight, reps);
    } catch (err: any) {
      // Roll back on failure
      setCurrentSets((prev) => prev.slice(0, -1));
      console.error("Failed to save set:", err.message);
    }
  };
 
  const isAddDisabled =
    weightText.trim().length === 0 || repsText.trim().length === 0;
 
  return (
    <ScrollView style={s.scrollView} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={s.headerRow}>
        <TouchableOpacity
          onPress={() => router.push({pathname: "../exerciselibrary"})}
          style={s.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={s.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>{exerciseName}</Text>
        <View style={{ width: 32 }} />
      </View>
 
      {/* Chart placeholder */}
      <View style={s.historyCard}>
        <View style={{ height: 220, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>
            Progress chart coming soon
          </Text>
        </View>
      </View>
 
      {/* Current Workout */}
      <Text style={s.sectionTitle}>Current Workout</Text>
      <View style={s.card}>
        <View style={s.tableHeader}>
          <Text style={s.headerCell}>Set</Text>
          <Text style={s.headerCell}>Weight</Text>
          <Text style={s.headerCell}>Reps</Text>
        </View>
 
        {loadingCurrent ? (
          <View style={s.centeredRow}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : currentSets.length === 0 ? (
          <View style={s.centeredRow}>
            <Text style={s.emptyText}>No sets logged yet today</Text>
          </View>
        ) : (
          currentSets.map((set) => (
            <View key={set.set} style={s.tableRow}>
              <Text style={s.cell}>{set.set}</Text>
              <Text style={s.cell}>{set.weight} lbs</Text>
              <Text style={s.cell}>{set.reps}</Text>
            </View>
          ))
        )}
 
        {/* Add Set inputs */}
        <View style={s.addRow}>
          <TextInput
            style={s.setInput}
            placeholder="Weight"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={weightText}
            onChangeText={(text) => setWeightText(text.replace(/[^0-9.]/g, ""))}
          />
          <TextInput
            style={s.setInput}
            placeholder="Reps"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={repsText}
            onChangeText={(text) => setRepsText(text.replace(/[^0-9]/g, ""))}
          />
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
        previousWorkouts.map((workout) => (
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
  addRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.sm,
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
});