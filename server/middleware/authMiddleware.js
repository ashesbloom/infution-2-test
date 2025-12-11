require('dotenv').config();
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// Authenticate user
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      console.log('JWT VERIFY ERROR:', error.message);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  res.status(401);
  throw new Error('Not authorized, no token');
});

// Allow only admin users
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) return next();

  res.status(403);
  throw new Error('Not authorized as an Admin');
};

module.exports = { protect, admin };
