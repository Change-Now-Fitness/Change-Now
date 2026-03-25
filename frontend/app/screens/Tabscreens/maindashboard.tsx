import { Text, TouchableOpacity, ScrollView, StyleSheet,ActivityIndicator,View,} from "react-native";
import { useEffect,useState } from "react";
import { useRouter } from "expo-router";
import { checkLogin } from "../../../services/auth";
import { colors, spacing, fontSize, borderRadius } from "@/lib/theme";


const EXERCISES = [
  { id: "1", name: "Lat Pulldown", icon: "🏋️" },
  { id: "2", name: "Bench Press", icon: "💪" },
];

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const checkLoginStatus = async () => {

    try {
        const login_status = await checkLogin();
        console.log(`login status: ${login_status.success}`);
        if (login_status.success == true) {
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

  const handleNewExercise = () => {
    router.push("../exerciselibrary");
  };

  const handleAddCustomExercise = () => {
    router.push("../exerciselibrary");
  };

  const handleSelectExercise = (name: string, id: string) => {
    router.push({
      pathname: "../selectedexercise",
      params: { name, exerciseId: id.toString() },
    });
  };

  return (
    <ScrollView
      style={s.scrollView}
      contentContainerStyle={s.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={s.header}>ChangeNow</Text>
      <Text style={s.welcome}>Ready to train?</Text>

      <TouchableOpacity
        style={s.addCard}
        onPress={handleNewExercise}
        activeOpacity={0.7}
      >
        <Text style={s.addCardPlus}>+</Text>
        <Text style={s.addCardText}>New Exercise</Text>
      </TouchableOpacity>

      {/* Exercise List */}
      <Text style={s.sectionTitle}>My Exercises</Text>

      {/*  TabBar */}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  header: {
    fontSize: fontSize.xxl,
    fontWeight: "bold",
    color: colors.primary,
    letterSpacing: 1,
  },
  welcome: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  addCard: {
    height: 100,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
    flexDirection: "row",
    gap: spacing.sm,
  },
  addCardPlus: {
    fontSize: 28,
    fontWeight: "300",
    color: colors.primary,
  },
  addCardText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.md,
  },
  exerciseCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  exerciseIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.bgInput,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  exerciseName: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.text,
  },
  exerciseType: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  errorText: {
    color: colors.danger,
    marginTop: spacing.md,
  },
  emptyState: {
    alignItems: "center",
    marginTop: spacing.xl,
    paddingVertical: spacing.xl,
  },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});