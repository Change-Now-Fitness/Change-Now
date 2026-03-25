const argon2 = require("argon2");
const pool = require('../dbconnection')
const jwt = require('jsonwebtoken');

const express = require("express");
const router = express.Router();
//secret code tbd, 'dev-secret' by defualt
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'; 

/**
 * Takes credentials from client, encrypts a jwt token. 
 * Next, it sends it back as cookie for web and raw jwt mobile
 */
router.post('/signup', async (req, res) => {
    const { email, password, platform} = req.body;
    //ensure required fields filled, else returns json w error
    if (email == "" || password == "") {
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
            [email, passwordHash, 'first d', 'lastexample']
        );
        const user = newAccount.rows[0];

        const token = jwt.sign(
            {
                user_id: user.id
            },
            JWT_SECRET,
            { expiresIn: '1h'}

        );
        if (platform === 'web') {
            console.log(`token: ${token}`);

            console.log('sending cookie, web');
            res.cookie('token', token, {
                    httpOnly: true,
                    secure: false,
                    sameSite: "lax",
                    maxAge: 30 * 1000
            });
            return res.status(200).json({'success': true});

        } else {
            return res.json({token, user: {id: user.id, email: user.email}});
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error'});
    }
});

/**
 * Takes credentials from client and queries db for user with same email (id).
 * If one exists, returns the password hash and compares it with the argon encyption key with
 * the password input. Returns either cookie or raw JWT based on requestor OS. 
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
            }, JWT_SECRET, { expiresIn: '1h'});
            console.log('token made');
            //console.log(`token: ${token}`);
            //30 sec token for testing
            if (platform === 'web') {
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'lax',
                    maxAge: 30 * 1000
                });
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
    
    } catch (error) {
        return res.status(500).json({error: "Server error"});
    }

});

/**
 * 'Middleware' (helper) function that checks if the user's tokens are valid,
 * returns result to client. Prepared for both cookies and jwt tokens.
 */
router.post('/requireAuth/', async (req, res) => {
    const headers = await req.headers;
    console.log('requireAuth req recieved');
    const dprint = headers;
    console.log(`headers: ${JSON.stringify(dprint)}`)

    if (headers.cookie) {
        console.log('cookie');
        try {
            const token = headers.cookie.substring(6);
            console.log(`cookie found: ${token}`);
            const jwtoken = jwt.verify(token, JWT_SECRET);
            console.log('user data sent back from verified cookie');
            return res.status(200).json({jwtoken});
        } catch (error) {
            console.log('bad cookie');
            return res.status(401).json({success: false, message: 'bad token'});
        }
    } else if (headers.authorization) {
        console.log('found mobile token');
        if (headers.authorization.substring(0,6) === 'Bearer') {
            console.log('bearer located');
            const token = headers.get('Authorization').substring(6);
            try {
                const verifiedToken = jwt.verify(token, JWT_SECRET);
                console.log('token verified');
                return res.status(200).json({verifiedToken});
            } catch (error) {
                return res.status(401).json({success: false, message: 'bad token'});
            }
        }
    }
    console.log('no token found');

    return res.status(401).json({success: false, message: 'no valid cookie'});
});

module.exports = router;