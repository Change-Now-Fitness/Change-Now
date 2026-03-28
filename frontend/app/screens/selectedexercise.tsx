
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View, StyleSheet, Dimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchCurrentSets, addSet } from "../../lib/api";
import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { checkLogin } from '../../services/auth';
import { fetchExerciseHistory, WorkoutSet } from "@/lib/exercise";
import { LineChart } from "react-native-chart-kit";
import { colors, spacing, fontSize, borderRadius } from "@/lib/theme";


export default function SelectedExerciseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string; exerciseId?: string }>();

  const exerciseId = Number(params.exerciseId) || 0;
  const exerciseName =
    typeof params.name === "string" && params.name.length > 0
      ? params.name
      : "Selected Exercise";


  // const [currentSets, setCurrentSets] = useState<WorkoutSet[]>([
  //   { set: 1, weight: 110, reps: 8 },
  //   { set: 2, weight: 115, reps: 7 },
  //   { set: 3, weight: 120, reps: 6 },
  // ]);

  const [history, setHistory] = useState<WorkoutSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<number | null>(null);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await fetchExerciseHistory(exerciseId);
      setHistory(data);
      setError("");
    } catch (e: any) {
      setError(e.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  // Get the logged-in user's ID

  useEffect(() => {
    const loadUserId = async () => {
      const { success, user_id } = await checkLogin();
      if (success) {
        setUserId(parseInt(user_id));
      }
    };

    loadUserId();
    loadHistory();
  }, []);

  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const dataForGraph = sortedHistory.map(set => {
    const sets = set.sets || [];

    const { totalWeight, totalReps } = sets.reduce(
      (acc, set) => {
        acc.totalWeight += set.weight || 0;
        acc.totalReps += set.reps || 0;
        return acc;
      },
      { totalWeight: 0, totalReps: 0 }
    );

    const count = sets.length;

    return {
      avg_weight: count ? totalWeight / count : 0,
      avg_reps: count ? totalReps / count : 0,
    };
  });


  // Handler for adding sets

  return (
    <ScrollView style={s.scrollView} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={s.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <Text style={s.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>{exerciseName}</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Chart */}
      <View style={s.historyCard}>
        {history && history.length > 0 ? (
          <View style={{ borderRadius: borderRadius.md, overflow: 'hidden' }}>
            <LineChart data={{
              labels: sortedHistory.map(item => item.created_at.slice(5, 10) || ''),
              datasets: [
                { data: dataForGraph.map(item => item.avg_weight || 0), color: () => "rgb(255,99,132)" },
                { data: dataForGraph.map(item => item.avg_reps || 0), color: () => "blue" },
              ], legend: ["Volume", "Calories"],
            }}
              width={Dimensions.get("window").width - 66}
              height={220}
              chartConfig={{
                backgroundGradientFrom: colors.bgCard,
                backgroundGradientTo: colors.bgCard,
                color: () => 'white',
                style: {
                  borderRadius: borderRadius.md,
                },
                propsForBackgroundLines: {
                  strokeDasharray: "5,5",
                  stroke: "rgba(255, 255, 255, 0.3)",
                }
              }} bezier />
          </View>
        ) : (
          <View style={{ height: 220, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'white' }}>
              No history data
            </Text>
          </View>
        )}
      </View>

      {/* History */}
      <Text style={s.sectionTitle}>Previous Workouts</Text>

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
  },
  cell: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  setInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginHorizontal: 4,
    fontSize: fontSize.sm,
    textAlign: "center",
    color: colors.text,
    backgroundColor: colors.bgInput,
  },
  buttonRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  outlineButton: {
    flex: 1,
    height: 38,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  outlineButtonText: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.primary,
  },
  solidButton: {
    flex: 1,
    height: 38,
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
});