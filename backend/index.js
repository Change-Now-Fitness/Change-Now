require('dotenv').config();

const express = require('express');
const app = express();
app.use(express.json());

//connect to postgress with pg
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

//test route
app.get('/', (req, res) => {
    res.send('Gym API is running');
})

//start server
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})


//get all members test
app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error'});
    }
});