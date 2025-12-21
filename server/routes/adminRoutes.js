// server/routes/adminRoutes.js
const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const User = require('../models/User');
const AuthCode = require('../models/AuthCode');

const router = express.Router();

// ---------------------------------------------
// GET /api/admin/auth-code  (ADMIN ONLY)
// → Fetch current code from User for dashboard display
// ---------------------------------------------
router.get('/auth-code', protect, admin, async (req, res) => {
  try {
    const adminUser = await User.findById(req.user._id);

    if (!adminUser) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    return res.json({
      token: adminUser.generatedAdminToken || '',
    });
  } catch (err) {
    console.error('Fetch auth code error:', err.message);
    return res
      .status(500)
      .json({ message: 'Failed to fetch authentication code' });
  }
});

// ---------------------------------------------
// Helper: "unused" = isUsed: false
// (kept for clarity if you reuse later)
// ---------------------------------------------
const unusedCodeFilter = { isUsed: false };

// ---------------------------------------------
// POST /api/admin/generate-token  (ADMIN ONLY)
// → Take an UNUSED code from AuthCode DB & store in adminUser
//    Behaviour:
//      - Still uses unused codes (isUsed: false)
//      - Tries to avoid immediately repeating the last code
//      - Does NOT auto-mark as used (same as before)
// ---------------------------------------------
router.post('/generate-token', protect, admin, async (req, res) => {
  try {
    const adminUser = await User.findById(req.user._id);
    if (!adminUser) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    const lastCode = adminUser.generatedAdminToken || null;

    // 1) Count how many unused codes exist
    const totalUnused = await AuthCode.countDocuments(unusedCodeFilter);

    if (totalUnused === 0) {
      return res.status(400).json({
        message:
          'No unused authentication codes available. Please insert or generate more codes in the AuthCode database.',
      });
    }

    let authCode = null;
    let tries = 0;

    // 2) Try a few times to get a random unused code different from lastCode
    while (tries < 5) {
      const randomIndex = Math.floor(Math.random() * totalUnused);
      const candidate = await AuthCode.findOne(unusedCodeFilter).skip(randomIndex);

      if (!candidate) break;

      if (!lastCode || candidate.code !== lastCode) {
        authCode = candidate;
        break;
      }

      tries++;
    }

    // 3) Fallback: if still null, just pick any unused (same as your old logic)
    if (!authCode) {
      authCode = await AuthCode.findOne(unusedCodeFilter);
    }

    if (!authCode) {
      return res.status(400).json({
        message: 'Failed to pick an unused authentication code.',
      });
    }

    const code = authCode.code;

    // Store the currently generated code on the admin user (for dashboard display)
    adminUser.generatedAdminToken = code;
    await adminUser.save();

    // Code is NOT marked used here; it will be marked used in /auth-code/mark-used
    return res.json({ token: code });
  } catch (err) {
    console.error('Generate token error:', err.message);
    return res.status(500).json({ message: 'Failed to generate token' });
  }
});

// ---------------------------------------------
// PUT /api/admin/token-card-visibility  (ADMIN)
// body: { hideAdminTokenCard: true }
// → Persist "hide panel" choice on admin user
// ---------------------------------------------
router.put('/token-card-visibility', protect, admin, async (req, res) => {
  try {
    const { hideAdminTokenCard } = req.body;

    const adminUser = await User.findById(req.user._id);
    if (!adminUser) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    adminUser.hideAdminTokenCard = !!hideAdminTokenCard;
    await adminUser.save();

    return res.json({
      success: true,
      hideAdminTokenCard: adminUser.hideAdminTokenCard,
    });
  } catch (err) {
    console.error('Token card visibility error:', err.message);
    return res
      .status(500)
      .json({ message: 'Failed to update visibility' });
  }
});

// ---------------------------------------------
// PUT /api/admin/auth-code/mark-used  (ADMIN ONLY)
// body: { code: "<currentCode>" }
// → Mark a specific code as used so it is NEVER
//   selected again by /generate-token
// ---------------------------------------------
router.put('/auth-code/mark-used', protect, admin, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Code is required' });
    }

    const authCode = await AuthCode.findOne({ code });

    if (!authCode) {
      return res.status(404).json({ message: 'Auth code not found' });
    }

    // Mark code as used (using isUsed field from your schema)
    if (!authCode.isUsed) {
      authCode.isUsed = true;
      authCode.usedAt = new Date();
      await authCode.save();
    }

    // Clear current token from admin if it matches this code
    const adminUser = await User.findById(req.user._id);
    if (adminUser && adminUser.generatedAdminToken === code) {
      adminUser.generatedAdminToken = '';
      await adminUser.save();
    }

    return res.json({
      success: true,
      code: authCode.code,
      isUsed: authCode.isUsed,
      usedAt: authCode.usedAt,
    });
  } catch (err) {
    console.error('Mark auth code used error:', err.message);
    return res
      .status(500)
      .json({ message: 'Failed to mark code as used' });
  }
});

module.exports = router;