import React from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import styles from "./style";

const exercises = {
  Chest: [
    "Bench Press",
    "Incline Bench Press",
    "Decline Bench Press",
  ],
  Back: [
    "Lat Pulldown",
    "Barbell Row",
  ],
  Shoulders: [
    "Barbell Shoulder Press",
    "Front Raise",
  ],
};

export default function ExerciseLibrary() {
  return (
    <View style={styles.container}>
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TextInput
          placeholder="Enter exercise name to search"
          style={styles.search}
        />

        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.plus}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>

        {/* Sidebar */}
        <View style={styles.sidebar}>
          {Object.keys(exercises).map((group) => (
            <Text key={group} style={styles.sidebarItem}>
              {group}
            </Text>
          ))}
        </View>

        {/* Exercises */}
        <ScrollView style={styles.exerciseArea}>
          {Object.entries(exercises).map(([group, list]) => (
            <View key={group}>

              <Text style={styles.groupTitle}>{group}</Text>

              <View style={styles.grid}>
                {list.map((exercise) => (
                  <View key={exercise} style={styles.card}>
                    <Text style={styles.exerciseName}>{exercise}</Text>
                  </View>
                ))}
              </View>

            </View>
          ))}
        </ScrollView>

      </View>

    </View>
  );
}