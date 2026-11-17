// Starts the Express server.
// Routes for sign up / log in get added here in the next steps.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const pool = require('./db/pool');

const app = express();
app.use(express.json()); // lets Express read JSON sent from the React app

// Health check: shows the server is running and can reach the database
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'not connected' });
  }
});

// Only start listening when this file is run directly (tests import app instead)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;

  // Create the tables from schema.sql first (IF NOT EXISTS means it's safe to run every time)
  const schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
  pool.query(schema)
    .then(() => {
      console.log('Database tables are ready');
      app.listen(PORT, () => console.log(`Club Hub server running on http://localhost:${PORT}`));
    })
    .catch((err) => {
      console.error('Could not set up the database:', err.message);
      process.exit(1);
    });
}

module.exports = app;
