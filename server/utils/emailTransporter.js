const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Use explicit host/port for better reliability in production
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Increase connection timeout to handle network latency
  connectionTimeout: 10000, 
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// Verify connection configuration once on startup
transporter.verify((err, success) => {
  if (err) {
    console.error('❌ Email Service Error:', err.message);
  } else {
    console.log('✅ Email Service Ready');
  }
});

module.exports = transporter;
