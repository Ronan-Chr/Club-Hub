// Database connection (part of the Model layer in MVC).
// One shared "pool" of connections to PostgreSQL that every model uses.
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Render's database requires an encrypted (SSL) connection
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;
