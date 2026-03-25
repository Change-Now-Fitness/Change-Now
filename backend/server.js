require('dotenv').config();

const express = require('express');
const authRouter = require("./routes/auth");
const exerciseRoutes = require("./routes/exerciseRoutes");
const workoutRouter = require("./routes/workouts");
const app = express();
//my browser requires whitelisted address if api and frontend addresses are different
const cors = require("cors");
app.use(cors({
    origin: "http://localhost:8081",
    credentials: true
}));

app.use(express.json());
app.use("/auth", authRouter);
// Exercise routes are scaffolded separately so the frontend can move to a real
// API contract without changing its object shape later.
app.use("/exercises", exerciseRoutes);
const pool = require('./dbconnection');
app.use("/workouts", workoutRouter)


//test route
app.get('/', (req, res) => {
    res.send('Gym API is running');
})

//start server
const port = process.env.PORT || 4000;

if (require.main === module) {
    app.listen(port, '', () => {
        console.log(`Server listening on port ${port}`);
    });
}


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

module.exports = app;
