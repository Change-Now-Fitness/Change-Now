import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },

  topBar: {
    flexDirection: "row",
    padding: 10,
  },

  search: {
    flex: 1,
    backgroundColor: "#222",
    borderRadius: 10,
    padding: 10,
    color: "white",
  },

  addButton: {
    marginLeft: 10,
    backgroundColor: "#1DB954",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  plus: {
    color: "white",
    fontSize: 24,
  },

  content: {
    flex: 1,
    flexDirection: "row",
  },

  sidebar: {
    width: 80,
    padding: 10,
  },

  sidebarItem: {
    color: "white",
    marginBottom: 15,
  },

  exerciseArea: {
    flex: 1,
  },

  groupTitle: {
    color: "white",
    fontSize: 20,
    margin: 10,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  card: {
    width: "45%",
    backgroundColor: "#222",
    padding: 20,
    margin: 10,
    borderRadius: 10,
  },

  exerciseName: {
    color: "white",
  },
});

export default styles;