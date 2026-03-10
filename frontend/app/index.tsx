import { Text, TextInput, View, StyleSheet, Pressable } from "react-native";
import { useState } from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const API_URL = "http://localhost:4000";

export default function LoginScreen() {

    /**
     * to do:
     * take first and last name in signup
     * display error messages cleanly
     */

    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    /**
     * 
     * @returns 
     */
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

            } else {
                //currently we cant handle storing web tokens, only mobile
                //maybe i will implement for testing purposes but for now skipping
                console.log('Signup Successful, token not saved because not using mobile OS')
            }

            //Add nav for workout page


        } catch (error) {
            console.log('Network Error', error);
        }
    };
 
    
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