import React, { useState, useRef } from "react";
import { Text, TextInput, View, StyleSheet, Pressable, Animated, Platform } from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { supabase } from '@/lib/supabase'; 


const API_URL = "http://localhost:4000";

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, confirmSetPassword] = useState("");
  const [error, setError] = useState("");

  const [loginHovered, setLoginHovered] = useState(false);
  const [signupHovered, setSignupHovered] = useState(false);

  const loginScaleAnim = useRef(new Animated.Value(1)).current;
  const signupScaleAnim = useRef(new Animated.Value(1)).current;

  const [fontsLoaded] = useFonts({
        BebasNeue_400Regular,
    });

    if (!fontsLoaded) {
        return null;
    }

  const handleSignupPressIn = () => {
      Animated.spring(signupScaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  };
  const handleSignupPressOut = () => {
      Animated.spring(signupScaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const handleSignup = async () => {
    setError("");

    // Confirm password check
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
          const response = await fetch(`${API_URL}/auth/signup`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({email, password}),
          });

          const userData = await response.json();
          
          //if response isnt 200 - success
          if (!response.ok) {
              console.log('Signup Failed', userData);
              return;
          }
          
          if (Platform.OS != "web") {

          await SecureStore.setItemAsync('authToken', userData.token);
          console.log('Signup Success, token saved');
          router.push("/screens/maindashboard");  



          } else {
              //currently we cant handle storing web tokens, only mobile
              //maybe i will implement for testing purposes but for now skipping
              console.log('Signup Successful, token not saved because not using mobile OS')
              router.push("/screens/maindashboard");  
          }

          //Add nav for workout page


      } catch (error) {
          console.log('Network Error', error);
      }
    }
    
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
        <View style = {styles.inputContainer}>
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
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#666"
          value={confirmPassword}
          onChangeText={confirmSetPassword}
          secureTextEntry
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}


      <Animated.View style={{ transform: [{scale: signupScaleAnim }]}}>
        <Pressable 
            style={({pressed}) => [
              styles.signupButton,
              signupHovered && styles.signupButtonHovered,
              pressed && styles.signupButtonHovered,
            ]}
            onPress={handleSignup}
            onPressIn={handleSignupPressIn}
            onPressOut={handleSignupPressOut}
            onHoverIn={() => setSignupHovered(true)}
            onHoverOut={() => setSignupHovered(false)}
            >
          <Text style={styles.signupButtonText}>Create Account</Text>
        </Pressable>
      </Animated.View>
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
},
});

