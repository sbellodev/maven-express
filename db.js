const { Pool } = require('pg');
require('dotenv').config();

let pool;

if (process.env.NODE_ENV && process.env.NODE_ENV != 'localhost') {
  // Use the DATABASE_URL environment variable provided by your hosting platform (e.g., Render.com)
  
    pool = new Pool({
    user: process.env.DATABASE_USERNAME_PROD,
    host: process.env.DATABASE_HOST_PROD,
    database: process.env.DATABASE_NAME_PROD,
    password: process.env.DATABASE_PASS_PROD,
    port: process.env.DATABASE_PORT_PROD,
    ssl: { rejectUnauthorized: false }, // Only if your hosting platform requires it
  });
  console.log(pool)
  console.log(process.env.DATABASE_PORT_PROD)
} else {
  // Use local development configuration
  pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
  });
  console.log(pool)
  console.log(process.env.DB_USER)
}


module.exports = {
  query: (text, params) => pool.query(text, params),
};