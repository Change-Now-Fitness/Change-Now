import React, { useState } from "react";
import { Text, TextInput, View, StyleSheet, Pressable, Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const API_URL = "http://localhost:4000";

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const userData = await response.json();

      if (!response.ok) {
        console.log("Signup failed", userData);
        return;
      }

      if (Platform.OS !== "web") {
        await SecureStore.setItemAsync("authToken", userData.token);
        console.log("Signup success, token saved");
      } else {
        console.log(
          "Signup successful, token not saved because not using mobile OS"
        );
      }

      // TODO: navigate to the next screen after successful signup
    } catch (error) {
      console.log("Network error", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#666"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Pressable style={styles.signupButton} onPress={handleSignup}>
        <Text style={styles.signupButtonText}>Create Account</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#52b788",
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    margin: 40,
    color: "#000000",
  },
  input: {
    backgroundColor: "#f5f5f5",
    color: "#000000",
    padding: 10,
    marginBottom: 20,
    width: "80%",
    borderRadius: 8,
  },
  signupButton: {
    backgroundColor: "#000000",
    padding: 16,
    width: 220,
    alignItems: "center",
    borderRadius: 50,
    marginTop: 10,
  },
  signupButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f5f5f5",
  },
});

