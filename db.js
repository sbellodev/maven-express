const { Pool } = require('pg');
require('dotenv').config();

let pool;

if (process.env.NODE_ENV && process.env.NODE_ENV != 'localhost') {
  // Use the DATABASE_URL environment variable provided by your hosting platform (e.g., Render.com)
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Only if your hosting platform requires it
  });
} else {
  // Use local development configuration
  pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
  });
}


module.exports = {
  query: (text, params) => pool.query(text, params),
};