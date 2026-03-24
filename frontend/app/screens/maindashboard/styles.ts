import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 40,
    backgroundColor: "#fff",
    flexGrow: 1,
  },

  header: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#000",
    letterSpacing: 0.5,
  },

  welcome: {
    fontSize: 18,
    marginBottom: 28,
    color: "#333",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#000",
  },

  newExerciseCard: {
    height: 120,
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
    backgroundColor: "#fafafa",
  },

  plus: {
    fontSize: 48,
    fontWeight: "300",
    color: "#000",
  },

  exerciseCard: {
    flexDirection: "row",
    alignItems: "center",
    height: 80,
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
    backgroundColor: "#fff",
  },

  exerciseIcon: {
    fontSize: 32,
    marginRight: 16,
  },

  exerciseText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000",
  },
  customExerciseButton: {
    marginTop: 8,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#000",
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },

  customExerciseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
