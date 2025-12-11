// server/models/AuthCode.js
const mongoose = require('mongoose');

const AuthCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // If your code belongs to a product (optional)
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },

    // Whether this code has been used/assigned
    isUsed: {
      type: Boolean,
      default: false,
    },

    // When it was marked as used by admin
    usedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// Index for fast lookup by code
AuthCodeSchema.index({ code: 1 });

module.exports = mongoose.model('AuthCode', AuthCodeSchema);
