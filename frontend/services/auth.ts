import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { apiRequest } from './middleware';
import { buildApiUrl } from '@/lib/config';
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
const platform = Platform.OS;
const TOKEN_KEY = "user_token";

/**
 * Checks for valid token and returns boolean result
 * 
 * accepts browser cookies and jwt tokens for mobile
 */
export async function checkLogin() {
    console.log('login status checking...');
    if (platform === 'web') {
        try {
            const response = await fetch(buildApiUrl("/auth/requireAuth"), {
                method: 'POST',
                credentials: 'include'
            });
            const data = await response.json();
            console.log(`server repsonded with user ID:`, data);
            return {
                success: response.ok,
                user_id: data?.jwtoken?.user_id ?? '',
                status: response.status,
                message: data?.message ?? '',
            };
        } catch (error) {
            console.log(`auth error: ${error}`);
            return {
                success: false,
                user_id: '',
                status: 0,
                message: error instanceof Error ? error.message : 'Network request failed',
            };
        }

    } else {
        let checkToken = await SecureStore.getItemAsync(TOKEN_KEY);
        if (checkToken) {
            try {
                const response = await fetch(buildApiUrl("/auth/requireAuth"), {
                    method: 'POST',
                    headers: {
                        'Content-Type':'application/json',
                        'Authorization': `Bearer ${checkToken}`
                    },
                });
                const data = await response.json();
                if (!response.ok && response.status === 401) {
                    await SecureStore.deleteItemAsync(TOKEN_KEY);
                }

                return {
                    success: response.ok,
                    user_id: data?.jwtoken?.user_id ?? '',
                    status: response.status,
                    message: data?.message ?? '',
                };
                
            } catch (error) {
                console.log(`Bad token: ${error}`);
                return {
                    success: false,
                    user_id: '',
                    status: 0,
                    message: error instanceof Error ? error.message : 'Network request failed',
                };
            }

        } 
        console.log('no token found');
        return {
            success: false,
            user_id: '',
            status: 401,
            message: 'Authentication token not found',
        };
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
        const request = await fetch(buildApiUrl("/auth/login"), {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, platform })
        });
        let data: any = null;
        try {
            data = await request.json();
        } catch {
            data = null;
        }

        if (!request.ok) {
            const message =
                data?.message ||
                data?.error ||
                (request.status === 401
                    ? "Incorrect email or password."
                    : "We couldn’t log you in right now. Please try again.");
            console.log(`platform: ${platform}, Error: ${request.status}`);
            return { success: false, status: request.status, message };
        }

        if (platform === 'web') {
            console.log('web login function comlete');
            return { success: true, status: request.status, message: "" };
        } else {
            const java_obj_response = data;
            const json_response = JSON.stringify(java_obj_response);
            console.log(`response: ${json_response}`);
            console.log('response recieved');
            if (java_obj_response?.token) {
                await SecureStore.setItemAsync(TOKEN_KEY, java_obj_response.token);
            }
            console.log('mobile login complete');
            return { success: true, status: request.status, message: "" };
        }
    } catch (error) {
        console.log(`error: ${error}`);
        return {
            success: false,
            status: 0,
            message: error instanceof Error ? error.message : "Network request failed",
        };
    }
}

/**
 * Takes input from signup page and based on OS, saves token for
 * future login. Currently, the token lasts 30 sec for testing
 * @param email 
 * @param password 
 * @returns 
 */
export async function signUp(email: string, password: string, firstName: string, lastName: string) {
    try {
        const response = await fetch(buildApiUrl("/auth/signup"), {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, firstName, lastName, platform }),
        });
          console.log('post response true: ', response.ok);
          const userData = await response.json();

          
          //if response isnt 200 - success
          if (!response.ok) {
              console.log('Signup Failed', userData);
              return false;
          }

        if (platform !== "web") {

            await SecureStore.setItemAsync(TOKEN_KEY, userData.token);
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
/**
 * Logs user out from userscreen
 */
export async function logOut() {
    if (platform !== 'web') {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        return { success: true, data: null };
    } else {
        try {
            const request = await apiRequest("/user/logOut", {
                'method': 'POST'
            })
            if (request.success) {
                console.log('backend reports logout successful')
                return { success: true, data: request.data };  
            }
            console.log('success fail');
            return { success: false, data: request.data, message: request.message };  

    
        } catch (error) {
            console.log('logout failed: ', error)
            return {success: false, data: error};
        }
    
    }



}
