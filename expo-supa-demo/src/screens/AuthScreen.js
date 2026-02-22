import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AuthForm } from "../components/AuthForm";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState(
    isSupabaseConfigured
      ? "Use your email and password to sign in or create an account."
      : "Add Supabase values in .env before using auth."
  );

  async function withCredentials(action, email, password) {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setInfoMessage("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      // Reuse this wrapper for both sign-in and sign-up requests.
      await action(trimmedEmail, password);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignIn(email, password) {
    await withCredentials(async (trimmedEmail, rawPassword) => {
      const { error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: rawPassword
      });

      if (error) {
        setInfoMessage(`Sign in failed: ${error.message}`);
        return;
      }

      // Auth state listener in useAuthSession will switch to the data screen.
      setInfoMessage("Signed in.");
    }, email, password);
  }

  async function handleSignUp(email, password) {
    await withCredentials(async (trimmedEmail, rawPassword) => {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: rawPassword
      });

      if (error) {
        setInfoMessage(`Sign up failed: ${error.message}`);
        return;
      }

      // If email confirmation is enabled, session is null until user confirms by email.
      if (!data.session) {
        setInfoMessage("Account created. Check your email inbox for the confirmation link.");
        return;
      }

      setInfoMessage("Account created and signed in.");
    }, email, password);
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.header}>Authentication</Text>
      <AuthForm
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        loading={loading}
        infoMessage={infoMessage}
        isConfigured={isSupabaseConfigured}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingTop: 10
  },
  header: {
    marginHorizontal: 20,
    marginTop: 14,
    color: "#1e293b",
    fontSize: 28,
    fontWeight: "700"
  }
});
