import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { styles } from "./styles";

export default function Dashboard() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      {/* Title */}
      <Text style={styles.header}>ChangeNow</Text>
      <Text style={styles.welcome}>Welcome, User!</Text>

      {/* New Exercise */}
      <Text style={styles.sectionTitle}>New Exercise</Text>

      <TouchableOpacity style={styles.newExerciseCard}>
        <Text style={styles.plus}>+</Text>
      </TouchableOpacity>

      {/* Exercises */}
      <Text style={styles.sectionTitle}>Exercises</Text>

      <TouchableOpacity style={styles.exerciseCard}>
        <Text style={styles.exerciseIcon}>🏋️</Text>
        <Text style={styles.exerciseText}>Lat Pulldown</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.exerciseCard}>
        <Text style={styles.exerciseIcon}>💪</Text>
        <Text style={styles.exerciseText}>Bench Press</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}