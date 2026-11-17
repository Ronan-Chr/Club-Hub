// User model (the "M" in MVC).
// All the SQL for the users table lives here, so controllers never write SQL themselves.
// $1, $2, $3 are placeholders: pg fills them in safely, which prevents SQL injection.
const pool = require('../db/pool');

// Save a new user and return their public info (never the password hash)
async function createUser(name, email, passwordHash) {
  const result = await pool.query(
    'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
    [name, email, passwordHash]
  );
  return result.rows[0];
}

// Find a user by email (used for log in and to check for duplicate sign ups)
async function findByEmail(email) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0]; // undefined if no user has that email
}

// Find a user by id (used to get the logged-in user from their login token)
async function findById(id) {
  const result = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

module.exports = { createUser, findByEmail, findById };
