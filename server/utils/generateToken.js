const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  // We use the User's ID as the unique identifier inside the token
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // The token is valid for 30 days
  });
};

module.exports = generateToken;