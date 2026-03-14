import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  backButton: {
    paddingVertical: 4,
    paddingRight: 12,
    paddingLeft: 4,
  },

  backText: {
    fontSize: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginRight: 32,
  },

  chartCard: {

    height: 280,

    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 12,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 4,
  },

  currentWorkoutCard: {
    borderWidth: 1.5,
    borderColor: "#000",
    borderRadius: 10,
    paddingVertical: 8,
    marginBottom: 16,
    backgroundColor: "#fdfdfd",
  },

  tableHeaderRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderColor: "#000",
    backgroundColor: "#f0f0f0",
  },

  tableRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  tableCell: {
    flex: 1,
    fontSize: 14,
  },

  tableCellHeader: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },

  previousContainer: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#000",
    borderRadius: 10,
    marginTop: 4,
    paddingVertical: 4,
    backgroundColor: "#fdfdfd",
  },

  previousDate: {
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 4,
  },

  previousScroll: {
    maxHeight: 220,
  },
});

