
/**
 * Dependencies
 * argon2 - password hasher
 * pool - connection layer for db
 * jwt - token library
 */
const argon2 = require("argon2");
const pool = require('../dbconnection')
const jwt = require('jsonwebtoken');

const express = require("express");
const router = express.Router();
//secret code tbd, 'dev-secret' by defualt
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'; 

/**
 * User Signup Auth
 * 
 * Checks if the client json req has email and password fields filled,
 * then checks if the email is already registered in the DB.
 * 
 * Hashes the password, then inserts new user credentials into DB.
 * 
 * Upon insertion, returns the user ID which is used to generate a Json Web Token
 * from the user data, which is then sent back to the client with 7 day expiration
 * 
 * Currently the JWT secret token is just dev-secret but that should be changed and put
 * into .env
 * -Sam
 */
router.post('/signup', async (req, res) => {
    const { email, password } = req.body;
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
                userID: user.id, email: user.email
            },
            JWT_SECRET,
            { expiresIn: '7d'}

        );
        res.json({token, user: {id: user.id, email: user.email}});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error'});
    }
});


router.post('/login/', async (req, res) => {
    
})

module.exports = router;