/**
 * Authentication endpoints.
 *
 * Mount points (see `backend/server.js`):
 * - `/auth/*`
 * - `/api/auth/*` (alias)
 *
 * Notes:
 * - Web uses an httpOnly `token` cookie.
 * - Mobile/app uses `Authorization: Bearer <token>`.
 */
const argon2 = require("argon2");
const pool = require('../dbconnection')
const jwt = require('jsonwebtoken');

const express = require("express");
const router = express.Router();
const { preload_workouts } = require('../services/preload')
const { buildTokenCookieOptions } = require("../config/runtime");
//secret code tbd, 'dev-secret' by defualt
const JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_KEY || 'dev-secret';
const TOKEN_MAX_AGE_MS = 60 * 60 * 1000;


/**
 * DEV: 
 * Takes credentials from client, encrypts a jwt token. 
 * Next, it sends it back as cookie for web and raw jwt mobile
 */

/**
 * @openapi
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, platform]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               platform:
 *                 type: string
 *                 description: e.g. web or ios/android
 *     responses:
 *       '200':
 *         description: Web sets httpOnly cookie and returns JSON body; mobile returns token in body
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                 - type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     user:
 *                       type: object
 *       '400':
 *         description: Missing email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       '409':
 *         description: Email already registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
    router.post('/signup', async (req, res) => {
        const { email, password, firstName, lastName, platform} = req.body;
        //ensure required fields filled, else returns json w error
        if (!email?.trim() || !password?.trim()) {
            return res.status(400).json({ error: 'Email and Password required'});
        }

        try {
            const tryExistingEmail = await pool.query(
                'SELECT id FROM users WHERE email = $1',
                [email]
            );
            if (tryExistingEmail.rows.length > 0) {
                return res.status(409).json({ error: 'Account already exists with this email'});
            }
            const passwordHash = await argon2.hash(password);
            const newAccount = await pool.query(
            'INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id, email',
            [email, passwordHash, firstName, lastName]
        );
        const newUser = newAccount.rows[0];
        const userId = newUser.id;

        const preload = await preload_workouts(userId);
        if (preload.success) {
            console.log('preload successful');
        } else {
            console.log('preload failure: ', preload.error)
        }

        const token = jwt.sign(
            {
                user_id: userId
            },
            JWT_SECRET,
            { expiresIn: '24h'}

        );
        if (platform === 'web') {
            console.log(`token: ${token}`);

            console.log('sending cookie, web');
            res.cookie('token', token, buildTokenCookieOptions(TOKEN_MAX_AGE_MS));
            return res.status(200).json({'success': true});

        } else {
            return res.json({token, user: {id: newUser.id, email: newUser.email}});
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error'});
    }
});

/**
 * DEV: 
 * Takes credentials from client and queries db for user with same email (id).
 * If one exists, returns the password hash and compares it with the argon encyption key with
 * the password input. Returns either cookie or raw JWT based on requestor OS.
 */

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Log in (web uses cookie; mobile returns JWT in JSON)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, platform]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               platform:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                 - type: object
 *                   properties:
 *                     token:
 *                       type: string
 *       '400':
 *         description: Empty email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       '403':
 *         description: Wrong password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       '404':
 *         description: No user for email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post('/login/', async (req, res) => {
    console.log('login serverside gateway reached');
    //take http request and get body of json, ensure fields not empty
    const {email, password, platform} = await req.body;
    console.log(`email input: ${email}, pass input: ${password}`);
    if (!email || !password) {
        return res.status(400).json(
            {error: `Email or password fields are empty, email: ${email}, password: ${password}`});
    }
    //connect to db
    try {
        const db_res = await pool.query('SELECT id, password_hash FROM users WHERE email = $1', [email]);
        console.log('query done');
        if (db_res.rows.length < 1) {
            return res.status(404).json({error: "No user found with that email"});
        }

        //flow state - get password hash from db_res
        const {id, password_hash} = db_res.rows[0]; 
        console.log(`id and hash cashed`);

        //validate password
        if (await argon2.verify(password_hash, password)) {
            //with user data, create a token and send it back to the user 
            console.log('password verified');
            //console.log(`id: ${id}`);
            const token = jwt.sign({
                user_id: `${id}`
            }, JWT_SECRET, { expiresIn: '24h'});
            console.log('token made');
            //console.log(`token: ${token}`);
            //30 sec token for testing
            if (platform === 'web') {
                res.cookie('token', token, buildTokenCookieOptions(TOKEN_MAX_AGE_MS));
                console.log('cookie sent');
                return res.status(200).json({success: true});
                

            } else {
                console.log('returning mobile token');
                return res.status(200).json({token: token});
            }


        } else {
            console.log('pass verified failed');
            return res.status(403).json({error: "Incorrect Username or Password"});
        }
    
    } catch {
        return res.status(500).json({error: "Server error"});
    }

});

/**
 * DEV: 
 * 'Middleware' (helper) function that checks if the user's tokens are valid,
 * returns result to client. Prepared for both cookies and jwt tokens.
 */

/**
 * @openapi
 * /auth/requireAuth:
 *   post:
 *     summary: Validate session (cookie or Bearer token)
 *     tags: [Auth]
 *     description: >
 *       Web sends httpOnly cookie (credentials include). Mobile sends
 *       Authorization Bearer token. No JSON body required.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       '200':
 *         description: Token verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jwtoken:
 *                   type: object
 *                   description: Decoded JWT payload (shape depends on token)
 *       '401':
 *         description: Missing/invalid token or cookie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: bad token
 */
router.post('/requireAuth/', async (req, res) => {
    const headers = req.headers;
    console.log('requireAuth req recieved');
    //const dprint = headers;
    //console.log(`headers: ${JSON.stringify(dprint)}`)

    if (headers.cookie) {
        console.log('cookie');
        try {
            const token = getCookieValue(headers.cookie, 'token');
            //console.log(`cookie found: ${token}`);
            const jwtoken = jwt.verify(token, JWT_SECRET);
            console.log('user data sent back from verified cookie');
            return res.status(200).json({jwtoken});
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
                return res.status(200).json({jwtoken: verifiedToken});
            } catch {
                return res.status(401).json({success: false, message: 'bad token'});
            }
        }
    }
    console.log('no token found');

    return res.status(401).json({success: false, message: 'no valid cookie'});
});

/**
 * checks cookie for a val, null otherwise
 * @param {*} cookieHeader 
 * @param {*} name of value prefix in cookie
 * @returns 
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
/**
 * @openapi
 * canajnkljandna
 */
router.post('/requireAuth2/', async (req, res, next) => {
    const headers = req.headers;
    console.log('requireAuth2 req recieved');
    const dprint = headers;
    console.log(`headers: ${JSON.stringify(dprint)}`)

    if (headers.cookie) {
        console.log('cookie');
        try {
            const token = getCookieValue(headers.cookie, 'token');
            //console.log(`cookie found: ${token}`);
            const jwtoken = jwt.verify(token, JWT_SECRET);
            console.log('user id sent to next auth function from reqauth');
            req.user = { id: jwtoken.user_id };
            console.log('req user on cookie: ', JSON.stringify(req.user));
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
                req.user = { id: verifiedToken.user_id };
                return next();
            } catch {
                return res.status(401).json({success: false, message: 'bad token'});
            }
        }
    }
    console.log('no token found');

    return res.status(401).json({success: false, message: 'no valid cookie'});
});


module.exports = router;
