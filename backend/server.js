/**
 * Backend HTTP server entrypoint.
 *
 * Responsibilities:
 * - Loads runtime config (env, CORS, proxy settings)
 * - Mounts API routers (auth/user/exercises/workouts)
 * - Serves OpenAPI docs at `/api-docs`
 * - Provides simple health/readiness endpoints used by deploy tooling and ops
 * x
 */
require('dotenv').config();

const express = require('express');
const authRouter = require("./routes/auth");
const exerciseRoutes = require("./routes/exerciseRoutes");
const workoutRouter = require("./routes/workouts");
const userRouter = require("./routes/user");
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const pool = require('./dbconnection');
const {
    assertValidRuntimeConfig,
    configuredCorsOrigins,
    getRuntimeConfigIssues,
    getCorsOptions,
    getPublicApiUrl,
    shouldTrustProxy,
} = require("./config/runtime");

const app = express();
const cors = require("cors");

//start server
const port = process.env.PORT || 4000;
const host = process.env.HOST || '0.0.0.0';
const publicApiUrl = getPublicApiUrl(port);
const corsOptions = getCorsOptions();
const { warnings: runtimeWarnings } = getRuntimeConfigIssues();

assertValidRuntimeConfig();

app.disable("x-powered-by");
if (shouldTrustProxy) {
    app.set("trust proxy", 1);
}

app.use(cors(corsOptions));

for (const warning of runtimeWarnings) {
    console.warn(`Runtime configuration warning: ${warning}`);
}

const mountApiRouter = (basePath, router) => {
    app.use(basePath, router);
    app.use(`/api${basePath}`, router);
};

/**
 * Swagger/OpenAPI generator configuration.
 *
 * We scan the backend codebase for `@openapi` blocks so route docs can live
 * next to the handlers/middleware that enforce behavior.
 */
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Change Now API Docs', 
            version: '5.10.26'
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                },
                cookieAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "token",
                },
            },
        },
        servers: [
            {
                url: publicApiUrl,
                description: process.env.NODE_ENV === "production" ? "Production Server" : "Configured API Server"
            }
        ],
    },
    apis: [
        './server.js',
        './routes/**/*.js',
        './controllers/**/*.js',
        './middleware/**/*.js',
        './services/**/*.js',
        './config/**/*.js',
    ],
};
swaggerOptions.apis.push('./server.js');

const swaggerSpecifications = swaggerJsdoc(swaggerOptions);

app.use(express.json());

app.use('/api-docs',
    swaggerUi.serve, 
    swaggerUi.setup(swaggerSpecifications, {explorer: true})
);

mountApiRouter("/auth", authRouter);
mountApiRouter("/user", userRouter);
// Exercise routes are scaffolded separately so the frontend can move to a real
// API contract without changing its object shape later.
app.use("/exercises", exerciseRoutes);

app.use("/workouts", workoutRouter)


/**
 * @openapi
 * /:
 *   get:
 *     summary: Get API metadata and route aliases
 *     tags: [Meta]
 *     responses:
 *       '200':
 *         description: Backend metadata
 */
app.get('/', (req, res) => {
    res.json({
        name: "ChangeNow API",
        status: "ok",
        docs: "/api-docs",
        health: "/health",
        ready: "/ready",
        publicApiUrl,
        allowedCorsOrigins: configuredCorsOrigins,
        routeAliases: {
            auth: ["/auth", "/api/auth"],
            user: ["/user", "/api/user"],
            exercises: ["/exercises", "/api/exercises"],
            workouts: ["/workouts", "/api/workouts"],
        },
    });
});

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Check whether the backend process is healthy
 *     tags: [Meta]
 *     description: Also available at `/api/health`.
 *     responses:
 *       '200':
 *         description: Service health information
 */
app.get(['/health', '/api/health'], (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "backend",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.round(process.uptime()),
    });
});

/**
 * @openapi
 * /ready:
 *   get:
 *     summary: Readiness check (includes database connectivity)
 *     tags: [Meta]
 *     responses:
 *       '200':
 *         description: Service and database are ready
 *       '503':
 *         description: Database unavailable
 * /api/ready:
 *   get:
 *     summary: Readiness check (aliased)
 *     tags: [Meta]
 *     responses:
 *       '200':
 *         description: Service and database are ready
 *       '503':
 *         description: Database unavailable
 */
app.get(['/ready', '/api/ready'], async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.status(200).json({
            status: "ok",
            service: "backend",
            database: "ok",
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Readiness check failed:', error);
        res.status(503).json({
            status: "error",
            service: "backend",
            database: "unavailable",
            timestamp: new Date().toISOString(),
        });
    }
});



if (require.main === module) {
    app.listen(port, host, () => {
        console.log(`Server listening on ${host}:${port}`);
        console.log(`Public API URL: ${publicApiUrl}`);
    });
}


module.exports = app;
