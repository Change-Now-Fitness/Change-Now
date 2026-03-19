import React, { useRef, useState } from "react";
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
} from "react-native";
import styles from "./styles";

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
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView | null>(null);
  const sectionOffsets = useRef<Record<string, number>>({});
  const nextExerciseId = useRef(PRESET_EXERCISES.length + 1);

  const [searchText, setSearchText] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("chest");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [formState, setFormState] = useState<ExerciseForm>(INITIAL_FORM_STATE);

  const showTwoColumnCards = width >= 960;
  const allExercises = [...PRESET_EXERCISES, ...customExercises];
  const normalizedSearchText = searchText.trim().toLowerCase();
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

    console.log("Custom exercise saved:", nextExercise);
    setCustomExercises((current) => [...current, nextExercise]);
    setSearchText("");
    closeModal();

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
