import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { colors, spacing, fontSize, borderRadius } from "@/lib/theme";
import { useState, useEffect } from "react";
import { useRouter } from 'expo-router';
import { apiRequest } from '@/services/middleware';
import { logOut } from '@/services/auth';

export default function UserScreen() {
  const router = useRouter();

  const [name, setName] = useState("Name Undefined");
  const [loading, setLoading] = useState(true);

  const loadName = async () => {
    try {
      console.log('loadname sent');
      const fullName = await apiRequest(`/user/getName`, {
        'method': 'POST'
      });

      if (fullName.success == true) {
        console.log('full name fetch worked, name parsed: ', fullName.data);
        const nameString = fullName.data.full_name;
        setName(nameString);
        console.log('name set, ', name);
        setLoading(false);
        return;
      } else {
        console.log('fullname returned fail, error: ', fullName.data);
        return router.replace('/');
      }

    } catch (error) {
      console.log('loadname fail, error: ', error);
      return router.replace('/');
    }
  }

  useEffect(() => {
    loadName();
  }, []);

  const handleLogOut = async () => {
    try {
      const res = await logOut();
      if (res?.success) {
        console.log('logoutsuccessful');
        return router.replace('/');
      }
      else {
        console.log('logout failed, error: ', res?.data);
        router.replace('/');
        return; //add ui error
      }

    } catch (e) {
      console.log('logout failed, ', e);
      return;
    }
  }

  return (
    <View style={s.container}>
      {
        loading ? (
          <ActivityIndicator size = "large" color = "#000FFF" />
        ) :(
            <>
              <Text style={s.header}>Profile</Text>

              <View style={s.card}>
                <View style={s.avatarWrap}>
                  <Text style={{ fontSize: 32 }}>👤</Text>
                </View>
                <View>
                  <Text style={s.cardTitle}>Welcome, {name}</Text>
                  <Text style={s.cardSubtitle}>Logged in</Text>
                </View>
              </View>

              <TouchableOpacity
                style={s.logoutButton}
                onPress={handleLogOut}
                activeOpacity={0.8}
              >
                <Text style={s.logoutText}>Log Out</Text>
              </TouchableOpacity>
            </>
          )
      }
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