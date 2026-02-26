require('dotenv').config();

//configure express
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
    console.log('Server listening on port ${port}');
})