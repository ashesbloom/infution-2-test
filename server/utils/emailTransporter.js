const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const WEB3FORMS_API_KEY = process.env.WEB3FORMS_ACCESS_KEY;

const sendMail = async ({ to, subject, text, html }) => {
  if (!WEB3FORMS_API_KEY) {
    console.error('❌ Web3Forms Error: Missing WEB3FORMS_ACCESS_KEY in env');
    return;
  }

  try {
    const response = await axios.post('https://api.web3forms.com/submit', {
      access_key: WEB3FORMS_API_KEY,
      email: to, // The user's email (Web3Forms will send the email TO this address if configured, or just notify you)
      subject: subject,
      message: text || 'No plain text message',
      html_message: html, // Web3Forms supports HTML content
      from_name: 'Infused Nutrition',
    });

    if (response.data.success) {
      console.log('✅ Email sent via Web3Forms to:', to);
      return true;
    } else {
      console.error('❌ Web3Forms API Error:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Web3Forms Network Error:', error.message);
    return false;
  }
};

// Mock transporter object to maintain compatibility with existing code
const transporter = {
  sendMail: async (mailOptions) => {
    // Adapt nodemailer options to Web3Forms
    return sendMail({
      to: mailOptions.to,
      subject: mailOptions.subject,
      text: mailOptions.text,
      html: mailOptions.html,
    });
  },
  verify: (callback) => {
    if (WEB3FORMS_API_KEY) {
      console.log('✅ Web3Forms Service Ready');
      if (callback) callback(null, true);
    } else {
      const err = new Error('Missing WEB3FORMS_ACCESS_KEY');
      console.error('❌ Web3Forms Error:', err.message);
      if (callback) callback(err, false);
    }
  },
};

module.exports = transporter;
