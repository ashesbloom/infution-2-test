const express = require('express');
const router = express.Router();
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { protect, admin } = require('../middleware/authMiddleware');
const nodemailer = require('nodemailer');

// ---------- EMAIL SETUP (GMAIL) ----------
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // your gmail
    pass: process.env.EMAIL_PASS, // app password
  },
});

// optional: check connection on server start
transporter.verify((err, success) => {
  if (err) {
    console.log('❌ Email error:', err.message);
  } else {
    console.log('✅ Email service ready');
  }
});

// change sender display name here
const EMAIL_FROM = `"Infused Nutrition" <${process.env.EMAIL_USER}>`;

// ---------- EMAIL HELPERS ----------

const sendLoginAlert = async (email, name) => {
  const text = `Hello ${name},

We detected a new login to your Infused Nutrition account.
If this was not you, please change your password immediately.
`;

  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color:#eab308;">New Login Detected</h2>
    <p>Hello ${name},</p>
    <p>We detected a new login to your Infused Nutrition account just now.</p>
    <p>If this was not you, please reset your password immediately.</p>
    <p style="font-size:12px; color:#666;">– Infused Nutrition Security Team</p>
  </div>
  `;

  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: email,
      subject: 'New Login Detected - Infused Nutrition',
      text,
      html,
    });
    console.log('📩 Login alert sent to', email);
  } catch (error) {
    console.error('❌ Login email failed:', error.message);
    // do NOT throw – email failure must not break login
  }
};

const sendWelcomeEmail = async (email, name) => {
  const text = `Hello ${name},

Welcome to Infused Nutrition! Your account has been created successfully.
`;

  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color:#eab308;">Welcome to Infused Nutrition, ${name}! 🎉</h2>
    <p>We're excited to have you on board.</p>
    <p>You can now log in and start exploring our products.</p>
    <p style="font-size:12px; color:#666;">– Infused Nutrition Supplements Store</p>
  </div>
  `;

  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: email,
      subject: 'Welcome to Infused!',
      text,
      html,
    });
    console.log('📩 Welcome email sent to', email);
  } catch (error) {
    console.error('❌ Welcome email failed:', error.message);
    // do NOT throw – email failure must not break register
  }
};

// NEW: email when password is reset
const sendPasswordResetEmail = async (email, name) => {
  const text = `Hello ${name},

This is a confirmation that your Infused Nutrition account password has just been changed.
If you did not request this change, please contact support immediately.
`;

  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color:#eab308;">Your Password Was Changed</h2>
    <p>Hello ${name},</p>
    <p>This is a confirmation that the password for your Infused Nutrition account has just been changed.</p>
    <p>If this was not you, please contact support immediately.</p>
    <p style="font-size:12px; color:#666;">– Infused Nutrition Security Team</p>
  </div>
  `;

  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: email,
      subject: 'Your Infused password was changed',
      text,
      html,
    });
    console.log('📩 Password reset email sent to', email);
  } catch (error) {
    console.error('❌ Password reset email failed:', error.message);
    // don't break reset if email fails
  }
};

// ---------- ROUTES ----------

// @desc    Auth user & get token (LOGIN)
// @route   POST /api/users/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // fire and forget login alert
      sendLoginAlert(user.email, user.name);

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        hideAdminTokenCard: user.hideAdminTokenCard, // ⭐ send to frontend
        token: generateToken(user._id),
      });
    }

    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      message: err.message || 'Server error during login',
    });
  }
});

// @desc    Register a new user
// @route   POST /api/users
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      securityQuestion,
      securityAnswer,
    } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Name, email and password are required' });
    }

    // same rule as your frontend
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          'Password must contain at least 1 Uppercase letter, 1 Number, and 1 Special Character (!@#$%^&*)',
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,          // plain -> model hash
      securityQuestion,  // plain
      securityAnswer,    // plain -> model hash
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid user data' });
    }

    // fire and forget welcome email
    sendWelcomeEmail(user.email, user.name);

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      hideAdminTokenCard: user.hideAdminTokenCard, // ⭐ include here too
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({
      message: err.message || 'Server error during registration',
    });
  }
});

// ========= 🔐 FORGOT PASSWORD (SECURITY QUESTION) ROUTES =========

// @desc    Get security question by email
// @route   POST /api/users/security-question
// @access  Public
router.post('/security-question', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email }).lean();

    if (!user || !user.securityQuestion) {
      return res
        .status(404)
        .json({ message: 'No account or security question found.' });
    }

    // Only send the question
    return res.json({ securityQuestion: user.securityQuestion });
  } catch (err) {
    console.error('Security question error:', err);
    return res.status(500).json({
      message: err.message || 'Server error fetching security question',
    });
  }
});

// @desc    Reset password using security question
// @route   POST /api/users/reset-password-security
// @access  Public
router.post('/reset-password-security', async (req, res) => {
  const { email, securityAnswer, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !user.securityAnswer) {
      return res
        .status(400)
        .json({ message: 'Invalid email or security details.' });
    }

    // check answer using model method
    const answerOk = await user.matchSecurityAnswer(securityAnswer);
    if (!answerOk) {
      return res.status(400).json({ message: 'Incorrect security answer.' });
    }

    // backend password validation (extra safety)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;
    if (!password || !passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          'Password must contain at least 1 Uppercase letter, 1 Number, and 1 Special Character (!@#$%^&*)',
      });
    }

    // update password (plain, hook will hash)
    user.password = password;

    await user.save();

    // Send confirmation email (non-blocking)
    sendPasswordResetEmail(user.email, user.name);

    return res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error('Reset password (security) error:', err);
    return res.status(500).json({
      message: err.message || 'Server error during password reset',
    });
  }
});

// ====== ⭐ PROFILE ROUTES (ADD / EDIT PROFILE) ⭐ ======

// @desc    Get logged-in user's profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      shippingAddress: user.shippingAddress || {},
    });
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({
      message: err.message || 'Server error fetching profile',
    });
  }
});

// @desc    Update logged-in user's profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // basic info
    if (req.body.name) user.name = req.body.name;
    // we’re not changing email here for safety

    // address
    if (req.body.shippingAddress) {
      user.shippingAddress = {
        ...(user.shippingAddress || {}),
        ...req.body.shippingAddress,
      };
    }

    const updatedUser = await user.save();

    return res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      shippingAddress: updatedUser.shippingAddress || {},
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({
      message: err.message || 'Server error updating profile',
    });
  }
});

// ====== ADMIN USER ROUTES ======

// @desc    Get all users (Admin only)
// @route   GET /api/users
router.get('/', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password -securityAnswer');
    return res.json(users);
  } catch (err) {
    console.error('Get users error:', err);
    return res.status(500).json({
      message: err.message || 'Server error fetching users',
    });
  }
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: 'You cannot delete your own account' });
    }

    await user.deleteOne();
    return res.json({ message: 'User removed' });
  } catch (err) {
    console.error('Delete user error:', err);
    return res.status(500).json({
      message: err.message || 'Server error deleting user',
    });
  }
});

module.exports = router;
