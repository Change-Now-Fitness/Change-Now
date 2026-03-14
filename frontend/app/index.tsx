import { Text, TextInput, View, StyleSheet, Pressable, Animated } from "react-native";
import { useState, useRef } from "react";
import { useRouter } from "expo-router";
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { supabase } from '@/lib/supabase'; 


const API_URL = "http://localhost:4000";

export default function LoginScreen() {

    /**
     * to do:
     * take first and last name in signup
     * display error messages cleanly
     */

    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    const [loginHovered, setLoginHovered] = useState(false);
    const [signupHovered, setSignupHovered] = useState(false);
    const router = useRouter();

    const loginScaleAnim = useRef(new Animated.Value(1)).current;
    const signupScaleAnim = useRef(new Animated.Value(1)).current;

    const [fontsLoaded] = useFonts({
        BebasNeue_400Regular,
    });

    if (!fontsLoaded) {
        return null;
    }

    const handleLoginPressIn = () => {
        Animated.spring(loginScaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
    };
    const handleLoginPressOut = () => {
        Animated.spring(loginScaleAnim, { toValue: 1, useNativeDriver: true }).start();
    };

    const handleSignupPressIn = () => {
        Animated.spring(signupScaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
    };
    const handleSignupPressOut = () => {
        Animated.spring(signupScaleAnim, { toValue: 1, useNativeDriver: true }).start();
    };

    const handleLogin = async () => {
        console.log('log in clicked');
        //check if required fields are filled
        if ( !setEmail || !setPassword ) {
            return console.log('Error with credentails');
        }

        //take input and format into request
        try {
            console.log('request sent to server');
            const request = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({email, password})
            });
            if (!request.ok){
                return console.log(`Error: ${request.status}`);
            }

            console.log(`response code from frontend: ${request.status}`);
            const java_obj_response = await request.json();
            const json_response = JSON.stringify(java_obj_response);
            console.log(`response: ${json_response}`);
            console.log('response recieved');
            //store token from json in secure storage on client (keychain)
            //SecureStore.setItemAsync('user_token', json_response);
            router.push('/screens/maindashboard'); 
            return console.log("Login Success!, token stored (on mobile, not web)");


        } catch (error) {
            return console.log(`error: ${error}`);
        }



            //navigate user to main dashboard and pass token


        //send request and if response fails, put message

        //if response succeeds, take user token and navigate to dashboard 
        //populate dashboard with token and use token to populate data
    }
    const handleSignup = async () => {
        router.push("/signupscreen")
    };
 
    
    return (
        <View style = {styles.container}>
            <Text style = {styles.title}>ChangeNow</Text>
            
        <View style = {styles.inputContainer}>
            <TextInput
                style = {styles.input}
                placeholder = "Email"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder = "Password"
                placeholderTextColor = "#666"
                value = {password}
                onChangeText = {setPassword}
                secureTextEntry/>
        </View>   
        
            <Animated.View style={{ transform: [{ scale: loginScaleAnim }] }}>
                <Pressable
                    style={({ pressed }) => [
                        styles.loginButton,
                        loginHovered && styles.loginButtonHovered,
                        pressed && styles.loginButtonPressed,
                    ]}
                    onPress={handleLogin}
                    onPressIn={handleLoginPressIn}
                    onPressOut={handleLoginPressOut}
                    onHoverIn={() => setLoginHovered(true)}
                    onHoverOut={() => setLoginHovered(false)}
                >
                    <Text style={styles.loginButtonText}>Log In</Text>
                </Pressable>
            </Animated.View>

             <Animated.View style={{ transform: [{ scale: signupScaleAnim }] }}>
                <Pressable
                    style={({ pressed }) => [
                        styles.loginButton,
                        signupHovered && styles.loginButtonHovered,
                        pressed && styles.loginButtonPressed,
                    ]}
                    onPress={handleSignup}
                    onPressIn={handleSignupPressIn}
                    onPressOut={handleSignupPressOut}
                    onHoverIn={() => setSignupHovered(true)}
                    onHoverOut={() => setSignupHovered(false)}
                >
                    <Text style={styles.loginButtonText}>Sign Up</Text>
                </Pressable>
            </Animated.View>
        
        </View>
    );
}
const styles = StyleSheet.create({
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
    container: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: "#48494b"

    },
    title: {
        fontSize: 40,
        fontFamily: 'BebasNeue_400Regular',
        fontWeight: "bold",
        margin: 40,
        color: "#ffffff",
        alignSelf: "center",
  
    },
    loginButtonText: {
        fontSize: 25,
        fontWeight: "bold",
        fontFamily: 'BebasNeue_400Regular',
        color: "#f5f5f5"
    
    },
    loginButton: {
        backgroundColor: "#000000",
        padding: 20,
        width: 200,
        alignItems: "center",
        borderRadius: 50,
        margin: 10
    },
    loginButtonHovered: {
        backgroundColor: "#222222",
    },
    loginButtonPressed: {
        backgroundColor: "#333333",
        transform: [{ scale: 0.95 }],
    },
});
