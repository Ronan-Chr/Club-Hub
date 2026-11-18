// Starts the Express server.
// Connects the routes, creates the database tables, then listens on port 3000.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const pool = require('./db/pool');
const routes = require('./routes');

const app = express();
app.disable('x-powered-by'); // don't advertise that the server runs Express
app.use(express.json({ limit: '10kb' })); // reads JSON from the React app, and rejects huge requests

// Health check: shows the server is running and can reach the database
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'not connected' });
  }
});

// All the Club Hub API routes live under /api (see routes.js)
app.use('/api', routes);

// In production one server does everything: it also sends the built React app (client/dist)
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get(/^\/(?!api).*/, (req, res) => res.sendFile(path.join(clientDist, 'index.html')));

// Error handler: if anything unexpected breaks, send a simple message instead of crashing
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'The request data was not valid JSON.' });
  }
  if (err.code === '23505') {
    // PostgreSQL "unique violation", e.g. two sign ups with the same email at the same moment
    return res.status(409).json({ error: 'An account with that email already exists.' });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

// Only start listening when this file is run directly (tests import app instead)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;

  // Refuse to start without the secrets, so the app never runs insecurely by accident
  if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
    console.error('DATABASE_URL and JWT_SECRET must be set in the .env file.');
    process.exit(1);
  }

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
