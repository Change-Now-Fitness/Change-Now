require('dotenv').config();
const express = require('express');
const authRouter = require("./routes/auth");
const exerciseRoutes = require("./routes/exerciseRoutes");
const workoutRouter = require("./routes/workouts");
const userRouter = require("./routes/user");
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
//my browser requires whitelisted address if api and frontend addresses are different
const cors = require("cors");

//start server
const port = process.env.PORT || 4000;

const isPrivateHostname = (hostname) =>
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname);

const corsOptions = {
    origin(origin, callback) {
        if (!origin) {
            callback(null, true);
            return;
        }

        try {
            const parsedOrigin = new URL(origin);
            if (parsedOrigin.protocol === "http:" && isPrivateHostname(parsedOrigin.hostname)) {
                callback(null, true);
                return;
            }
        } catch  {
            console.log(`Invalid CORS origin: ${origin}`);
        }

        callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true,
}
app.use(cors({
    ...corsOptions
}));

;

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Change Now API Docs', 
            version: '5.10.26'
        },
        servers: [
            {
                url : 'http://localhost:4000',
                 description: 'Dev Server'
                }
            ],
    },
        apis: ['routes/auth.js', 'routes/user.js'],
};

const swaggerSpecifications = swaggerJsdoc(swaggerOptions);

app.use(express.json());

app.use('/api-docs',
    swaggerUi.serve, 
    swaggerUi.setup(swaggerSpecifications, {explorer: true})
);

app.use("/auth", authRouter);
app.use("/user", userRouter);
// Exercise routes are scaffolded separately so the frontend can move to a real
// API contract without changing its object shape later.
app.use("/exercises", exerciseRoutes);

app.use("/workouts", workoutRouter)


//test route
app.get('/', (req, res) => {
    res.send('Gym API is running');
})


if (require.main === module) {
    app.listen(port, '', () => {
        console.log(`Server listening on port ${port}`);
    });
}


module.exports = app;
