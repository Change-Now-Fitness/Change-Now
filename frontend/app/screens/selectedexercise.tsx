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
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchCurrentSets, fetchExerciseHistory, addSet, deleteSet, addLap } from "../../lib/api";
import React, { useState, useEffect } from "react";
import { checkLogin } from "../../services/auth";
import { colors, spacing, fontSize, borderRadius } from "@/lib/theme";
import { useWindowDimensions } from "react-native";
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryScatter,
} from "@/lib/chart";

console.log("VictoryChart:", VictoryChart);
console.log("VictoryLine:", VictoryLine);
console.log("VictoryAxis:", VictoryAxis);
console.log("VictoryScatter:", VictoryScatter);


type WorkoutSet = {
  id?: number;
  set: number;
  
  // strength
  weight: number;
  reps: number;
  
  // cardio
  durationSeconds?: number;
  distance?: number;

};

type PreviousWorkout = {
  date: string;
  sets: WorkoutSet[];
};

const MAX_WEIGHT = 999.99;
const MAX_REPS = 999;

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

  // Range state for graph timespan toggle
  const [range, setRange] = useState<"week" | "month" | "year">("week");
  

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

  /**
 * Converts raw API row into a consistent WorkoutSet format.
 * Handles both cardio and strength data.
 */
  const mapRowToWorkoutSet = (row: any, index: number): WorkoutSet => {
    const isCardioRow = row.duration_seconds != null;

    const durationSeconds = isCardioRow
      ? Number(row.duration_seconds)
      : undefined;

    const distance = isCardioRow
      ? Number(row.distance)
      : undefined;

    return {
      id: row.id != null ? Number(row.id) : undefined,
      set: index + 1,

      // Normalize so chart logic doesn't care about mode
      weight: isCardioRow ? durationSeconds! : Number(row.weight),
      reps: isCardioRow ? distance! : Number(row.reps),

      durationSeconds,
      distance,
    };
  };

  /**
   * Loads today's sets for the selected exercise.
   */
  const loadCurrentSets = async () => {
    if (!exerciseId || !userId) return;

    setLoadingCurrent(true);

    try {
      const data = await fetchCurrentSets(exerciseId, userId);

      const mapped: WorkoutSet[] = data.map(mapRowToWorkoutSet);

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

  
  /**
   * Loads historical workouts grouped by date.
   */
  useEffect(() => {
    if (!exerciseId || !userId) return;

    const loadHistory = async () => {
      setLoadingHistory(true);

      try {
        const grouped = await fetchExerciseHistory(exerciseId, userId);

        if (!grouped || typeof grouped !== "object") {
          setPreviousWorkouts([]);
          return;
        }

        const shaped: PreviousWorkout[] = Object.entries(grouped).map(
          ([date, sets]: [string, any]) => ({
            date,
            sets: (Array.isArray(sets) ? sets : []).map(mapRowToWorkoutSet),
          })
        );

        // Ensure chronological order
        shaped.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        setPreviousWorkouts(shaped);
      } catch (err: any) {
        console.error("Error fetching history:", err.message);
      } finally {
        setLoadingHistory(false);
      }
    };

    void loadHistory();
  }, [exerciseId, userId]);

  /**
   * Adds a new set (or lap for cardio).
   * Uses optimistic UI update for responsiveness.
   */
  const handleAddSet = async () => {
    if (!userId || !exerciseId) return;

    let weight: number | null = null;
    let reps: number | null = null;
    let durationSeconds: number | null = null;
    let distance: number | null = null;

    if (isCardio) {
      // Build duration safely
      const h = Number(hoursText || 0);
      const m = Math.min(Number(minutesText || 0), 59);
      const s = Math.min(Number(secondsText || 0), 59);

      durationSeconds = h * 3600 + m * 60 + s;
      distance = Number(repsText);

      if (!durationSeconds || isNaN(distance)) return;
    } else {
      weight = Number(weightText);
      reps = Number(repsText);

      if (!weight || !reps) return;

      if (weight <= 0 || weight > MAX_WEIGHT) {
        setError(`Weight must be between 0.01 and ${MAX_WEIGHT}`);
        return;
      }

      if (reps <= 0 || reps > MAX_REPS) {
        setError(`Reps must be between 1 and ${MAX_REPS}`);
        return;
      }
    }

    setError("");

    // -----------------------
    // Optimistic UI update
    // -----------------------
    const optimisticIndex = currentSets.length;

    const optimisticSet: WorkoutSet = {
      set: optimisticIndex + 1,
      weight: isCardio ? durationSeconds! : weight!,
      reps: isCardio ? distance! : reps!,
      durationSeconds: isCardio ? durationSeconds! : undefined,
      distance: isCardio ? distance! : undefined,
    };

    setCurrentSets(prev => [...prev, optimisticSet]);

    // Reset inputs
    setWeightText("");
    setRepsText("");
    setHoursText("");
    setMinutesText("");
    setSecondsText("");

    try {
      const created = isCardio
        ? await addLap(exerciseId, userId, durationSeconds!, distance!)
        : await addSet(exerciseId, userId, weight!, reps!);

      const normalized = mapRowToWorkoutSet(created, optimisticIndex);

      // Replace optimistic with real data
      setCurrentSets(prev => {
        const copy = [...prev];
        copy[optimisticIndex] = normalized;
        return copy;
      });

    } catch (err: any) {
      // Rollback on failure
      setCurrentSets(prev => prev.slice(0, -1));
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
          date:  new Date().toLocaleDateString("en-CA"),
          sets: currentSets,
        }
      : null;
      

  // Combines history + today's sets, oldest to newest
  const allWorkoutsForChart = [
    ...previousWorkouts,
    ...(todayEntry ? [todayEntry] : []),
  ];

  // Range

  const filteredWorkouts = allWorkoutsForChart.filter((workout) => {
    const [year, month, day] = workout.date.split("-").map(Number);
    const workoutDate = new Date(year, month - 1, day);

    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);

    if (range === "week") cutoff.setDate(cutoff.getDate() - 7);
    if (range === "month") cutoff.setDate(cutoff.getDate() - 30);
    if (range === "year") cutoff.setDate(cutoff.getDate() - 365);

    return workoutDate >= cutoff;
  });


  // Build a point for every logged set so the chart shows true set-by-set changes
  // (e.g. 100 -> 120 -> 80 as three consecutive points).
  const setPoints = filteredWorkouts.flatMap((workout) =>
    workout.sets.map((set, index) => ({
      weight: set.weight,
      reps: set.reps,
      dateLabel: workout.date.slice(5),
      setNumber: index + 1,
    }))
  );

  let adjustedSetPoints = [...setPoints];

  // Detect cases
  const isSinglePoint = setPoints.length === 1;

  const isFlat =
    setPoints.length > 1 &&
    setPoints.every(
      p =>
        p.weight === setPoints[0].weight &&
        p.reps === setPoints[0].reps
    );

  // Add baseline only when needed
  if (!isCardio && (isSinglePoint || isFlat)) {
    adjustedSetPoints = [
      {
        weight: 0,
        reps: 0,
        dateLabel: setPoints[0]?.dateLabel ?? "",
        setNumber: 0,
      },
      ...setPoints,
    ];
  }



  // Reduce X-axis clutter: show date on the first set of each day,
  // then show only set numbers for the remaining sets on that same day.
  const labels = adjustedSetPoints.map((point) =>
    point.setNumber === 1
      ? `${point.dateLabel} #${point.setNumber}`
      : `#${point.setNumber}`
  );

  // =====================
  // CHART SYSTEM (Victory)
  // =====================
  // Uses dual-axis overlay:
  // - Weight (or pace) on left axis
  // - Reps on right axis (strength only)
  // Cardio uses pace = time / distance

  const dynamicHeight = 400;


  // 1. Raw datasets
  const weightData = adjustedSetPoints.map((p, i) => ({
    x: i + 1,
    y: p.weight,
  }));

  const repsData = adjustedSetPoints.map((p, i) => ({
    x: i + 1,
    y: p.reps,
  }));

  // =====================
  // 2. Domains
  // =====================

  const paceData = adjustedSetPoints.map((p, i) => {
      const time = p.weight;   // durationSeconds
      const dist = p.reps;     // distance

      if (!time || !dist) {
        return { x: i + 1, y: 0 };
      }

      return {
        x: i + 1,
        y: time / dist, 
      };
    });

  // Select correct Y dataset
  const primaryData = isCardio ? paceData : weightData;

  const MIN_POINTS_FOR_CARDIO_GRAPH = 2;

  const hasEnoughCardioData =
    !isCardio || primaryData.length >= MIN_POINTS_FOR_CARDIO_GRAPH;
  

  // ---------- PRIMARY AXIS (Weight OR Pace) ----------
  const wMinRaw = Math.min(...primaryData.map(d => d.y));
  const wMaxRaw = Math.max(...primaryData.map(d => d.y));

  let wMin: number;
  let wMax: number;

  const yRange = wMaxRaw - wMinRaw;

  // Define a minimum visible range
  const MIN_RANGE = isCardio ? 30 : 5; 
  // (30 sec pace window OR 5 lbs weight window; tweak as needed)

  if (yRange < MIN_RANGE) {
    const center = (wMaxRaw + wMinRaw) / 2;

    wMin = Math.max(0, center - MIN_RANGE / 2);
    wMax = center + MIN_RANGE / 2;
  } else {
    const paddingTop = yRange * 0.2;
    const paddingBottom = yRange * 0.05;

    wMin = Math.max(0, wMinRaw - paddingBottom);
    wMax = wMaxRaw + paddingTop;
  }


  // ---------- SECONDARY AXIS (Reps ONLY if strength) ----------
  let rMin = 0;
  let rMax = 0;

  if (!isCardio) {
    const rMinRaw = Math.min(...repsData.map(d => d.y));
    const rMaxRaw = Math.max(...repsData.map(d => d.y));

    if (rMinRaw === rMaxRaw) {
      const padding = Math.max(1, Math.abs(rMinRaw) * 0.2);

      rMin = Math.max(0, rMinRaw - padding);
      rMax = rMaxRaw + padding;

    } else {
      const range = rMaxRaw - rMinRaw;

      const paddingTop = range * 0.2;
      const paddingBottom = range * 0.05;

      rMin = Math.max(0, rMinRaw - paddingBottom);
      rMax = rMaxRaw + paddingTop;
    }
  }


  // =====================
  // Tick values
  // =====================

  // Reps ticks (ONLY for strength)
  const repsTickValues = !isCardio
    ? (() => {
        const range = rMax - rMin;

        let step = 1;
        if (range > 50) step = 10;
        else if (range > 20) step = 5;
        else if (range > 10) step = 2;
        else step = 1;

        const ticks = [];
        for (let v = Math.floor(rMin); v <= rMax; v += step) {
          ticks.push(v);
        }

        return ticks;
      })()
    : [];


  // Weight / Pace ticks
  
  const weightTickValues = (() => {
    const targetTicks = isCardio ? 4 : 6;
    const rawRange = wMax - wMin;

    if (rawRange === 0) return [wMin];

    // Step
    const roughStep = rawRange / (targetTicks - 1);
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const residual = roughStep / magnitude;

    let step: number;

    if (roughStep < 1) {
      if (roughStep <= 0.1) step = 0.1;
      else if (roughStep <= 0.25) step = 0.25;
      else if (roughStep <= 0.5) step = 0.5;
      else step = 1;
    } else {
      // existing logic
      step =
        residual >= 5 ? 5 * magnitude :
        residual >= 2 ? 2 * magnitude :
        1 * magnitude;
    }


    const niceMin = Math.floor(wMin / step) * step;
    const niceMax = Math.ceil(wMax / step) * step;

    // Generate ticks
    const ticks = [];
    for (let v = niceMin; v <= niceMax + step / 2; v += step) {
      ticks.push(v);
    }

    // Update domain to match ticks
    wMin = niceMin;
    wMax = niceMax;

    return ticks;
  })();


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

      {/* Range Toggle */}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
        {["week", "month", "year"].map((r) => (
          <TouchableOpacity
            key={r}
            onPress={() => setRange(r as any)}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 8,
              backgroundColor: range === r ? colors.primary : colors.bgInput,
            }}
          >
            <Text style={{ color: colors.text }}>
              {r.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart */}
      <View style={s.historyCard}>
        {loadingHistory ? (
          <View style={s.centeredRow}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : hasEnoughCardioData && primaryData.length > 0 ? (
          
          <View style={{ position: "relative" }}>
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 6, justifyContent: "center", alignItems: "center" }}>
              {isCardio ? (
                <Text style={{ color: colors.primary }}>
                  ● Pace (Time/Distance)
                </Text>
              ) : (
                <>
                  <Text style={{ color: colors.primary }}>● Weight</Text>
                  <Text style={{ color: "#FF9800" }}>● Reps</Text>
                </>
              )}
           </View>
            {/* ========================= */}
            {/* CARDIO MODE (SINGLE LINE) */}
            {/* ========================= */}
            {isCardio ? (
              <VictoryChart
                width={width - 40}
                height={dynamicHeight}
                domain={{ y: [wMin, wMax] }}
                domainPadding={{ y: 10 }}
                padding={{ top: 10, bottom: 30, left: 70, right: 20 }}
              >
                {/* Y AXIS (PACE) */}
                <VictoryAxis
                  dependentAxis
                  tickValues={weightTickValues}
                  tickFormat={(t) =>
                    isCardio
                      ? formatPace(t)
                      : Math.round(t)}
                  invertAxis
                  style={{
                    axis: { stroke: colors.border },
                    grid: { stroke: "rgba(255,255,255,0.1)" },
                    tickLabels: { fill: colors.primary },
                  }}
                />

                {/* X AXIS */}
                <VictoryAxis
                  crossAxis={false}
                  tickValues={primaryData.map(d => d.x)}
                  tickFormat={(t) => labels[t - 1] || ""}
                  style={{
                    axis: { stroke: colors.border },
                    tickLabels: { fill: colors.textSecondary, fontSize: 10 },
                  }}
                />

                {/* PACE LINE */}
                <VictoryLine
                  data={primaryData}
                  interpolation="monotoneX"
                  style={{
                    data: { stroke: colors.primary, strokeWidth: 3 },
                  }}
                />

                <VictoryScatter
                  data={primaryData}
                  size={4}
                  style={{ data: { fill: colors.primary } }}
                />
              </VictoryChart>
            ) : (
              
              /* ===================== */
              /* STRENGTH MODE (DUAL AXIS) */
              /* ===================== */
              <>
                {/* BASE (WEIGHT) */}
                <VictoryChart
                  width={width - 40}
                  height={dynamicHeight}
                  domain={{ y: [wMin, wMax] }}
                  domainPadding={{ y: 10 }}
                  padding={{ top: 10, bottom: 30, left: 50, right: 60 }}
                >
                  <VictoryAxis
                    dependentAxis
                    tickValues={weightTickValues}
                    tickFormat={(t) => Math.round(t)}
                    style={{
                      axis: { stroke: colors.border },
                      grid: { stroke: "rgba(255,255,255,0.1)" },
                      tickLabels: { fill: colors.primary },
                    }}
                  />

                  <VictoryAxis
                    crossAxis={false}
                    tickValues={weightData.map(d => d.x)}
                    tickFormat={(t) => labels[t - 1] || ""}
                    style={{
                      axis: { stroke: colors.border },
                      tickLabels: { fill: colors.textSecondary, fontSize: 10 },
                    }}
                  />

                  <VictoryLine
                    data={weightData}
                    interpolation="monotoneX"
                    style={{
                      data: { stroke: colors.primary, strokeWidth: 3 },
                    }}
                  />

                  <VictoryScatter
                    data={weightData}
                    size={4}
                    style={{ data: { fill: colors.primary } }}
                  />
                </VictoryChart>

                {/* OVERLAY (REPS) */}
                <VictoryChart
                  width={width - 40}
                  height={dynamicHeight}
                  domain={{ y: [rMin, rMax] }}
                  domainPadding={{ y: 0 }}
                  padding={{ top: 25, bottom: 18, left: 50, right: 60 }}
                  style={{
                    parent: {
                      position: "absolute",
                      top: 0,
                      left: 0,
                    },
                  }}
                >
                  <VictoryAxis
                    dependentAxis
                    orientation="right"
                    tickValues={repsTickValues}
                    tickFormat={(t) => t}
                    style={{
                      axis: { stroke: colors.border },
                      tickLabels: { fill: "#FF9800" },
                      grid: { stroke: "transparent" },
                    }}
                  />

                  <VictoryLine
                    data={repsData}
                    interpolation="monotoneX"
                    style={{
                      data: {
                        stroke: "#FF9800",
                        strokeWidth: 3,
                        strokeDasharray: "6,4",
                      },
                    }}
                  />

                  <VictoryScatter
                    data={repsData}
                    size={4}
                    style={{ data: { fill: "#FF9800" } }}
                  />
                </VictoryChart>
              </>
            )}
          </View>
        ) : (
          <View
            style={{
              height: dynamicHeight - 100,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>
              {isCardio && primaryData.length === 1
                ? "Add one more workout to see your pace trend"
                : "No history data yet"}
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
                {isCardio ? formatTime(set.durationSeconds!) : `${set.weight} lbs`}
              </Text>
              <Text style={s.cell}>
                {isCardio ? `${set.distance} mi` : set.reps}
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
              <Text style={s.headerCell}>
                {isCardio ? "Time" : "Weight"}
              </Text>
              <Text style={s.headerCell}>
                {isCardio ? "Distance" : "Reps"}
              </Text>
            </View>
            {workout.sets.map((set) => (
              <View key={`${workout.date}-${set.set}`} style={s.tableRow}>
                <Text style={s.cell}>{set.set}</Text>
                <Text style={s.cell}>
                  {isCardio ? formatTime(set.weight) : `${set.weight} lbs`}
                </Text>
                <Text style={s.cell}>
                  {isCardio ? `${set.reps} mi` : set.reps}
                </Text>
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
