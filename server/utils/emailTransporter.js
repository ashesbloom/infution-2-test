const { Resend } = require('resend');
const dotenv = require('dotenv');

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

// Mock transporter object to maintain compatibility with existing nodemailer-style code
const transporter = {
  sendMail: async (mailOptions) => {
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ Resend Error: Missing RESEND_API_KEY in env');
      return false;
    }

    try {
      const { data, error } = await resend.emails.send({
        from: 'Infused Nutrition <onboarding@resend.dev>', // Use your verified domain in production
        to: mailOptions.to,
        subject: mailOptions.subject,
        text: mailOptions.text,
        html: mailOptions.html,
      });

      if (error) {
        console.error('❌ Resend API Error:', error);
        return false;
      }

      console.log('✅ Email sent via Resend to:', mailOptions.to, 'ID:', data.id);
      return true;
    } catch (error) {
      console.error('❌ Resend Network Error:', error.message);
      return false;
    }
  },
  verify: (callback) => {
    if (process.env.RESEND_API_KEY) {
      console.log('✅ Resend Email Service Ready');
      if (callback) callback(null, true);
    } else {
      const err = new Error('Missing RESEND_API_KEY');
      console.error('❌ Resend Error:', err.message);
      if (callback) callback(err, false);
    }
  },
};

module.exports = transporter;
