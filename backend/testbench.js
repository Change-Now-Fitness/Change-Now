/**
 * checks cookie for a val, null otherwise
 * @param {*} cookieHeader 
 * @param {*} name 
 * @returns 
 */
function getCookieValue(cookieHeader, name) {
    if (!cookieHeader) {
        return null;
    }

    const valArray = cookieHeader.split(";")

    for (let value in valArray) {
        let val = valArray[value].trim().split("=")
        if ( val[0] == name ) {
            return val[1];
        }
    } 
    return null;
}




const test1 = "theme=dark; token=vdjnaddl; sid=xyz"
const test2 = "theme=dark; sid=xyz"
console.log('test1 result:');
console.log(getCookieValue(test1, 'token'));
console.log('test2 result:');
console.log(getCookieValue(test2, 'token'));