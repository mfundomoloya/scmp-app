const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;

const generateToken = (user, expiresIn = '1d') => {
  return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn });
};

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role,
      verificationToken,
      displayName: `${firstName} ${lastName}`,
      initials: `${firstName[0]}${lastName[0]}`.toUpperCase()
    });

    await user.save();

    const verifyLink = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendEmail(email, 'Verify your email', `Click here to verify your email: ${verifyLink}`);

    res.status(201).json({ message: 'User registered. Please verify your email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed' });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;  // Use req.query to get the token from the URL

    // Check if the token is valid
    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    // Mark the user as verified and remove the verification token
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Verification failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email first' });
    }

    const token = generateToken(user);
    res.status(200).json({
      token,
      user: {
        id: user._id,
        displayName: user.displayName,
        role: user.role,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail(email, 'Reset your password', `Click here to reset your password: ${resetLink}`);

    res.status(200).json({ message: 'Password reset link sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not initiate password reset' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Reset failed' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not retrieve user' });
  }
};

module.exports = { register, login, verifyEmail, forgotPassword, resetPassword, getMe };
