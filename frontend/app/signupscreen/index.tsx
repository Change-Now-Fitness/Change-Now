
import React, { useState, useRef } from "react";
import { Text, TextInput, View, StyleSheet, Pressable, Animated, Platform } from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { supabase } from '@/lib/supabase'; 


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
    backgroundColor: "#48494b",
  },
  title: {
    fontSize: 48,
    fontFamily: 'BebasNeue_400Regular',
    fontWeight: "bold",
    margin: 40,
    color: "#ffffff",

  },
  input: {
    backgroundColor: "#f5f5f5",
    color: "#000000",
    padding: 10,
    marginBottom: 20,

    width: "100%",
    borderRadius: 8,
  },
  inputContainer: {
    backgroundColor: "#616569",
    borderRadius: 20,
    padding: 20,
    width: "80%",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#363636",
    overflow: "hidden",
    alignSelf: "center",
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

    fontFamily: 'BebasNeue_400Regular',
    color: "#f5f5f5",
  },
  signupButtonHovered: {
    backgroundColor: "#222222",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 14,
    marginTop: 8,        
    marginBottom: 8,
    width: "80%",        
    textAlign: "center",
}
})