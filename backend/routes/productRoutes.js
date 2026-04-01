const express = require('express');
const router = express.Router();
const path = require('path');
const Product = require('../models/Product');
const upload = require('../middleware/multer');

const fallbackProducts = [
  {
    _id: 'fallback-1',
    name: 'Cozy Almond Sweater',
    description: 'Soft hand-knitted acrylic with earthy tones',
    price: 1650,
    images: ['/images/fallback-sweater.jpg'],
    inStock: true,
  },
  {
    _id: 'fallback-2',
    name: 'Classic Cream Crochet Top',
    description: 'Perfect for a stylish spring look',
    price: 2100,
    images: ['/images/fallback-top.jpg'],
    inStock: true,
  },
];

// Get all products
router.get('/', async (req, res) => {
  if (!global.DB_AVAILABLE) {
    return res.json(fallbackProducts);
  }

  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  if (!global.DB_AVAILABLE) {
    const product = fallbackProducts.find((p) => p._id === req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    return res.json(product);
  }

  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload product image
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  return res.status(201).json({ imageUrl });
});

// Add a product (admin only conceptually for now)
router.post('/', async (req, res) => {
  const product = new Product(req.body);
  try {
    const saved = await product.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a product (admin)
router.patch('/:id', async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Remove product (admin)
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
