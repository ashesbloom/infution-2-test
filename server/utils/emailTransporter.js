const SibApiV3Sdk = require('sib-api-v3-sdk');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Brevo API client
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Mock transporter object to maintain compatibility with existing nodemailer-style code
const transporter = {
  sendMail: async (mailOptions) => {
    if (!process.env.BREVO_API_KEY) {
      console.error('❌ Brevo Error: Missing BREVO_API_KEY in env');
      return false;
    }

    try {
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendSmtpEmail.sender = { name: 'Nutry Health', email: process.env.BREVO_USER };
      sendSmtpEmail.to = [{ email: mailOptions.to }];
      sendSmtpEmail.subject = mailOptions.subject;
      sendSmtpEmail.textContent = mailOptions.text || '';
      sendSmtpEmail.htmlContent = mailOptions.html || mailOptions.text || '';

      const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('✅ Email sent via Brevo API to:', mailOptions.to);
      return true;
    } catch (error) {
      console.error('❌ Brevo API Error:', error.message || error);
      return false;
    }
  },
  verify: (callback) => {
    if (process.env.BREVO_API_KEY) {
      console.log('✅ Brevo API Ready');
      if (callback) callback(null, true);
    } else {
      const err = new Error('Missing BREVO_API_KEY');
      console.error('❌ Brevo Error:', err.message);
      if (callback) callback(err, false);
    }
  },
};

module.exports = transporter;
