const express = require('express');
const router = express.Router();
const { requireAuth3 } = require('../middleware/requireAuth3');
const pool = require('../dbconnection');

router.post('/getName', requireAuth3, async (req, res) => {
    const user_id = req.id;
    try {
        console.log('getting name from user: ', user_id)
        const db_res = await pool.query(
        'SELECT first_name, last_name FROM users WHERE id = $1',
        [user_id]);
        console.log('fetched fullname from db');
        const data = db_res.rows[0];
        console.log(data)
        console.log(data.first_name);
        const full_name = `${data.first_name} ${data.last_name}`;

        console.log(full_name);
        return res.status(200).json({full_name: full_name})

    } catch (error) {
        console.log('failed to fetch name from db, error: ', error);
        return res.status(500).json({error: error});
    }
});
module.exports = router;