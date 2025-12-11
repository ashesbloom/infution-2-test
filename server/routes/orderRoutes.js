// server/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');

const Order = require('../models/Order');
const User = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');

// ---------- EMAIL SETUP (GMAIL) ----------
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((err) => {
  if (err) console.log('❌ Order email error:', err.message);
  else console.log('✅ Order email service ready');
});

const EMAIL_FROM = `"Infused Nutrition" <${process.env.EMAIL_USER}>`;

/**
 * sendOrderMail(user, order, label)
 * label can be:
 *   '' (default) -> order confirmation (used at order create)
 *   'COD' or 'RAZORPAY' -> used in create/pay flows
 *   'SHIPPED' -> admin marked as Shipped
 *   'OUT_FOR_DELIVERY' -> admin marked Out for Delivery
 *   'DELIVERED' -> admin marked Delivered
 */
const sendOrderMail = async (user, order, label = '') => {
  if (!user || !order) return;

  const itemsRows = order.orderItems
    .map(
      (item) => `
        <tr>
          <td style="padding: 8px 0;">${item.name}</td>
          <td style="padding: 8px 0; text-align:center;">${item.qty}</td>
          <td style="padding: 8px 0; text-align:right;">₹${item.price}</td>
        </tr>
      `
    )
    .join('');

  // Basic plain-text fallback (kept minimal)
  let text = `Hello ${user.name},\n\nOrder ID: ${order._id}\nTotal Amount: ₹${order.totalPrice}\nPayment Method: ${order.paymentMethod}\nStatus: ${order.status || ''}\n`;

  // Compose subject & preface depending on label/status
  let subject = `Your Order is Confirmed – ${order._id}`;
  let prefaceHtml = `<p>Your order has been placed successfully.</p>`;

  if (label === 'COD') {
    subject = `Your Order is Confirmed (COD) – ${order._id}`;
    prefaceHtml = `<p>Your Cash-on-Delivery order has been received.</p>`;
    text = `Hello ${user.name},\n\nYour Cash-on-Delivery order has been received.\n\nOrder ID: ${order._id}\nTotal Amount: ₹${order.totalPrice}\nPayment Method: ${order.paymentMethod}\n`;
  } else if (label === 'RAZORPAY') {
    subject = `Payment Received – ${order._id}`;
    prefaceHtml = `<p>Thank you — we have received your payment.</p>`;
    text = `Hello ${user.name},\n\nPayment received for your order.\n\nOrder ID: ${order._id}\nTotal Amount: ₹${order.totalPrice}\n`;
  } else if (label === 'SHIPPED') {
    subject = `Your Order Has Shipped – ${order._id}`;
    prefaceHtml = `<p>Good news — your order has been shipped! 🚚</p>`;
    text = `Hello ${user.name},\n\nYour order has been shipped.\n\nOrder ID: ${order._id}\nStatus: ${order.status}\nTotal Amount: ₹${order.totalPrice}\n`;
  } else if (label === 'OUT_FOR_DELIVERY') {
    subject = `Out for Delivery – ${order._id}`;
    prefaceHtml = `<p>Your order is out for delivery and will reach you soon. 📦</p>`;
    text = `Hello ${user.name},\n\nYour order is out for delivery.\n\nOrder ID: ${order._id}\nStatus: ${order.status}\nTotal Amount: ₹${order.totalPrice}\n`;
  } else if (label === 'DELIVERED') {
    subject = `Order Delivered – ${order._id}`;
    prefaceHtml = `<p>We hope you enjoy your purchase — your order has been delivered. ✅</p>`;
    text = `Hello ${user.name},\n\nYour order has been delivered.\n\nOrder ID: ${order._id}\nTotal Amount: ₹${order.totalPrice}\n`;
  }

  const html = `
  <div style="font-family: Arial, sans-serif; color: #111; max-width: 600px; margin: 0 auto;">
    <h2 style="color:#eab308;">${prefaceHtml.replace(/<\/?p>/g, '')}</h2>

    <div style="margin-top: 8px; padding: 12px 16px; background:#f4f4f5; border-radius:8px;">
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
      <p><strong>Total Amount:</strong> ₹${order.totalPrice}</p>
      <p><strong>Status:</strong> ${order.status || ''}</p>
    </div>

    <h3 style="margin-top:16px;">Shipping Details</h3>
    <p>
      ${order.shippingAddress?.fullName || ''}<br/>
      ${order.shippingAddress?.address || ''}<br/>
      ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.postalCode || ''}<br/>
      Phone: ${order.shippingAddress?.phone || ''}
    </p>

    <h3 style="margin-top:16px;">Order Items</h3>
    <table style="width:100%; border-collapse:collapse; margin-top:8px;">
      <thead>
        <tr style="border-bottom:1px solid #ddd;">
          <th style="text-align:left; padding-bottom:8px;">Product</th>
          <th style="text-align:center; padding-bottom:8px;">Qty</th>
          <th style="text-align:right; padding-bottom:8px;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <p style="margin-top:16px;">We appreciate your purchase 🙌</p>
    <p style="font-size:12px; color:#666;">– Infused Nutrition Pvt ltd Store</p>
  </div>
  `;

  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: user.email,
      subject,
      text,
      html,
    });
  } catch (err) {
    console.error(`❌ Email error:`, err.message);
  }
};

// ------------------------------------------------
// CREATE ORDER
// ------------------------------------------------
router.post(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items');
    }

    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    if (paymentMethod?.toUpperCase() === 'COD') {
      const userData = await User.findById(req.user._id);
      await sendOrderMail(userData, createdOrder, 'COD');
    }

    res.status(201).json(createdOrder);
  })
);

// ------------------------------------------------
// RAZORPAY ROUTES
// ------------------------------------------------
router.get('/config/razorpay', protect, (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
});

router.post(
  '/razorpay',
  protect,
  asyncHandler(async (req, res) => {
    const { amount } = req.body;

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await instance.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    res.json(order);
  })
);

// ------------------------------------------------
// USER ORDERS
// ------------------------------------------------
router.get(
  '/myorders',
  protect,
  asyncHandler(async (req, res) => {
    const orders = await Order.find({
      user: req.user._id,
      $or: [
        { paymentMethod: { $ne: 'Razorpay' } },
        { paymentMethod: 'Razorpay', isPaid: true },
      ],
    });

    res.json(orders);
  })
);

// ------------------------------------------------
// ADMIN – GET ALL ORDERS
// ------------------------------------------------
router.get(
  '/',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const orders = await Order.find({
      $or: [
        { paymentMethod: { $ne: 'Razorpay' } },
        { paymentMethod: 'Razorpay', isPaid: true },
      ],
    }).populate('user', 'id name');

    res.json(orders);
  })
);

// ------------------------------------------------
// GET ORDER BY ID
// ------------------------------------------------
router.get(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email'
    );

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    res.json(order);
  })
);

// ------------------------------------------------
// MARK AS PAID
// ------------------------------------------------
router.put(
  '/:id/pay',
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };

    const updatedOrder = await order.save();

    const userData = await User.findById(order.user);
    await sendOrderMail(userData, updatedOrder, 'RAZORPAY');

    res.json(updatedOrder);
  })
);

// ------------------------------------------------
// ADMIN – UPDATE SHIPPING STATUS (non-blocking email)
// ------------------------------------------------
router.put(
  '/:id/status',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'email name');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    const { status } = req.body;

    order.status = status;

    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();

      if (order.paymentMethod === 'COD' && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
          id: 'COD_ON_DELIVERY',
          status: 'COMPLETED',
          update_time: new Date().toISOString(),
          email_address: order.user?.email || '',
        };
      }
    }

    const updatedOrder = await order.save();

    // Send email in background (non-blocking) so API responds fast.
    try {
      // fetching user data from DB is quick; we await that.
      const userData = await User.findById(order.user);

      if (status === 'Shipped') {
        // do NOT await — trigger and forget
        sendOrderMail(userData, updatedOrder, 'SHIPPED');
      } else if (
        status === 'Out for Delivery' ||
        status === 'Out-for-Delivery' ||
        status === 'OutForDelivery'
      ) {
        sendOrderMail(userData, updatedOrder, 'OUT_FOR_DELIVERY');
      } else if (status === 'Delivered') {
        sendOrderMail(userData, updatedOrder, 'DELIVERED');
      }
    } catch (err) {
      console.error('❌ Failed to trigger status email:', err.message || err);
    }

    res.json(updatedOrder);
  })
);

// ------------------------------------------------
// ⭐ NEW — CANCEL ORDER (USER OR ADMIN)
// ------------------------------------------------
router.put(
  '/:id/cancel',
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Only owner or admin can cancel
    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(401);
      throw new Error('Not authorized to cancel this order');
    }

    // Cannot cancel shipped/delivered
    if (order.status === 'Shipped' || order.status === 'Out for Delivery' || order.status === 'Delivered') {
      res.status(400);
      throw new Error('Order cannot be cancelled after it has been shipped');
    }

    if (order.isCancelled) {
      res.status(400);
      throw new Error('Order is already cancelled');
    }

    order.isCancelled = true;
    order.cancelledAt = Date.now();
    order.status = 'Cancelled';
    order.cancelReason = req.body.reason || '';

    const updated = await order.save();
    res.json(updated);
  })
);

module.exports = router;
