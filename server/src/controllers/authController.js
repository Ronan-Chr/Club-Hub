// Auth controller (the "C" in MVC) for CH1: sign up and log in.
// It checks the input, uses the user model to read/write the database,
// and sends back a JSON response with the right status code.
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

// Make a login token that says "this is user #id" and expires in 7 days
function makeToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/signup
async function signup(req, res) {
  const name = (req.body.name || '').trim();
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';

  // Input checks (error handling for bad input)
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are all required.' });
  }
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Please enter a valid email.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  // CH1 acceptance criteria: signing up with an email that already has an account shows an error
  const existing = await userModel.findByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with that email already exists.' });
  }

  // Hash the password before saving it, so the real password is never stored
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userModel.createUser(name, email, passwordHash);

  res.status(201).json({ user, token: makeToken(user.id) });
}

// POST /api/auth/login
async function login(req, res) {
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = await userModel.findByEmail(email);
  const passwordMatches = user && (await bcrypt.compare(password, user.password_hash));

  // Same message for a wrong email or wrong password, so nobody can tell which emails have accounts
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Wrong email or password.' });
  }

  res.json({
    user: { id: user.id, name: user.name, email: user.email },
    token: makeToken(user.id),
  });
}

// GET /api/auth/me  (needs a login token)
async function me(req, res) {
  const user = await userModel.findById(req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  res.json({ user });
}

module.exports = { signup, login, me };
