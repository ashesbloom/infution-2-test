const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// POST /api/connect  { name, email, subject, message }
router.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // ----- Mail to YOU (admin) -----
    const adminMail = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: subject ? `INFUSED Contact: ${subject}` : "New INFUSED Message",
      text: `
A new message was submitted on the INFUSED site:

Name: ${name || "Not provided"}
Email: ${email}

Subject: ${subject || "No subject"}

Message:
${message || "No message provided"}

-------------------------------------
Sent automatically from INFUSED Website
      `,
    };

    // ----- Auto-reply to USER -----
    const userMail = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thanks for contacting INFUSED",
      text: `
Hi ${name || ""},

Thanks for reaching out. We have received your message and will get back to you shortly.

Your submitted details:

Subject: ${subject || "No subject"}
Message: ${message || "No message provided"}

Regards,
INFUSED Support Team
      `,
    };

    // ⚡ Send BOTH emails at the same time (parallel)
    await Promise.all([
      transporter.sendMail(adminMail),
      transporter.sendMail(userMail),
    ]);

    // Frontend gets this as soon as both are done (usually ~1–2s)
    res.json({ message: "Mail sent successfully" });
  } catch (err) {
    console.error("Connect mail error:", err);
    res.status(500).json({ message: "Failed to send email" });
  }
});

module.exports = router;
