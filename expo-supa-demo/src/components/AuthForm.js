import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export function AuthForm({ onSignIn, onSignUp, loading, infoMessage, isConfigured }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const disabled = loading || !isConfigured;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Expo + Supabase Demo</Text>
      <Text style={styles.subtitle}>Sign up or sign in with email and password.</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        value={password}
        onChangeText={setPassword}
      />

      <Pressable style={[styles.primaryButton, disabled && styles.buttonDisabled]} onPress={() => onSignIn(email, password)} disabled={disabled}>
        <Text style={styles.primaryButtonText}>{loading ? "Working..." : "Sign In"}</Text>
      </Pressable>

      <Pressable style={[styles.secondaryButton, disabled && styles.buttonDisabled]} onPress={() => onSignUp(email, password)} disabled={disabled}>
        <Text style={styles.secondaryButtonText}>Create New Account</Text>
      </Pressable>

      <Text style={styles.message}>{infoMessage}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 40,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    padding: 20,
    gap: 12,
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a"
  },
  subtitle: {
    color: "#475569"
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#ffffff"
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center"
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "600"
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center"
  },
  secondaryButtonText: {
    color: "#1d4ed8",
    fontWeight: "600"
  },
  buttonDisabled: {
    opacity: 0.5
  },
  message: {
    minHeight: 40,
    color: "#334155"
  }
});
