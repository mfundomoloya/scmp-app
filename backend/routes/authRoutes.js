const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    console.log('Register request:', { name, email, role });

    // Validate input
    if (!name || !email || !password || !role) {
      return res.status(400).json({ msg: 'All fields are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ msg: 'Invalid email format' });
    }
    if (password.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters' });
    }
    if (!['student', 'lecturer', 'admin'].includes(role)) {
      return res.status(400).json({ msg: 'Invalid role' });
    }

    // Check for existing user
    console.log('Checking for existing user:', email);
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create new user
    console.log('Creating new user');
    user = new User({
      name,
      email,
      password,
      role,
      isVerified: false,
      verificationToken,
    });

    // Save user
    console.log('Saving user to MongoDB');
    await user.save();
    console.log('User saved:', user);

    // Send verification email
    const verificationUrl = `http://localhost:5173/verify-email/${verificationToken}`;
    const emailHtml = `
      <h1>Welcome to Smart Campus Portal</h1>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>If you didn’t register, ignore this email.</p>
    `;
    await sendEmail(email, 'Verify Your Email', emailHtml);

    // Generate JWT
    console.log('Generating JWT');
    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Return response
    res.json({
      token,
      user: { id: user.id, name, email, role, isVerified: user.isVerified },
    });
  } catch (err) {
    console.error('Registration error:', {
      message: err.message,
      stack: err.stack,
      code: err.code,
    });
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ msg: 'Email verified successfully' });
  } catch (err) {
    console.error('Verification error:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;