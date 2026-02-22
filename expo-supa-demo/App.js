import React from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useAuthSession } from "./src/hooks/useAuthSession";
import { AuthScreen } from "./src/screens/AuthScreen";
import { DataScreen } from "./src/screens/DataScreen";

export default function App() {
  const { session, loading } = useAuthSession();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loaderCard}>
          <ActivityIndicator size="large" />
          <Text style={styles.loaderText}>Checking your session...</Text>
        </View>
        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {session ? <DataScreen session={session} /> : <AuthScreen />}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb"
  },
  loaderCard: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    padding: 24
  },
  loaderText: {
    color: "#475569"
  }
});
