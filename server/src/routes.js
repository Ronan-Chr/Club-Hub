// All the API routes in one place. Each URL points to a controller function.
const express = require('express');
const authController = require('./controllers/authController');
const clubController = require('./controllers/clubController');
const { requireAuth } = require('./middleware/auth');

const router = express.Router();

// Express 4 doesn't catch errors from async functions, so this passes them to the error handler
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

// CH1: accounts
router.post('/auth/signup', wrap(authController.signup));
router.post('/auth/login', wrap(authController.login));
router.get('/auth/me', requireAuth, wrap(authController.me));

// CH2 and CH4: clubs
router.get('/clubs', wrap(clubController.list));
router.get('/clubs/:id', wrap(clubController.get));
router.post('/clubs', requireAuth, wrap(clubController.create));

// CH3: join and leave
router.post('/clubs/:id/join', requireAuth, wrap(clubController.join));
router.post('/clubs/:id/leave', requireAuth, wrap(clubController.leave));
router.get('/me/clubs', requireAuth, wrap(clubController.myClubs));

module.exports = router;
