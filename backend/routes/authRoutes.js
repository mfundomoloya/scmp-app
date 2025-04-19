const express = require('express');
const router = express.Router();
const { register, verifyEmail, login, forgotPassword, resetPassword } = require('../controllers/authController');

router.post('/register', register);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;