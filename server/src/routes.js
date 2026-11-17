// All the API routes in one place. Each URL points to a controller function.
const express = require('express');
const authController = require('./controllers/authController');
const { requireAuth } = require('./middleware/auth');

const router = express.Router();

// Express 4 doesn't catch errors from async functions, so this passes them to the error handler
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

// CH1: accounts
router.post('/auth/signup', wrap(authController.signup));
router.post('/auth/login', wrap(authController.login));
router.get('/auth/me', requireAuth, wrap(authController.me));

module.exports = router;
