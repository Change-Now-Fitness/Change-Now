
//connect to postgress with pg
const { Pool } = require('pg');
//connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = pool