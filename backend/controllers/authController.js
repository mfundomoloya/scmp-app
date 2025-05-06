const User = require('../models/User');
  const jwt = require('jsonwebtoken');
  const { validationResult } = require('express-validator');
  const nodemailer = require('nodemailer');
  const crypto = require('crypto');
  const bcrypt = require('bcryptjs');

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

  const computeInitials = (firstName, lastName) => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  };

  const register = async (req, res) => {
    try {
      console.log('Register: req.body:', JSON.stringify(req.body, null, 2));
      const { firstName, lastName, email, password, role } = req.body;

      if (!firstName || !lastName || !email || !password) {
        console.error('Register: Missing required fields');
        return res.status(400).json({ msg: 'All fields are required' });
      }

      let user = await User.findOne({ email });
      if (user) {
        console.error('Register: User already exists');
        return res.status(400).json({ msg: 'User already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: role || 'student',
        initials: computeInitials(firstName, lastName),
      });

      await user.save();
      console.log('Register: User created:', JSON.stringify(user, null, 2));

      const payload = {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          initials: user.initials,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error('Error registering user:', err);
      res.status(500).json({ msg: 'Server error' });
    }
  };

  const login = async (req, res) => {
    try {
      console.log('Login: req.body:', JSON.stringify(req.body, null, 2));
      const { email, password } = req.body;

      if (!email || !password) {
        console.error('Login: Missing required fields');
        return res.status(400).json({ msg: 'All fields are required' });
      }

      const user = await User.findOne({ email });
      if (!user) {
        console.error('Login: Invalid credentials');
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.error('Login: Invalid credentials');
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      const payload = {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          initials: user.initials,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error('Error logging in:', err);
      res.status(500).json({ msg: 'Server error' });
    }
  };


  const getMe = async (req, res) => {
    try {
      console.log('Fetching user:', { userId: req.user.id });
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
      res.json({ id: user._id.toString(), name: user.name, email: user.email, role: user.role });
    } catch (err) {
      console.error('Get user error:', err);
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

  module.exports = { register, login, verifyEmail, forgotPassword, resetPassword, getMe };