// Auth middleware: runs before protected routes.
// Checks the login token (JWT) sent by the React app and finds out who the user is.
const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''; // looks like "Bearer <token>"
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Please log in first.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId; // controllers can now use req.userId
    next();
  } catch (err) {
    res.status(401).json({ error: 'Your session expired. Please log in again.' });
  }
}

module.exports = { requireAuth };
