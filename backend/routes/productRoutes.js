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
    images: ['/images/sweater.png'],
    inStock: true,
  },
  {
    _id: 'fallback-2',
    name: 'Classic Cream Crochet Top',
    description: 'Perfect for a stylish spring look',
    price: 2100,
    images: ['/images/top.png'],
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

  // With multer-storage-cloudinary, req.file.path contains the full URL
  const filePath = req.file.path;
  let imageUrl = filePath;

  // When using local disk storage (Render filesystem is ephemeral),
  // req.file.path is an absolute server path like:
  // /opt/render/project/src/backend/uploads/<file>
  // Convert it into a URL we can serve via `app.use('/uploads', express.static(...))`.
  if (typeof imageUrl === 'string' && !imageUrl.startsWith('http')) {
    const fileName = req.file.filename || path.basename(imageUrl);
    imageUrl = `/uploads/${fileName}`;
  }

  return res.status(201).json({ imageUrl });
});

// One-time utility: normalize stored image paths for existing products
// It looks for absolute server paths like `/opt/render/project/src/backend/uploads/<file>`
// and rewrites them to `/uploads/<file>` so the frontend can build correct URLs.
router.post('/fix-image-paths', async (req, res) => {
  try {
    const products = await Product.find({ images: { $exists: true, $ne: [] } });
    let updatedCount = 0;

    for (const product of products) {
      let changed = false;
      const newImages = (product.images || []).map((img) => {
        if (typeof img !== 'string') return img;
        const normalized = img.trim().replace(/\\/g, '/');
        const uploadsIndex = normalized.indexOf('/uploads/');
        if (uploadsIndex !== -1 && !normalized.startsWith('/uploads/')) {
          const filePart = normalized.slice(uploadsIndex + '/uploads/'.length).replace(/^\/+/, '');
          if (filePart) {
            changed = true;
            return `/uploads/${filePart}`;
          }
        }
        return normalized;
      });

      if (changed) {
        product.images = newImages;
        await product.save();
        updatedCount += 1;
      }
    }

    res.json({ message: 'Image paths normalized', updatedProducts: updatedCount });
  } catch (error) {
    console.error('Error normalizing image paths:', error);
    res.status(500).json({ message: 'Failed to normalize image paths' });
  }
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
