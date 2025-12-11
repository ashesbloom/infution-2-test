const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');
const { protect, admin } = require('../middleware/authMiddleware');

// GET /api/products  -> all products (public)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const products = await Product.find({});
    res.json(products);
  })
);

// GET /api/products/:id  -> single product (public)
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  })
);

// POST /api/products  -> create product (admin only)
router.post(
  '/',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    console.log('📥 Create product body =>', req.body);

    const {
      name,
      price,
      description,
      image,
      images,        // ✅ NEW: array of images
      brand,
      category,
      countInStock,
      weight,
    } = req.body;

    // ensure images is always an array
    const allImages = Array.isArray(images) ? images : [];

    const product = new Product({
      name,
      price: Number(price),
      user: req.user._id,

      // ✅ main image (backward compatible)
      image: image || allImages[0] || '',

      // ✅ store all image paths here
      images: allImages,

      // default brand + description so mongoose "required" doesn’t fail
      brand: (brand && brand.trim()) || 'Infuse',
      category,
      countInStock: Number(countInStock),
      numReviews: 0,
      description: (description && description.trim()) || 'N/A',

      // ✅ save weight
      weight: weight || '1 kg', // or just `weight` if you don't want a default
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  })
);

// DELETE /api/products/:id  -> delete product (admin only)
router.delete(
  '/:id',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.json({ message: 'Product removed' });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  })
);

// PUT /api/products/:id  -> update product (admin only)
router.put(
  '/:id',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const {
      name,
      price,
      description,
      image,
      images,        // ✅ NEW: images array on update too
      brand,
      category,
      countInStock,
      weight,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name ?? product.name;

      product.price =
        price !== undefined && price !== null
          ? Number(price)
          : product.price;

      product.description =
        description !== undefined ? description : product.description;

      // ✅ main image
      if (image !== undefined) {
        product.image = image;
      }

      // ✅ update images array if provided
      if (Array.isArray(images)) {
        product.images = images;

        // if no explicit image but images[] has first, sync main image
        if (!image && images.length > 0) {
          product.image = images[0];
        }
      }

      product.brand = brand ?? product.brand;
      product.category = category ?? product.category;

      product.countInStock =
        countInStock !== undefined && countInStock !== null
          ? Number(countInStock)
          : product.countInStock;

      // ✅ update weight if sent
      if (weight !== undefined) {
        product.weight = weight;
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  })
);

module.exports = router;