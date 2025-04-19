const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Configure nodemailer for Gmail
console.log('Nodemailer config:', {
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS ? '[REDACTED]' : undefined,
});
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    ciphers: 'SSLv3',
  },
});

// Verify transporter
transporter.verify((err, success) => {
  if (err) {
    console.error('SMTP verify error:', err);
  } else {
    console.log('SMTP server ready');
  }
});

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, role } = req.body;

  try {
    console.log('Registering user:', { name, email, role });

    // Check if email exists
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({ msg: 'This email is already registered' });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    console.log('Generated verification token:', verificationToken);

    // Create new user
    user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role,
      verificationToken,
    });
    await user.save();
    console.log('User saved with token:', user.verificationToken);

    // Verify user in DB
    const savedUser = await User.findOne({ email: email.toLowerCase() });
    console.log('Verified user in DB:', {
      email: savedUser.email,
      verificationToken: savedUser.verificationToken,
      tokenLength: savedUser.verificationToken?.length,
    });

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    console.log('Verification URL:', verificationUrl);
    try {
      await transporter.sendMail({
        from: `"Smart Campus" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify Your Email',
        html: `
          <h2>Welcome, ${name}!</h2>
          <p>Please verify your email by clicking the link below:</p>
          <a href="${verificationUrl}">Verify Email</a>
          <p>Raw link: ${verificationUrl}</p>
          <p>If you did not register, ignore this email.</p>
        `,
      });
      console.log('Verification email sent to:', email);
      res.json({ msg: 'Registration successful. Please check your email to verify your account.' });
    } catch (emailErr) {
      console.error('Email sending error:', emailErr);
      res.json({
        msg: 'Registration successful, but failed to send verification email. Please check your email later or request a new verification link.',
        verificationToken,
      });
    }
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    console.log('Logging in user:', { email });

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    console.log('User found for login:', { email: user.email, isVerified: user.isVerified });

    // Check if verified
    if (!user.isVerified) {
      return res.status(400).json({ msg: 'Please verify your email before logging in' });
    }

    // Verify password
    console.log('Checking password for:', user.email);
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate JWT
    const payload = { user: { id: user._id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    console.log('Login response sent:', { token, user: { id: user._id, name: user.name, email, role: user.role } });
    res.json({ token, user: { id: user._id, name: user.name, email, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    console.log('Verifying token:', { token, length: token.length });

    // Find user by token
    const user = await User.findOne({ verificationToken: token });
    console.log('User found by token:', user ? { email: user.email, storedToken: user.verificationToken, isVerified: user.isVerified } : null);

    if (!user) {
      // Log all users with tokens for debugging
      const allUsers = await User.find({ verificationToken: { $exists: true } }).select('email verificationToken');
      console.log('All users with tokens:', allUsers);
      return res.status(400).json({ msg: 'Invalid or expired verification token' });
    }

    // If user is already verified, return success
    if (user.isVerified) {
      console.log('User already verified:', user.email);
      return res.json({ msg: 'Email already verified. You can now log in.' });
    }

    // Verify user
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    console.log('User verified:', user.email);

    res.json({ msg: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    console.log('Password reset requested for:', { email });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ msg: 'No account found with this email' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    console.log('Reset token saved:', { email, resetToken });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    console.log('Reset URL:', resetUrl);

    await transporter.sendMail({
      from: `"Smart Campus" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Password',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>Raw link: ${resetUrl}</p>
        <p>This link expires in 1 hour. If you did not request a reset, ignore this email.</p>
      `,
    });
    console.log('Reset email sent to:', email);

    res.json({ msg: 'Password reset link sent to your email' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { token } = req.params;
  const { password } = req.body;

  try {
    console.log('Resetting password with token:', { token });

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    console.log('Password reset for:', user.email);

    res.json({ msg: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { register, login, verifyEmail, forgotPassword, resetPassword }; 