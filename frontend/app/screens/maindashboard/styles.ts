import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flexGrow: 1,
  },

  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5,
  },

  welcome: {
    fontSize: 18,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  newExerciseCard: {
    height: 120,
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },

  plus: {
    fontSize: 40,
    fontWeight: "bold",
  },

  exerciseCard: {
    flexDirection: "row",
    alignItems: "center",
    height: 80,
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
  },

  exerciseIcon: {
    fontSize: 28,
    marginRight: 15,
  },

  exerciseText: {
    fontSize: 18,
    fontWeight: "500",
  },
});