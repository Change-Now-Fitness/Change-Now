
import { ScrollView, Text, TouchableOpacity, View,ActivityIndicator,StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { styles } from "./styles";
import React, {useEffect,useState} from "react";
import { Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";



type WorkoutSet = {
  set: number;
  weight: number;
  reps: number;
};

type PreviousWorkout = {
  date: string;
  sets: WorkoutSet[];
};


type WorkoutData = {
  day:string;
  chest: number;
  back: number;
  legs: number;
  shoulders: number;
  arms: number;
}


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

  const fetchChartData = async () : Promise<WorkoutData[]> =>{

    return new Promise((resolve) => {
      setTimeout(()=>{
        resolve([
        { day: "Mon", chest: 250, back: 200, legs: 150, shoulders: 100, arms: 300 },
        { day: "Tue", chest: 300, back: 220, legs: 180, shoulders: 130, arms: 280 },
        { day: "Wed", chest: 280, back: 240, legs: 170, shoulders: 120, arms: 320 },
        { day: "Thu", chest: 310, back: 210, legs: 190, shoulders: 140, arms: 290 },
        { day: "Fri", chest: 260, back: 230, legs: 160, shoulders: 110, arms: 310 },
        ]);
      },1500);
    });
  }

  const [data,setData] = useState<WorkoutData[]>([]);
  const [loading,setLoading] = useState(true);

  useEffect(() => {
    fetchChartData().then((res) => {
      setData(res);
      setLoading(false);
    });
  },[]);

  if (loading || !data || data.length === 0) {
    return (
      <View>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
       <LineChart data={{labels: data.map(item => item.day),
      datasets: [
      { data: data.map(item => item.chest), color: () => "red" },
      { data: data.map(item => item.back), color: () => "blue" },
      { data: data.map(item => item.legs), color: () => "green" },
      { data: data.map(item => item.shoulders), color: () => "orange" },
      { data: data.map(item => item.arms), color: () => "purple" },
    ],
    legend: ["Chest", "Back", "Legs", "Shoulders", "Arms"],
  }}
  width={Dimensions.get("window").width - 40}
  height={220}
  chartConfig={{
    color: () => 'white',
  }}
  bezier/>

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

