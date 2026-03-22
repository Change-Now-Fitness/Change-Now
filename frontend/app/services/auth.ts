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
            const response = await fetch(`${API_URL}/auth/requireAuth`, {
                method: 'POST',
                credentials: 'include'
            });
            const data = await response.json();
            console.log(`server repsonded with user ID:`, data.jwtoken.user_id);
            return response.ok;
        } catch (error) {
            console.log(`auth error: ${error}`);
        }

    } else {
        //add mobile token check
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

export async function login(email: string, password: string) {
    //take input and format into request
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


        //store token from json in secure storage on client (keychain)
        // To fix issue on web
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

export async function signUp(email: string, password: string) {
    try {
          const response = await fetch(`${API_URL}/auth/signup`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({email, password, platform}),
          });

          const userData = await response.json();
          
          //if response isnt 200 - success
          if (!response.ok) {
              console.log('Signup Failed', userData);
              return false;
          }
          
          if (Platform.OS != "web") {

          await SecureStore.setItemAsync('authToken', userData.token);
          console.log('Signup Success, token saved');
          router.push("/screens/maindashboard");  
          return false;



          } else {
              //currently we cant handle storing web tokens, only mobile
              //maybe i will implement for testing purposes but for now skipping
              console.log('Signup Successful, token not saved because not using mobile OS')
              router.push("/screens/maindashboard");  
              return false;
          }

          //Add nav for workout page


      } catch (error) {
          console.log('Network Error', error);
          return false;
      }

}