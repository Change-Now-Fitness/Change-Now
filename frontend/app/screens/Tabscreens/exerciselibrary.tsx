import React, { useRef, useState, useEffect } from "react";
import {
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  StyleSheet
} from "react-native";
import { checkLogin } from '../../../services/auth';
import { useRouter } from 'expo-router';

type Exercise = {
  id: number;
  name: string;
  type: string;
  muscleGroup: string;
  equipment: string;
  isCustom: boolean;
  userId: string | null;
};

type ExerciseForm = {
  name: string;
  type: string;
  muscleGroup: string;
  equipment: string;
};

const MUSCLE_GROUPS = [
  { key: "chest", label: "Chest" },
  { key: "back", label: "Back" },
  { key: "shoulders", label: "Shoulders" },
  { key: "legs", label: "Legs" },
  { key: "biceps", label: "Biceps" },
  { key: "triceps", label: "Triceps" },
  { key: "calves", label: "Calves" },
  { key: "forearms", label: "Forearms" },
];

const EXERCISE_TYPES = ["strength", "cardio", "mobility", "bodyweight"];
const EQUIPMENT_OPTIONS = [
  "barbell",
  "dumbbell",
  "machine",
  "bodyweight",
  "cable",
];

// Temporary data for UI.
// Replace this with a backend fetch once the exercises table is populated.
const PRESET_EXERCISES: Exercise[] = [
  {
    id: 1,
    name: "Bench Press",
    type: "strength",
    muscleGroup: "chest",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 2,
    name: "Incline Bench Press",
    type: "strength",
    muscleGroup: "chest",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 3,
    name: "Decline Bench Press",
    type: "strength",
    muscleGroup: "chest",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 4,
    name: "Lat Pulldown",
    type: "strength",
    muscleGroup: "back",
    equipment: "cable",
    isCustom: false,
    userId: null,
  },
  {
    id: 5,
    name: "Barbell Row",
    type: "strength",
    muscleGroup: "back",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 6,
    name: "Barbell Shoulder Press",
    type: "strength",
    muscleGroup: "shoulders",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 7,
    name: "Front Raise",
    type: "strength",
    muscleGroup: "shoulders",
    equipment: "dumbbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 8,
    name: "Squat",
    type: "strength",
    muscleGroup: "legs",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 9,
    name: "Leg Press",
    type: "strength",
    muscleGroup: "legs",
    equipment: "machine",
    isCustom: false,
    userId: null,
  },
  {
    id: 10,
    name: "Barbell Curl",
    type: "strength",
    muscleGroup: "biceps",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 11,
    name: "Skullcrusher",
    type: "strength",
    muscleGroup: "triceps",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
  {
    id: 12,
    name: "Standing Calf Raise",
    type: "strength",
    muscleGroup: "calves",
    equipment: "machine",
    isCustom: false,
    userId: null,
  },
  {
    id: 13,
    name: "Wrist Curl",
    type: "strength",
    muscleGroup: "forearms",
    equipment: "barbell",
    isCustom: false,
    userId: null,
  },
];

const INITIAL_FORM_STATE: ExerciseForm = {
  name: "",
  type: "strength",
  muscleGroup: "chest",
  equipment: "barbell",
};

const toLabel = (value: string) =>
  value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export default function ExerciseLibrary() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView | null>(null);
  const sectionOffsets = useRef<Record<string, number>>({});
  const nextExerciseId = useRef(PRESET_EXERCISES.length + 1);

  const [searchText, setSearchText] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("chest");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [formState, setFormState] = useState<ExerciseForm>(INITIAL_FORM_STATE);

  const checkLoginStatus = async () => {

    try {
      console.log('checking loggin on library');
      const login_status = await checkLogin();
      console.log(`login status: ${login_status}`);
      if (login_status.success == true) {
        console.log('ex lib user display id: ', login_status.user_id);
        return true;
      } else {
        console.log('check login returned false');
        router.replace('/');
        return false;
      }
    } catch (error) {
      console.log(`error checking log in status ${error}`);
      return false;
    };
  };

  useEffect(() => {
    //checkLoginStatus();
  }, []);

  const showTwoColumnCards = width >= 960;
  const allExercises = [...PRESET_EXERCISES, ...customExercises];
  const normalizedSearchText = searchText.trim().toLowerCase();
  // This mirrors the backend query shape at a small local-state level for now.
  // When the API is wired in, this filtered grouping can move server-side or run
  // against fetched data with the same exercise object contract.
  const exerciseSections = MUSCLE_GROUPS.map((group) => ({
    ...group,
    exercises: allExercises.filter((exercise) => {
      const isMatchingGroup = exercise.muscleGroup === group.key;
      const isMatchingSearch =
        normalizedSearchText.length === 0 ||
        exercise.name.toLowerCase().includes(normalizedSearchText);

      return isMatchingGroup && isMatchingSearch;
    }),
  })).filter((group) => group.exercises.length > 0);

  const updateFormField = (field: keyof ExerciseForm, value: string) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSectionLayout = (
    muscleGroup: string,
    event: LayoutChangeEvent
  ) => {
    sectionOffsets.current[muscleGroup] = event.nativeEvent.layout.y;
  };

  // The sidebar uses measured section offsets so a tap can jump the main list
  // to the matching muscle group without introducing nested routes/screens.
  const scrollToSection = (muscleGroup: string) => {
    setSelectedMuscleGroup(muscleGroup);

    const sectionOffset = sectionOffsets.current[muscleGroup] ?? 0;
    scrollRef.current?.scrollTo({
      y: Math.max(sectionOffset - 8, 0),
      animated: true,
    });
  };

  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    // As the user scrolls, keep the sidebar highlight in sync with the section
    // currently closest to the top of the viewport.
    const scrollY = event.nativeEvent.contentOffset.y + 40;
    const activeGroup = [...MUSCLE_GROUPS]
      .reverse()
      .find((group) => (sectionOffsets.current[group.key] ?? Infinity) <= scrollY);

    if (activeGroup && activeGroup.key !== selectedMuscleGroup) {
      setSelectedMuscleGroup(activeGroup.key);
    }
  };

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setFormState(INITIAL_FORM_STATE);
  };

  const handleSaveExercise = () => {
    const trimmedName = formState.name.trim();

    if (!trimmedName) {
      return;
    }

    const nextExercise: Exercise = {
      id: nextExerciseId.current,
      name: trimmedName,
      type: formState.type,
      muscleGroup: formState.muscleGroup,
      equipment: formState.equipment,
      isCustom: true,
      userId: "mock-user-id",
    };

    nextExerciseId.current += 1;

    // MVP behavior: append to local state so the flow works before the backend
    // layer is connected. Replace this with POST /exercises and then
    // merge/refresh from the API response once the real database path is ready.
    console.log("Custom exercise saved:", nextExercise);
    setCustomExercises((current) => [...current, nextExercise]);
    setSearchText("");
    closeModal();

    // Wait for React to paint the new item before trying to scroll to its section.
    requestAnimationFrame(() => {
      scrollToSection(nextExercise.muscleGroup);
    });
  };

  const isSaveDisabled = formState.name.trim().length === 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerBlock}>
          <Text style={styles.screenTitle}>Exercise Library</Text>
          <Text style={styles.screenSubtitle}>
            Browse core lifts and add quick custom movements without leaving the
            page.
          </Text>
        </View>

        <View style={styles.searchRow}>
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Enter exercise name to search"
            placeholderTextColor="#6a6f74"
            style={styles.searchInput}
            autoCapitalize="words"
          />

          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
            ]}
            onPress={openModal}
            accessibilityRole="button"
            accessibilityLabel="Add custom exercise"
          >
            <Text style={styles.addButtonText}>+</Text>
          </Pressable>
        </View>

        <View style={styles.libraryShell}>
          <View style={styles.sidebar}>
            <Text style={styles.sidebarHeading}>Muscle Groups</Text>
            {MUSCLE_GROUPS.map((group) => {
              const isSelected = selectedMuscleGroup === group.key;

              return (
                <Pressable
                  key={group.key}
                  style={[
                    styles.sidebarItem,
                    isSelected && styles.sidebarItemSelected,
                  ]}
                  onPress={() => scrollToSection(group.key)}
                >
                  <Text
                    style={[
                      styles.sidebarItemText,
                      isSelected && styles.sidebarItemTextSelected,
                    ]}
                  >
                    {group.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.exerciseScroll}
            contentContainerStyle={styles.exerciseScrollContent}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {exerciseSections.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>No exercises found</Text>
                <Text style={styles.emptyStateText}>
                  Try a different search term or add a custom exercise with the
                  green plus button.
                </Text>
              </View>
            ) : (
              exerciseSections.map((group) => (
                <View
                  key={group.key}
                  style={styles.sectionBlock}
                  onLayout={(event) => handleSectionLayout(group.key, event)}
                >
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{group.label}</Text>
                    <Text style={styles.sectionCount}>
                      {group.exercises.length} exercise
                      {group.exercises.length === 1 ? "" : "s"}
                    </Text>
                  </View>

                  <View style={styles.cardGrid}>
                    {group.exercises.map((exercise) => (
                      <View
                        key={exercise.id}
                        style={[
                          styles.exerciseCard,
                          showTwoColumnCards
                            ? styles.exerciseCardWide
                            : styles.exerciseCardFull,
                        ]}
                      >
                        <View style={styles.cardTitleRow}>
                          <Text style={styles.exerciseName}>{exercise.name}</Text>
                          {exercise.isCustom ? (
                            <View style={styles.customBadge}>
                              <Text style={styles.customBadgeText}>Custom</Text>
                            </View>
                          ) : null}
                        </View>
                        <Text style={styles.exerciseMeta}>
                          {toLabel(exercise.type)} | {toLabel(exercise.equipment)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>

      <Modal
        visible={isModalVisible}
        animationType="fade"
        transparent
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalRoot}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable style={styles.modalBackdrop} onPress={closeModal} />
          <View style={styles.modalSheet}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalScrollContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Custom Exercise</Text>
                <Pressable
                  onPress={closeModal}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Close custom exercise modal"
                >
                  <Text style={styles.modalCloseText}>X</Text>
                </Pressable>
              </View>

              <Text style={styles.fieldLabel}>Exercise Name</Text>
              <TextInput
                value={formState.name}
                onChangeText={(value) => updateFormField("name", value)}
                placeholder="e.g. Adam Press"
                placeholderTextColor="#6a6f74"
                style={styles.modalInput}
                autoCapitalize="words"
              />

              <Text style={styles.fieldLabel}>Exercise Type</Text>
              <View style={styles.optionRow}>
                {EXERCISE_TYPES.map((option) => {
                  const isActive = formState.type === option;

                  return (
                    <Pressable
                      key={option}
                      style={[styles.optionChip, isActive && styles.optionChipActive]}
                      onPress={() => updateFormField("type", option)}
                    >
                      <Text
                        style={[
                          styles.optionChipText,
                          isActive && styles.optionChipTextActive,
                        ]}
                      >
                        {toLabel(option)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>Muscle Group</Text>
              <View style={styles.optionRow}>
                {MUSCLE_GROUPS.map((option) => {
                  const isActive = formState.muscleGroup === option.key;

                  return (
                    <Pressable
                      key={option.key}
                      style={[styles.optionChip, isActive && styles.optionChipActive]}
                      onPress={() => updateFormField("muscleGroup", option.key)}
                    >
                      <Text
                        style={[
                          styles.optionChipText,
                          isActive && styles.optionChipTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>Equipment</Text>
              <View style={styles.optionRow}>
                {EQUIPMENT_OPTIONS.map((option) => {
                  const isActive = formState.equipment === option;

                  return (
                    <Pressable
                      key={option}
                      style={[styles.optionChip, isActive && styles.optionChipActive]}
                      onPress={() => updateFormField("equipment", option)}
                    >
                      <Text
                        style={[
                          styles.optionChipText,
                          isActive && styles.optionChipTextActive,
                        ]}
                      >
                        {toLabel(option)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.modalActions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.cancelButton,
                    pressed && styles.cancelButtonPressed,
                  ]}
                  onPress={closeModal}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.saveButton,
                    isSaveDisabled && styles.saveButtonDisabled,
                    pressed && !isSaveDisabled && styles.saveButtonPressed,
                  ]}
                  onPress={handleSaveExercise}
                  disabled={isSaveDisabled}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#2b2f33",
  },

  container: {
    flex: 1,
    backgroundColor: "#2b2f33",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
  },

  headerBlock: {
    marginBottom: 18,
  },

  screenTitle: {
    color: "#f5f7f8",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  screenSubtitle: {
    color: "#b5bcc3",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    maxWidth: 560,
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  searchInput: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    color: "#101214",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginRight: 12,
  },

  addButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#1db954",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  addButtonPressed: {
    transform: [{ scale: 0.97 }],
    backgroundColor: "#17a14a",
  },

  addButtonText: {
    color: "#ffffff",
    fontSize: 30,
    lineHeight: 30,
    fontWeight: "600",
  },

  libraryShell: {
    flex: 1,
    flexDirection: "row",
    minHeight: 0,
  },

  sidebar: {
    width: 108,
    backgroundColor: "#34393f",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 10,
    marginRight: 14,
  },

  sidebarHeading: {
    color: "#e7eaec",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 14,
    paddingHorizontal: 8,
  },

  sidebarItem: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 6,
  },

  sidebarItemSelected: {
    backgroundColor: "#1db954",
  },

  sidebarItemText: {
    color: "#c6ccd1",
    fontSize: 13,
    fontWeight: "600",
  },

  sidebarItemTextSelected: {
    color: "#ffffff",
  },

  exerciseScroll: {
    flex: 1,
    backgroundColor: "#31363b",
    borderRadius: 20,
  },

  exerciseScrollContent: {
    padding: 18,
    paddingBottom: 32,
  },

  sectionBlock: {
    marginBottom: 24,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  sectionTitle: {
    color: "#f5f7f8",
    fontSize: 22,
    fontWeight: "700",
  },

  sectionCount: {
    color: "#a8b0b7",
    fontSize: 13,
  },

  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },

  exerciseCard: {
    backgroundColor: "#3b4147",
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#464d54",
  },

  exerciseCardWide: {
    width: "47%",
  },

  exerciseCardFull: {
    width: "100%",
  },

  cardTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },

  exerciseName: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    paddingRight: 12,
  },

  exerciseMeta: {
    color: "#b5bcc3",
    fontSize: 13,
  },

  customBadge: {
    backgroundColor: "rgba(29, 185, 84, 0.16)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  customBadgeText: {
    color: "#7ef0aa",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  emptyState: {
    backgroundColor: "#3b4147",
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: "#464d54",
  },

  emptyStateTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },

  emptyStateText: {
    color: "#b5bcc3",
    fontSize: 14,
    lineHeight: 20,
  },

  modalRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8, 10, 12, 0.78)",
  },

  modalSheet: {
    width: "100%",
    maxWidth: 620,
    maxHeight: "88%",
    backgroundColor: "#31363b",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#464d54",
    padding: 22,
  },

  modalScrollContent: {
    paddingBottom: 4,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  modalTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
  },

  modalCloseText: {
    color: "#c6ccd1",
    fontSize: 18,
    fontWeight: "700",
  },

  fieldLabel: {
    color: "#f5f7f8",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 6,
  },

  modalInput: {
    backgroundColor: "#f5f5f5",
    color: "#101214",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 10,
  },

  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },

  optionChip: {
    backgroundColor: "#3c4248",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#4b535b",
  },

  optionChipActive: {
    backgroundColor: "#1db954",
    borderColor: "#1db954",
  },

  optionChipText: {
    color: "#d2d7dc",
    fontSize: 13,
    fontWeight: "600",
  },

  optionChipTextActive: {
    color: "#ffffff",
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },

  cancelButton: {
    backgroundColor: "#3b4147",
    borderWidth: 1,
    borderColor: "#535b63",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    marginRight: 10,
  },

  cancelButtonPressed: {
    backgroundColor: "#444b51",
  },

  cancelButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },

  saveButton: {
    backgroundColor: "#1db954",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },

  saveButtonPressed: {
    backgroundColor: "#18a34c",
  },

  saveButtonDisabled: {
    opacity: 0.55,
  },

  saveButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});

