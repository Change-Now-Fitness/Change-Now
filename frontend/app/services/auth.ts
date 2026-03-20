import { Platform } from 'react-native';
import { useRouter} from 'expo-router';
import * as SecureStore from 'expo-secure-store';
/**
 * functions that allow for checking the log in status of a user quickly
 */

const router = useRouter();
const API_URL = 'http://localhost:4000';

const platform = Platform.OS;

//Checks if there is a valid token and returns boolean result
export async function checkLogin() {
    console.log('login status checking...');
    if (platform == 'web') {
        try {
            const response = await fetch(API_URL, {credentials: 'include'});
            console.log('trying token');
            return response.ok;
        } catch (error) {
            console.log(`auth error: ${error}`);
        }

    } else {
        //add mobile token check
        let checkToken = await SecureStore.getItemAsync('user_token');
        if (checkToken) {
            const body = {
                'Authorization': `Bearer ${checkToken}`
            };

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type':'application/json'
                    },
                    body: JSON.stringify(body),
                })
            } catch (error) {
                console.log(`Bad token error: ${error}`);
                return false;
            }

        } 
        console.log('no token found');
        return false;
    }
}

export  async function login(email: string, password: string) {
    //take input and format into request
    try {
        console.log('request sent to server');
        const request = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, platform })
        });
        if (!request.ok) {
            return console.log(`Error: ${request.status}`);
        }

        console.log(`response code from frontend: ${request.status}`);
        const java_obj_response = await request.json();
        const json_response = JSON.stringify(java_obj_response);
        console.log(`response: ${json_response}`);
        console.log('response recieved');
        //store token from json in secure storage on client (keychain)
        // To fix issue on web
        if (platform === 'web') {
            localStorage.setItem('user_token', java_obj_response.token);
        } else {
            await SecureStore.setItemAsync('user_token', java_obj_response.token);
        }
        router.push('/screens/maindashboard');
        return console.log("Login Success!, token stored (on mobile, not web)");


    } catch (error) {
        return console.log(`error: ${error}`);
    }
    return;
}