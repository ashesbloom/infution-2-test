// server/routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Razorpay = require('razorpay');
const transporter = require('../utils/brevoTransporter');


const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');


// EMAIL SETUP (BREVO SMTP – PRODUCTION SAFE)
const EMAIL_FROM = `"Nutry Health" <no-reply@nutryhealth.com>`;


// EMAIL HELPER (NON-BLOCKING)
const sendOrderMail = async (user, order, label = '') => {
  try {
    if (!user || !order) return;

    const itemsRows = order.orderItems
      .map(
        (item) => `
          <tr>
            <td style="padding:8px 0;">${item.name}</td>
            <td style="padding:8px 0; text-align:center;">${item.qty}</td>
            <td style="padding:8px 0; text-align:right;">₹${item.price}</td>
          </tr>
        `
      )
      .join('');

    let subject = `Order Update – ${order._id}`;

if (label === 'COD')
  subject = `Order Placed (Cash on Delivery) – ${order._id}`;

if (label === 'RAZORPAY')
  subject = `Payment Successful – Order ${order._id}`;

if (label === 'SHIPPED')
  subject = `Your Order Has Been Shipped – ${order._id}`;

if (label === 'OUT_FOR_DELIVERY')
  subject = `Out for Delivery – Order ${order._id}`;

if (label === 'DELIVERED')
  subject = `Order Delivered Successfully – ${order._id}`;

if (label === 'CANCELLED')
  subject = `Order Cancelled – ${order._id}`;

let message = 'Your order has been placed successfully.';

if (label === 'COD')
  message = 'Your Cash-on-Delivery order has been received.';

if (label === 'RAZORPAY')
  message = 'Payment received successfully.';

if (label === 'SHIPPED')
  message = 'Your order has been shipped.';

if (label === 'OUT_FOR_DELIVERY')
  message = 'Your order is out for delivery.';

if (label === 'DELIVERED')
  message = 'Your order has been delivered.';

if (label === 'CANCELLED')
  message = 'Your order has been cancelled.';


    const html = `
      <div style="font-family:Arial; max-width:600px; margin:auto;">
        <h2>${message}</h2>

        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Total Amount:</strong> ₹${order.totalPrice}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        <p><strong>Status:</strong> ${order.status}</p>

        <h3>Shipping Details</h3>
        <p>
          ${order.shippingAddress?.fullName}<br/>
          ${order.shippingAddress?.address}<br/>
          ${order.shippingAddress?.city}, ${order.shippingAddress?.state} - ${order.shippingAddress?.postalCode}
        </p>

        <h3>Order Items</h3>
        <table width="100%">${itemsRows}</table>

        <p style="color:#666;">– Nutry Health Pvt Ltd</p>
      </div>
    `;

    await transporter.sendMail({
      from: EMAIL_FROM,
      to: user.email,
      subject,
      html,
    });
  } catch (err) {
    console.log('📧 Email skipped:', err.message);
  }
};


// CREATE ORDER
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

    // Validate that all order items have a product ID
    for (const item of orderItems) {
      if (!item.product) {
        res.status(400);
        throw new Error(`Missing product ID for item: ${item.name || 'Unknown'}`);
      }
    }

    const outOfStockItems = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product || product.countInStock < item.qty) {
        outOfStockItems.push(item.name);
      }
    }

    if (outOfStockItems.length > 0) {
      res.status(400);
      throw new Error(`Out of stock: ${outOfStockItems.join(', ')}`);
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

    for (const item of orderItems) {
      await Product.updateOne(
        { _id: item.product },
        { $inc: { countInStock: -item.qty } }
      );
    }

    if (paymentMethod?.toUpperCase() === 'COD') {
      const userData = await User.findById(req.user._id);
      sendOrderMail(userData, createdOrder, 'COD');
    }

    res.status(201).json(createdOrder);
  })
);


// RAZORPAY CONFIG
router.get('/config/razorpay', protect, (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
});


// CREATE RAZORPAY ORDER

router.post(
  '/razorpay',
  protect,
  asyncHandler(async (req, res) => {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const razorOrder = await instance.orders.create({
      amount: Math.round(req.body.amount * 100),
      currency: 'INR',
      receipt: `order_rcpt_${Date.now()}`,
    });

    res.json(razorOrder);
  })
);


// USER ORDERS

router.get(
  '/myorders',
  protect,
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  })
);


// ADMIN – GET ALL ORDERS

router.get(
  '/',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const orders = await Order.find().populate('user', 'id name');
    res.json(orders);
  })
);


// GET ORDER BY ID

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


// PAY ORDER (RAZORPAY)
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
    order.paymentResult = req.body;

    const updated = await order.save();

    const userData = await User.findById(order.user);
    sendOrderMail(userData, updated, 'RAZORPAY');

    res.json(updated);
  })
);


// UPDATE SHIPPING STATUS (ADMIN)

router.put(
  '/:id/status',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'email name'
    );

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    const { status } = req.body;
    order.status = status;

    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
if (status === 'Shipped') {
  order.shippedAt = Date.now();
}

if (status === 'Out for Delivery') {
  order.outForDeliveryAt = Date.now();
}

    const updatedOrder = await order.save();
    sendOrderMail(
  order.user,
  updatedOrder,
  status.toUpperCase().replace(/\s+/g, '_')
);


    res.json(updatedOrder);
  })
);


// CANCEL ORDER

router.put(
  '/:id/cancel',
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (
      order.user.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      res.status(401);
      throw new Error('Not authorized to cancel this order');
    }

    if (
      order.status === 'Shipped' ||
      order.status === 'Out for Delivery' ||
      order.status === 'Delivered'
    ) {
      res.status(400);
      throw new Error('Order cannot be cancelled after shipping.');
    }

    for (const item of order.orderItems) {
      await Product.updateOne(
        { _id: item.product },
        { $inc: { countInStock: item.qty } }
      );
    }

    order.isCancelled = true;
    order.status = 'Cancelled';
    order.cancelledAt = Date.now();

    const updated = await order.save();
    const userData = await User.findById(order.user);
sendOrderMail(userData, updated, 'CANCELLED');

    res.json(updated);
  })
);

module.exports = router;
