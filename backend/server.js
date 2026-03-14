require('dotenv').config();

const express = require('express');
const authRouter = require("./routes/auth");
const app = express();
//my browser requires whitelisted address if api and frontend addresses are different
const cors = require("cors");
app.use(cors({
    origin: "http://localhost:8081",
}));

app.use(express.json());
app.use("/auth", authRouter);
const pool = require('./dbconnection');



//test route
app.get('/', (req, res) => {
    res.send('Gym API is running');
})

//start server
const port = process.env.PORT || 4000;

app.listen(port, '', () => {
    console.log(`Server listening on port ${port}`);
});


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