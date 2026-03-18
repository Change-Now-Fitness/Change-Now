import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { styles } from "./styles";
import { fetchCurrentSets, addSet } from "../../../lib/api";
import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

type WorkoutSet = {
  set: number;
  weight: number;
  reps: number;
};

type PreviousWorkout = {
  date: string;
  sets: WorkoutSet[];
};

// const CURRENT_WORKOUT_SETS: WorkoutSet[] = [
//   { set: 1, weight: 110, reps: 8 },
//   { set: 2, weight: 115, reps: 7 },
//   { set: 3, weight: 120, reps: 6 },
// ];

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
  const params = useLocalSearchParams<{ name?: string; exerciseId?: string }>();

  const exerciseId = params.exerciseId ?? '';
  const exerciseName =
    typeof params.name === "string" && params.name.length > 0
      ? params.name
      : "Selected Exercise";


  // const [currentSets, setCurrentSets] = useState<WorkoutSet[]>([
  //   { set: 1, weight: 110, reps: 8 },
  //   { set: 2, weight: 115, reps: 7 },
  //   { set: 3, weight: 120, reps: 6 },
  // ]);


  const [weightText, setWeightText] = useState('');
  const [repsText, setRepsText] = useState('');
  const [currentSets, setCurrentSets] = useState<WorkoutSet[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  // Get the logged-in user's ID
  useEffect(() => {
  const loadUserId = async () => {
    const token = Platform.OS === 'web'
      ? localStorage.getItem('user_token')
      : await SecureStore.getItemAsync('user_token');

    if (!token) return;
    const decoded: { user_id: string } = jwtDecode(token);
    console.log('decoded userId:', decoded.user_id);
    setUserId(parseInt(decoded.user_id));
  };
  loadUserId();
}, []);

  // Fetch today's sets once we have both exerciseId and userId
  useEffect(() => {
    if (!exerciseId || !userId) return;

    const loadSets = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const data = await fetchCurrentSets(exerciseId, userId, today);
        console.log('Fetched sets:', JSON.stringify(data, null, 2));
      
        const mapped: WorkoutSet[] = data.map((row: any, index: number) => ({
          set: index + 1,
          weight: parseFloat(row.weight),
          reps: row.reps,
        }));
        setCurrentSets(mapped);
      
      } catch (err: any) {
        console.error('Error fetching sets:', err.message);
      }
    };

    loadSets();
  }, [exerciseId, userId]);
  console.log('exerciseId:', exerciseId);
  console.log('userId:', userId);
  
  
  // Handler for adding sets
  const handleAddSet = async () => {
    const weight = parseFloat(weightText);
    const reps = parseInt(repsText, 10);

    if (isNaN(weight) || isNaN(reps)) return; 

    const newSet: WorkoutSet = {
      set: currentSets.length + 1,
      weight,
      reps,
    };

    setCurrentSets((prev => [...prev, newSet]))
    setWeightText('');
    setRepsText('');


    // TODO: add to database, repopulate the graph
    try {
      await addSet(exerciseId, userId!, weight, reps);
    } catch (err: any) {
      // Roll back if save failed
      setCurrentSets((prev) => prev.slice(0, -1));
      console.error('Failed to save set:', err.message);
    }
  };

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
        {currentSets.map((set) => (
          <View key={set.set} style={styles.tableRow}>
            <Text style={styles.tableCell}>{set.set}</Text>
            <Text style={styles.tableCell}>{set.weight}</Text>
            <Text style={styles.tableCell}>{set.reps}</Text>
          </View>
        ))}
      </View>

      <View style={styles.addSetRow}>
        <TextInput
          style={styles.addSetInput}
          placeholder="Weight"
          keyboardType="numeric"
          value={weightText}
          onChangeText={(text) => setWeightText(text.replace(/[^0-9.]/g, ''))}
        />
        <TextInput
          style={styles.addSetInput}
          placeholder="Reps"
          keyboardType="numeric"
          value={repsText}
          onChangeText={(text) => setRepsText(text.replace(/[^0-9.]/g, ''))}
        />
        <TouchableOpacity style={styles.addSetButton} onPress={handleAddSet}>
          <Text style={styles.addSetButtonText}>+ Add Set</Text>
        </TouchableOpacity>
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

