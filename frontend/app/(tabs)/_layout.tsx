import { Tabs } from "expo-router";
import { Platform, Text } from "react-native";
import { colors } from "@/lib/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          paddingBottom: Platform.OS === "ios" ? 0 : 4,
        },
        tabBarStyle: {
          backgroundColor: colors.tabBg,
          borderColor: colors.border,
          borderWidth: 1,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 80 : 60,
          paddingTop: 8,
          position: "absolute",
          bottom: 24,
          left: 24,
          right: 24,
          borderRadius: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        },
      }}
    >

       <Tabs.Screen
        name="exerciselibrary"
        options={{
          title: "Exercise lib",
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>🤖</Text>,
        }}
      />
      <Tabs.Screen
        name="userscreen"
        options={{
          title: "Profile",
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}