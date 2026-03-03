import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { styles } from "./styles";
import { Link } from "expo-router";

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

      <Link href= "/screens/selectedexercise">Manually jump into selectedexercise</Link>
      <Link href= "/screens/customerexercise">Manually jump into customerexercise</Link>
      <Link href= "/screens/userscreen">Manually jump into userscreen</Link>
    </ScrollView>
  );
}