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
  connectionTimeout: 20000, // 20 seconds
  greetingTimeout: 20000,
  socketTimeout: 20000,
  logger: true, // log to console
  debug: true, // include SMTP traffic in logs
});

// Verify connection configuration once on startup
transporter.verify((err, success) => {
  if (err) {
    console.error('❌ Email Service Error:', err);
    console.error('👉 Hint: Check if EMAIL_USER/PASS are correct in Render Dashboard.');
    console.error('👉 Hint: Check if "Less Secure Apps" is ON or use App Password.');
  } else {
    console.log('✅ Email Service Ready');
  }
});

module.exports = transporter;
