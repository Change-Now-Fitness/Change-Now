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
    marginBottom: 18,
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
    fontSize: 22,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginRight: 32,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 10,
  },

  input: {
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },

  textArea: {
    minHeight: 110,
    textAlignVertical: "top",
  },

  addButton: {
    marginTop: 18,
    height: 54,
    borderRadius: 12,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },

  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
