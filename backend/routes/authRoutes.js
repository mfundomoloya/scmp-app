const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { register, verifyEmail, login, forgotPassword, resetPassword, getMe } = require('../controllers/authController');

router.post('/register', register);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', login);
router.get('/me', auth, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;