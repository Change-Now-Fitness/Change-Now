/**
 * Standardized API function that wraps
 * a request to an endpoint with the 
 * user's tokens, ensuring protected endpoints
 * have credentials supplied to them
 * returns data
 * @author Samuel Mount
 */
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
const platform = Platform.OS;
const API_URL =  process.env.EXPO_PUBLIC_API_URL;

/**
 * Augments api fetch with auth tokens, takes api path and http options, returns success bool and data
 * @param endpointURL 
 * @param options use Method, Content type, and Body
 * @returns 
 */
async function apiRequest(endpointURL: string, options: RequestInit = {}) {

    const reqHeaders = new Headers(options.headers);
    //for non web, gets local storage token and appends appropriate headers to request
    if (platform != 'web') {
        try {
            const token = await SecureStore.getItemAsync('user_token');
            if (token == null) {
                console.log('null token');
                return {success : false, data: 'bad token, reported null'}; 
            }
            reqHeaders.set('Authorization', `Bearer ${token}`);
        } catch (error) {
            console.log('could not obtain valid storage token in middleware');
            return {success : false, data: error};
        }
    } 

    //append argument options and send req 
    try {
        const data = await fetch(`${API_URL}${endpointURL}`, {
            ...options, //appends options from arguments
            credentials: platform === 'web' ? 'include' : "omit",
            headers: reqHeaders
        })    
        const jsonData = await data.json(); //response object -> real json
        if (data.status != 200) {
            console.log('json data fail');
            return {success : false, data: 'json data failed to parse, could be empty'};
        }
        return {success: true, data: jsonData};
    } catch (error) {
        console.log('request to backend faied, reporting from middleware');
        return {success : false, data: error};
    }
}