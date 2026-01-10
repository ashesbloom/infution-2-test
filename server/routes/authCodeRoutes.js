// server/routes/authCodeRoutes.js
const express = require('express');
const router = express.Router();

const { protect, admin } = require('../middleware/authMiddleware');
const AuthCode = require('../models/AuthCode');


const randomCode = (length) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < length; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
};


//  GET /api/authcodes/fetch-next-unused
//  Access: Admin only

router.get('/fetch-next-unused', protect, admin, async (req, res) => {
  try {

    let codeDoc = await AuthCode.findOne({ isUsed: false }).sort({ createdAt: 1 });

    if (!codeDoc) {
      console.log('Stock empty. Auto-generating 100 new codes...');

      const docs = [];
      for (let i = 0; i < 100; i++) {
        docs.push({
          code: randomCode(12), 
          isUsed: false,
          productId: null,
        });
      }

      await AuthCode.insertMany(docs);

      // Fetch again after generation
      codeDoc = await AuthCode.findOne({ isUsed: false }).sort({ createdAt: 1 });
    }

    if (codeDoc) {
      return res.json({ success: true, code: codeDoc.code });
    } else {
      return res.status(500).json({ message: 'Failed to generate codes' });
    }
  } catch (err) {
    console.error('❌ Error fetching next code:', err.message);
    return res.status(500).json({ message: 'Server error fetching code' });
  }
});


//  PUT /api/authcodes/mark-printed
//  Desc: Mark a specific code as used (Printed on product)
//  Body: { code: string }
//  Access: Admin only

router.put('/mark-printed', protect, admin, async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ message: 'Code is required' });
  }

  try {
    const updatedCode = await AuthCode.findOneAndUpdate(
      { code: code },
      {
        isUsed: true,
        usedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedCode) {
      return res.status(404).json({ message: 'Code not found' });
    }

    return res.json({
      success: true,
      message: 'Code marked as printed',
      code: updatedCode,
    });
  } catch (err) {
    console.error('❌ Error marking code:', err.message);
    return res.status(500).json({ message: 'Server error updating code' });
  }
});


//  POST /api/authcodes/generate (Manual Bulk Gen)

router.post('/generate', protect, admin, async (req, res) => {
  const { count, length, productId } = req.body;

  if (!count || !length) {
    return res.status(400).json({ message: 'count and length are required' });
  }

  const docs = [];
  for (let i = 0; i < count; i++) {
    docs.push({
      code: randomCode(length),
      productId: productId || null,
      isUsed: false,
    });
  }

  try {
    await AuthCode.insertMany(docs);

    return res.status(201).json({
      message: 'Auth Codes Generated Successfully',
      total: docs.length,
    });
  } catch (err) {
    console.error('❌ Error inserting auth codes:', err.message);
    return res.status(500).json({ message: 'Error generating codes' });
  }
});


//  GET /api/authcodes (List All / Filter)

router.get('/', protect, admin, async (req, res) => {
  try {
    const { productId, used } = req.query;
    const filter = {};

    if (productId) filter.productId = productId;
    if (used === 'true') filter.isUsed = true;
    if (used === 'false') filter.isUsed = false;

    const codes = await AuthCode.find(filter).sort({ createdAt: -1 }).lean();

    return res.json(codes);
  } catch (err) {
    console.error('❌ Error fetching auth codes:', err.message);
    return res.status(500).json({ message: 'Error fetching codes' });
  }
});


//  GET /api/authcodes/export (CSV Export)

router.get('/export', protect, admin, async (req, res) => {
  try {
    const codes = await AuthCode.find().sort({ createdAt: -1 }).lean();

    let csv = 'code,productId,isUsed,usedAt,createdAt\n';

    codes.forEach((c) => {
      const line = [
        `"${c.code}"`,
        c.productId ? `"${c.productId}"` : '""',
        c.isUsed ? 'true' : 'false',
        c.usedAt ? `"${c.usedAt.toISOString()}"` : '""',
        c.createdAt ? `"${c.createdAt.toISOString()}"` : '""',
      ].join(',');

      csv += line + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="authcodes.csv"');

    return res.send(csv);
  } catch (err) {
    console.error('❌ Error exporting auth codes:', err.message);
    return res.status(500).json({ message: 'Error exporting codes' });
  }
});


//  POST /api/authcodes/verify (Customer Check)

router.post('/verify', async (req, res) => {
  const { code, markUsed = false, productId } = req.body;

  if (!code) {
    return res.status(400).json({ message: 'Code is required' });
  }

  try {
    const auth = await AuthCode.findOne({ code: code.trim().toUpperCase() });

    if (!auth) {
      return res.status(404).json({ valid: false, message: 'Invalid code' });
    }

    if (productId && auth.productId && auth.productId.toString() !== productId) {
      return res
        .status(400)
        .json({ valid: false, message: 'Code does not belong to this product' });
    }

    if (markUsed) {
      auth.isUsed = true;
      auth.usedAt = new Date();
      await auth.save();
    }

    return res.json({
      valid: true,
      message: 'Authentic Product',
      productId: auth.productId,
      isUsed: auth.isUsed,
      usedAt: auth.usedAt,
    });
  } catch (err) {
    console.error('❌ Error verifying auth code:', err.message);
    return res.status(500).json({ message: 'Error verifying code' });
  }
});

module.exports = router;
