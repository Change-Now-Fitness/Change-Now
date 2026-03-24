import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { styles } from "./styles";

const EXERCISE_TYPES = [
  "Cardio",
  "Strength training",
  "Swim",
  "Calisthenics",
  "Stair master",
  "Elliptical",
  "Other",
] as const;

export default function CustomExerciseScreen() {
  const router = useRouter();

  const [type, setType] = useState<(typeof EXERCISE_TYPES)[number]>(
    "Strength training"
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const isValid = useMemo(() => name.trim().length > 0, [name]);

  const handleAdd = () => {
    if (!isValid) {
      Alert.alert("Missing name", "Please enter an exercise name.");
      return;
    }

    Alert.alert(
      "Saved (placeholder)",
      `Type: ${type}\nName: ${name.trim()}\nDescription: ${description.trim() || "(none)"}`
    );
  };

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
        <Text style={styles.title}>Custom Exercise</Text>
      </View>

      <Text style={styles.label}>Type</Text>
      <TextInput
        style={styles.input}
        value={type}
        onChangeText={(v) => setType(v as (typeof EXERCISE_TYPES)[number])}
        placeholder="e.g. Strength training"
        placeholderTextColor="#666"
      />

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Treadmill"
        placeholderTextColor="#666"
        autoCapitalize="words"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Optional notes..."
        placeholderTextColor="#666"
        multiline
      />

      <TouchableOpacity
        style={[styles.addButton, { opacity: isValid ? 1 : 0.6 }]}
        onPress={handleAdd}
        activeOpacity={0.85}
      >
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}


