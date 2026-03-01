import { Text, View, StyleSheet, Pressable } from "react-native";

export default function LoginScreen() {
    const handleLogin = () => {
        console.log("Login Clicked")
    }
    return (
        <View style = {styles.container}>
            <Text style = {styles.title}>Change Now</Text>
            <Pressable 
                style = {styles.loginButton}
                onPress = {handleLogin}
            >
               <Text style = {styles.loginButtonText}>Log in</Text>
            </Pressable>
        
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: "#52b788"

    },
    title: {
        fontSize: 54,
        fontWeight: "bold",
        margin: 20,
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
        borderRadius: 50
    }
});