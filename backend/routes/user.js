const express = require('express');
const router = express.Router();
const { requireAuth3 } = require('../middleware/requireAuth3');
const pool = require('../dbconnection');
/**
 * @openapi
 * /routes/getName:
 *   post:
 *     summary: Get user's name from DB and return it
 *     tags: [Profile]
 *     responses:
 *       '200':
 *         description: OK
 *       '500':
 *         description: Database request error
 *         
 */
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
/**
 * @openapi
 * /routes/logOut:
 *   post:
 *     summary: Checks the platform for web and clears cookie, 
 *              mobile token deleted on clientside
 *              
 *     tags: [Profile]
 *     responses:
 *       '200':
 *         description: Backend was able to destroy cookie or inform frontend mobile request leaked through
 */
router.post('/logOut', requireAuth3, async (req, res) => {
    console.log('logout request recieved');
    if (req.platform == 'web') {
        res.clearCookie('token', {
            httpOnly: true,
            secure: false, //on prod, true
            sameSite: 'lax', //on prod, "none"
            path: '/'
        });
        console.log('logout on backend attempting')
        return res.status(200).json({success: true, data: 'sent and overwrote logout cookie'});
    } else {
        return res.status(200).json({success: true, data: 'mobile application hit api, non destructive but fyi'}); 
    }
});
module.exports = router;