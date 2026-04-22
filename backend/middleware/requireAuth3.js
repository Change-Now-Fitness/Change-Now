const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_KEY || 'dev-secret'; 
/**
 * Authentication guard middleware used by routes that require a signed JWT.
 *
 * How it fits:
 * - Web: reads the `token` cookie (httpOnly cookie set by auth routes)
 * - Mobile/app: reads the `Authorization: Bearer <token>` header
 *
 * On success it attaches:
 * - `req.id`: authenticated user id
 * - `req.platform`: "web" or "application"
 */
function requireAuth3(req, res, next) {
    const headers = req.headers;
    console.log('requireAuth2 req recieved');
    //const dprint = headers;
    //console.log(`headers: ${JSON.stringify(dprint)}`)

    if (headers.cookie) {
        console.log('cookie');
        try {
            const token = getCookieValue(headers.cookie, 'token');
            //console.log(`cookie found: ${token}`);
            const jwtoken = jwt.verify(token, JWT_SECRET);
            console.log('user id sent to next auth function from reqauth');
            req.id = jwtoken.user_id;
            req.token = jwtoken;
            req.platform = 'web';
            console.log('req user on cookie: ', JSON.stringify(req.id));
            return next();
            
        } catch {
            console.log('bad cookie');
            return res.status(401).json({success: false, message: 'bad token'});
        }
    } else if (headers.authorization) {
        console.log('found mobile token');
        if (headers.authorization?.startsWith("Bearer ")) {
            console.log('bearer located');
            const token = headers.authorization.substring(7);
            try {
                const verifiedToken = jwt.verify(token, JWT_SECRET);
                console.log('token verified');
                req.id = verifiedToken.user_id;
                req.token = token;
                req.platform = 'application';
                return next();
            } catch {
                return res.status(401).json({success: false, message: 'bad token'});
            }
        }
    }
    console.log('no token found');

    return res.status(401).json({success: false, message: 'no valid cookie'});
};
/**
 * Extract a cookie value from the raw Cookie header.
 *
 * Used by `requireAuth3` to find the `token` cookie.
 */
function getCookieValue(cookieHeader, name) {
    if (!cookieHeader) {
        return null;
    }

    const valArray = cookieHeader.split(";")

    for (let value in valArray) {
        let val = valArray[value].trim().split("=", 2);
        if ( val[0] == name ) {
            if (val[1] == undefined) continue;
            return val[1];
        }
    } 
    return null;
}
module.exports = {requireAuth3};
