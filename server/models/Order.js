// server/models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },

    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
      },
    ],

    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true },
    },

    paymentMethod: {
      type: String,
      required: true,
      default: 'COD',
    },

    itemsPrice: { type: Number, required: true },
    taxPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },

    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },

    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },

    // ---------------------------------------------------
    // ⭐ OFFICIAL ORDER STATUS ENUM (updated)
    // ---------------------------------------------------
    status: {
      type: String,
      enum: [
        'Processing',
        'Shipped',
        'Out for Delivery',
        'Delivered',
        'Cancelled',
        'Cancelled (Stock Refunded)'   // ← added
      ],
      default: 'Processing',
    },

    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },

    // ---------------------------------------------------
    // ⭐ CLEAN CANCELLATION FIELDS
    // ---------------------------------------------------
    isCancelled: { type: Boolean, default: false },
    cancelledAt: { type: Date },
    cancelReason: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
