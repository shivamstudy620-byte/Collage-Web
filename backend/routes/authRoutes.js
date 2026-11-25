const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/auth');

// Brute-force protection on login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login attempts per window
  message: { message: 'Too many login attempts from this IP. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

router.post('/login', loginLimiter, authController.login);
router.post('/change-password', verifyToken, authController.changePassword);
router.get('/me', verifyToken, authController.getMe);

module.exports = router;
