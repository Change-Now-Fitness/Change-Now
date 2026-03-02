
//password hasher
const argon2 = require("argon2");
const pool = require('../dbconnection')
//token library

const jwt = require('jsonwebtoken');
//secret code tbd, 'dev-secret' by defualt
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'; 

//auth
app.post('/auth/signup', async (req, res) => {
    //ensure required fields filled, else returns json w error
    if (email == "" || password == "") {
        return res.status(400).json({ error: 'Email and Password required'});
    }

    try {
        const tryExistingEmail = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );
    }
})