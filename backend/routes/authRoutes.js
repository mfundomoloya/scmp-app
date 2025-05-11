const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { register, verifyEmail, login, forgotPassword, resetPassword, getMe } = require('../controllers/authController');

router.post('/register', register);
router.get('/verify-email', verifyEmail);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected route
router.get('/me', protect, getMe);

module.exports = router;