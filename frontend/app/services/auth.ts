import { Platform } from 'react-native';

const platform = Platform.OS;
function checkLogin() {
    if (platform == 'web') {
        const response = await fetch("A", {credentials: 'include'}) {

        }

    } 

}