const express = require('express');
const router = express.Router();
const {requireAuth2} = require('../routes/auth');
const pool = require('../dbconnection');

router.post('/getName', requireAuth2, async (req, res) => {
    const user_id = req.user_id;
    try {
        const full_name = await pool.query(
        'SELECT first_name, last_name FROM users WHERE user_id = $1',
        [user_id]);
        console.log('fetched fullname from db');
        
        return res.status(200).json({user_full_name: full_name})

    } catch (error) {
        console.log('failed to fetch name from db, error: ', error);
        return res.status(500).json({error: error});
    }
});