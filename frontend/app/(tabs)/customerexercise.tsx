import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  ActivityIndicator
} from "react-native";
import {Picker} from '@react-native-picker/picker'
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { colors, spacing, fontSize, borderRadius } from "@/lib/theme";
import { ApiError } from "@/lib/api";


const EXERCISE_TYPES = [
  "Cardio",
  "Strength training",
  //"Swim", belong of Cardio
  "Calisthenics",
  //"Stair master", belong to Cardio
  "HIIT",
  //"Elliptical", belong to Cardio
  "Other",
] as const;

export default function CustomExerciseScreen() {
  const router = useRouter();

  type ExerciseType = (typeof EXERCISE_TYPES)[number];

  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<ExerciseType>(EXERCISE_TYPES[0]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [description, setDescription] = useState("");

  const isValid = useMemo(() => name.trim().length > 0, [name]);

   const handleAdd = async () => {
     if (!isValid) {
      setError("Please enter an exercise name.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      //await createExercise(name.trim(), selectedType, description.trim());
      router.back();
    } catch (e) {
      const apiErr = e as ApiError;
      setError(apiErr.message || "Failed to create exercise");
    } finally {
      setLoading(false);
    }
  };


  return (
    <ScrollView style={s.scrollView} showsVerticalScrollIndicator={false}>
      <View style={s.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <Text style={s.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>New Exercise</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={s.form}>
        <Text style={s.label}>Type</Text>

        <Picker
          selectedValue={selectedType}
          onValueChange={(itemValue) => setSelectedType(itemValue)}
          style={s.input} 
          dropdownIconColor="white"
        >
          {EXERCISE_TYPES.map((type) =>(
            <Picker.Item key={type} label={type} value={type} color={colors.text}/>
          ))}
        </Picker>

        <Text style={s.label}>Name</Text>
        <TextInput
          style={s.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Bench Press"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="words"
          editable={!loading}
        />

        <Text style={s.label}>Description</Text>
        <TextInput
          style={[s.input, s.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Optional notes..."
          placeholderTextColor={colors.textMuted}
          multiline
          editable={!loading}
        />

        {error ? <Text style={s.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[s.addButton, (!isValid || loading) && { opacity: 0.6 }]}
          onPress={handleAdd}
          activeOpacity={0.85}
          disabled={!isValid || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.addButtonText}>Create Exercise</Text>
          )}
        </TouchableOpacity>
      </View>
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
  form: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.bgInput,
    color: colors.text,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: { minHeight: 100, textAlignVertical: "top" },
  errorText: {
    color: colors.danger,
    fontSize: fontSize.sm,
    marginTop: spacing.md,
  },
  addButton: {
    marginTop: spacing.lg,
    height: 50,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "700",
  },
});