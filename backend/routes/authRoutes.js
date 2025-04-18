const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Validate input
    if (!name || !email || !password || !role) {
      return res.status(400).json({ msg: 'All fields are required' });
    }
    if (!['student', 'lecturer', 'admin'].includes(role)) {
      return res.status(400).json({ msg: 'Invalid role' });
    }

    // Check for existing user
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    // Create new user
    user = new User({ name, email, password, role });
    await user.save();

    // Generate JWT
    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Return token and user data
    res.json({
      token,
      user: { id: user.id, name, email, role }
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;