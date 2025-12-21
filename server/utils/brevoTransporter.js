const SibApiV3Sdk = require('sib-api-v3-sdk');
const dotenv = require('dotenv');

dotenv.config();

// --------------------------------------------------
// Initialize Brevo REST client
// --------------------------------------------------
const defaultClient = SibApiV3Sdk.ApiClient.instance;
defaultClient.defaultHeaders['accept'] = 'application/json';
defaultClient.defaultHeaders['content-type'] = 'application/json';


// // REQUIRED headers for Brevo
// defaultClient.defaultHeaders['accept'] = 'application/json';
// defaultClient.defaultHeaders['content-type'] = 'application/json';

// API Key
const apiKeyAuth = defaultClient.authentications['api-key'];
apiKeyAuth.apiKey = process.env.BREVO_API_KEY;

// API instance
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// --------------------------------------------------
// Nodemailer-like transporter (REST based)
// --------------------------------------------------
const transporter = {
  sendMail: async (mailOptions) => {
    try {
      // ---------- SAFETY CHECKS ----------
      if (!process.env.BREVO_API_KEY) {
        console.error('❌ Brevo Error: Missing BREVO_API_KEY');
        return;
      }

      if (!process.env.BREVO_USER) {
        console.error('❌ Brevo Error: Missing BREVO_USER');
        return;
      }

      if (!mailOptions?.to || typeof mailOptions.to !== 'string') {
        console.error('❌ Brevo Error: Invalid recipient:', mailOptions.to);
        return;
      }

      if (!mailOptions.subject) {
        console.error('❌ Brevo Error: Missing subject');
        return;
      }

      // ---------- CONTENT FALLBACK ----------
      const fallbackText =
        mailOptions.text ||
        (mailOptions.html
          ? mailOptions.html.replace(/<[^>]*>/g, '')
          : 'Order update from Nutry Health');

      // ---------- BUILD EMAIL ----------
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

      sendSmtpEmail.sender = {
        name: 'Nutry Health',
        email: process.env.BREVO_USER, // MUST be verified in Brevo
      };

      sendSmtpEmail.to = [{ email: mailOptions.to }];
      sendSmtpEmail.subject = mailOptions.subject;
      sendSmtpEmail.textContent = fallbackText;
      sendSmtpEmail.htmlContent =
        mailOptions.html || `<p>${fallbackText}</p>`;

      // ---------- SEND ----------
      await apiInstance.sendTransacEmail(sendSmtpEmail);

      console.log('✅ Email sent via Brevo REST to:', mailOptions.to);
    } catch (err) {
      console.error(
        '❌ Brevo REST Error:',
        err.response?.body || err.message
      );
    }
  },
};

module.exports = transporter;
