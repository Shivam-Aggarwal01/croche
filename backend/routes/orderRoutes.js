const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const authMiddleware = require('../middleware/auth');

// Get admin statistics
router.get('/stats', async (req, res) => {
  try {
    // Get all orders
    const orders = await Order.find();

    // Count active orders (not delivered)
    const activeOrders = orders.filter(order => order.status !== 'Delivered').length;

    // Get total unique customers (from orders)
    const uniqueCustomers = new Set(orders.map(order => order.customerDetails?.email).filter(Boolean)).size;

    res.json({
      activeOrders,
      totalCustomers: uniqueCustomers,
      totalOrders: orders.length
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

// Create a new order (Checkout Flow) - Protected
router.post('/', authMiddleware, async (req, res) => {
  const order = new Order({
    ...req.body,
    user: req.user.id // Associate order with authenticated user
  });
  try {
    const saved = await order.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin: Get all orders
router.get('/', async (req, res) => {
  if (!global.DB_AVAILABLE) {
    return res.json([]);
  }

  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate('items.product');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User: Get specific order by ID
router.get('/:id', async (req, res) => {
  if (!global.DB_AVAILABLE) {
    return res.status(404).json({ message: 'Order tracking not found' });
  }

  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) return res.status(404).json({ message: 'Order tracking not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, estimatedDelivery } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, estimatedDelivery },
      { new: true }
    );
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin: Delete order by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// User: Get all orders for a specific user
router.get('/user/:userId', async (req, res) => {
  if (!global.DB_AVAILABLE) {
    return res.json([]);
  }

  try {
    const orders = await Order.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('items.product');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
