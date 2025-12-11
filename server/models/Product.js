const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const productSchema = mongoose.Schema(
  {
    // who created product
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },

    name: { type: String, required: true },

    // ✅ main image (for backward compatibility)
    image: { type: String, required: true },

    // ✅ NEW: extra images array
    // this will store all image paths you send from frontend
    images: [{ type: String }],

    brand: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },

    price: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },

    // ✅ NEW: weight field
    weight: { type: String, default: '1 kg' },

    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;