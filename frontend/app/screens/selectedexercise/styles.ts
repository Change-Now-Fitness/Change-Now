import { StyleSheet } from "react-native";
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#48494b",
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
    color: "#fafafa",
    flex: 1,
    textAlign: "center",
    marginRight: 32,
  },

  chartCard: {
    height: 160,
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 12,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafa",
  },

  chartPlaceholderText: {
    fontSize: 14,
    color: "#666",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fafafa",
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

  addSetRow: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 16,
  marginTop: 12,
  marginBottom: 24,
  gap: 8,
  },

  addSetInput: {
    flex: 1,
    minWidth: 0,        
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
  },

  addSetButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#222222',
    flexShrink: 0,      
  },

  addSetButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});

