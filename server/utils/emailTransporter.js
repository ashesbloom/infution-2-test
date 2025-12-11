const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Brevo (Sendinblue) SMTP - Reliable for cloud platforms, no domain verification needed
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
});

// Verify once on startup
transporter.verify((err, success) => {
  if (err) {
    console.error('❌ Brevo SMTP Error:', err.message);
  } else {
    console.log('✅ Brevo SMTP Ready');
  }
});

module.exports = transporter;
