import { Text, TextInput, View, StyleSheet, Pressable, Animated } from "react-native";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "expo-router";
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { checkLogin, login } from "@/services/auth";
import { log } from "node:console";




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

    const platform = Platform.OS;

    const checkLoginStatus = async () => {

        try {
            const login_status = await checkLogin();
            console.log(`login status: ${login_status.success}`);
            if (login_status.success == true) {
                router.replace('/(tabs)/exerciselibrary');
                return true;
            } else {
                console.log('check login returned false');
                return false;
            }
        } catch (error) {
            console.log(`error checking log in status ${error}`);
            return false;
        };
    };

    useEffect(() => {
        checkLoginStatus();
    }, []);
        

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

    //uses auth/login helper function to log user into dashboard or return error
    const handleLogin = async () => {
        console.log('log in clicked');
        if ( !setEmail || !setPassword ) {
            return console.log('Error with credentails');
        };

        try {
            const attemptLogin = await login(email, password);
            if (attemptLogin) {
                router.replace('/(tabs)/exerciselibrary');
                return;
            } 
            return;
        } catch (error) {
            return console.log(`error in frontend auth: ${error}`);
        };
    }

    const handleSignup = async () => {
        router.push("/screens/signup")
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
                testID="email"
            />
            <TextInput
                style={styles.input}
                placeholder = "Password"
                placeholderTextColor = "#666"
                value = {password}
                onChangeText = {setPassword}
                testID="password"
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
                    accessibilityRole="button"
                    accessibilityLabel="Log In"
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
