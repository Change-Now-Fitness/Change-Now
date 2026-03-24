import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
/**
 * User authentication functions and middleware
 * 
 * Login and signup page functions route here and these functions will
 * communicate with the backend to verify/upload/check cookies and
 * credentials. 
 * 
 * Functions return a true or false based on success which can be used
 * to use the "router" hook to change pages accordingly
 */

const API_URL = 'http://localhost:4000';

const platform = Platform.OS;

/**
 * Checks for valid token and returns boolean result
 * 
 * accepts browser cookies and jwt tokens for mobile
 */
export async function checkLogin() {
    console.log('login status checking...');
    if (platform == 'web') {
        try {
            const response = await fetch(`${API_URL}/auth/requireAuth`, {
                method: 'POST',
                credentials: 'include'
            });
            const data = await response.json();
            console.log(`server repsonded with user ID:`, data);
            return response.ok;
        } catch (error) {
            console.log(`auth error: ${error}`);
        }

    } else {
        let checkToken = await SecureStore.getItemAsync('user_token');
        if (checkToken) {
            try {
                const response = await fetch(`${API_URL}/auth/requireAuth`, {
                    method: 'POST',
                    headers: {
                        'Content-Type':'application/json',
                        'Authorization': `Bearer ${checkToken}`
                    },
                });
                
            } catch (error) {
                console.log(`Bad token: ${error}`);
                return false;
            }

        } 
        console.log('no token found');
        return false;
    }
}

/**
 * Takes login input from login screen and sends it to backend auth
 * end point to verify, returns boolean success result
 * @param email 
 * @param password 
 * @returns 
 */
export async function login(email: string, password: string) {
    try {
        console.log('request sent to server');
        const request = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, platform })
        });
        if (!request.ok) {
            console.log(`platform: ${platform}, Error: ${request.status}`);
            return false;
        }

        if (platform == 'web') {
            console.log('web login function comlete');
            return true;
        } else {
            const java_obj_response = await request.json();
            const json_response = JSON.stringify(java_obj_response);
            console.log(`response: ${json_response}`);
            console.log('response recieved');
            await SecureStore.setItemAsync('user_token', java_obj_response.token);
            console.log('mobile login complete');
            return true;
        }
    } catch (error) {
        console.log(`error: ${error}`);
        return false;
    }
}

/**
 * Takes input from signup page and based on OS, saves token for
 * future login. Currently, the token lasts 30 sec for testing
 * @param email 
 * @param password 
 * @returns 
 */
export async function signUp(email: string, password: string) {
    try {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, platform }),
        });
          console.log('post response true: ', response.ok);
          const userData = await response.json();

          
          //if response isnt 200 - success
          if (!response.ok) {
              console.log('Signup Failed', userData);
              return false;
          }

        if (platform != "web") {

            await SecureStore.setItemAsync('authToken', userData.token);
            console.log('Signup Success, jwt mobile token saved');
            return true;



        } else if (platform === 'web') {
            console.log('webtoken found, signup successful, moving to dashboard');
            return true;
        }
        else {
            console.log('platform not found');
            return false;
        }

          //Add nav for workout page


      } catch (error) {
          console.log('Network Error', error);
          return false;
      }

}