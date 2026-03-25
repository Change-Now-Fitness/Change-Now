import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, spacing, fontSize, borderRadius } from "@/lib/theme";

export default function UserScreen() {

  return (
    <View style={s.container}>
      <Text style={s.header}>Profile</Text>

      <View style={s.card}>
        <View style={s.avatarWrap}>
          <Text style={{ fontSize: 32 }}>👤</Text>
        </View>
        <View>
          <Text style={s.cardTitle}>Account</Text>
          <Text style={s.cardSubtitle}>Logged in</Text>
        </View>
      </View>

      <TouchableOpacity
        style={s.logoutButton}
        //onPress={}
        activeOpacity={0.8}
      >
        <Text style={s.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  header: {
    fontSize: fontSize.xxl,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.lg,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  avatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.bgInput,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    height: 50,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.danger,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutText: {
    color: colors.danger,
    fontSize: fontSize.md,
    fontWeight: "700",
  },
});