const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import User model
let User;
try {
  User = require('../models/User');
} catch (error) {
  console.error('Error loading User model:', error.message);
  // Fallback: create a simple in-memory user store for testing
  User = {
    findOne: async (query) => {
      // Mock implementation
      return null;
    },
    prototype: {
      save: function() {
        return Promise.resolve(this);
      }
    }
  };
}

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes working' });
});

// Admin Login
router.post('/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
    const token = jwt.sign({ role: 'admin', username }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });
    return res.json({ token, role: 'admin' });
  }

  return res.status(401).json({ message: 'Invalid admin credentials' });
});

// Customer Signup
router.post('/signup', async (req, res) => {
  if (!global.DB_AVAILABLE) {
    return res.status(503).json({ 
      message: 'Database is currently offline. Please check MongoDB Atlas IP whitelist (allow 0.0.0.0/0) and Render environment variables.' 
    });
  }

  try {
    console.log('Signup request:', req.body);
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone: phone || ''
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '7d' }
    );

    console.log('User created successfully:', user._id);
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup', details: error.message });
  }
});

// Customer Login
router.post('/login', async (req, res) => {
  try {
    console.log('Login request:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '7d' }
    );

    console.log('User logged in successfully:', user._id);
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        savedAddress: user.savedAddress
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;
