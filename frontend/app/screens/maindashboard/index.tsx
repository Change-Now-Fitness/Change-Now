import { Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { styles } from "./styles";

const EXERCISES = [
  { id: "lat-pulldown", name: "Lat Pulldown", icon: "🏋️" },
  { id: "bench-press", name: "Bench Press", icon: "💪" },
];

export default function Dashboard() {
  const router = useRouter();

  const handleNewExercise = () => {
    // Temporary: route to custom exercise until type selection page exists
    router.push("/screens/customerexercise");
  };

  const handleAddCustomExercise = () => {
    router.push("/screens/customerexercise");
  };

  const handleSelectExercise = (name: string, id: string) => {
    router.push({
      pathname: "/screens/selectedexercise",
      params: { name, id },
    });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.header}>Change Now</Text>
      <Text style={styles.welcome}>Welcome, User!</Text>

      <Text style={styles.sectionTitle}>New Exercise</Text>
      <TouchableOpacity
        style={styles.newExerciseCard}
        onPress={handleNewExercise}
        activeOpacity={0.7}
      >
        <Text style={styles.plus}>+</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Exercises</Text>
      {EXERCISES.map((exercise) => (
        <TouchableOpacity
          key={exercise.id}
          style={styles.exerciseCard}
          onPress={() => handleSelectExercise(exercise.name, exercise.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.exerciseIcon}>{exercise.icon}</Text>
          <Text style={styles.exerciseText}>{exercise.name}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={styles.customExerciseButton}
        onPress={handleAddCustomExercise}
        activeOpacity={0.8}
      >
        <Text style={styles.customExerciseButtonText}>Add Custom Exercise</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
