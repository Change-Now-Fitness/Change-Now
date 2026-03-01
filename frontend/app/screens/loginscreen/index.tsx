import { Text, TextInput, View, StyleSheet, Pressable } from "react-native";
import { useState } from "react";

export default function LoginScreen() {

    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = () => {
        console.log("Log in Clicked")
    }
    const handleSignup= () => {
        console.log("Sign up Clicked")
    }
 
    
    return (
        <View style = {styles.container}>
            <Text style = {styles.title}>Change Now</Text>
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
                secureTextEntry
                />
            <Pressable 
                style = {styles.loginButton}
                onPress = {handleLogin}
            >
               <Text style = {styles.loginButtonText}>Log In</Text>
            </Pressable>
             <Pressable 
                style = {styles.loginButton}
                onPress = {handleSignup}
            >
               <Text style = {styles.loginButtonText}>Sign Up</Text>
            </Pressable>
        
        </View>
    );
}

const styles = StyleSheet.create({
    input: {
        backgroundColor: "#f5f5f5",
        color: "#000000",
        margin: 10,
        padding: 5,
        marginBottom: 30 
    },
    container: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: "#52b788"

    },
    title: {
        fontSize: 54,
        fontWeight: "bold",
        margin: 40,
        color: "#000000",
  
    },
    loginButtonText: {
        fontSize: 34,
        fontWeight: "bold",
        color: "#f5f5f5"
    
    },
    loginButton: {
        backgroundColor: "#000000",
        padding: 20,
        width: 200,
        alignItems: "center",
        borderRadius: 50,
        margin: 10
    }
});