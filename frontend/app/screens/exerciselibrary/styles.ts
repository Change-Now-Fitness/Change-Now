import { StyleSheet } from "react-native";

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
    width: "24%",
    backgroundColor: "#34393f",
    borderRadius: 20,
    marginRight: 8,
  },

  sidebarContent: {
    paddingVertical: 16,
    paddingHorizontal: 8,
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
    width: "74%",
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

export default styles;
