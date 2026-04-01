const express = require('express');
const router = express.Router();
const CustomRequest = require('../models/CustomRequest');
const upload = require('../middleware/multer');
const authMiddleware = require('../middleware/auth');

// Get request statistics
router.get('/stats', async (req, res) => {
  try {
    const totalRequests = await CustomRequest.countDocuments();
    const pendingRequests = await CustomRequest.countDocuments({ status: 'Pending' });

    res.json({
      totalRequests,
      pendingRequests
    });
  } catch (error) {
    console.error('Request stats error:', error);
    res.status(500).json({ message: 'Error fetching request statistics' });
  }
});

// User: Submit a custom request - Protected
router.post('/', authMiddleware, upload.single('referenceImage'), async (req, res) => {
  const requestObj = {
    user: req.user.id, // Associate with user
    name: req.body.name,
    description: req.body.description,
    measurements: req.body.measurements,
    referenceImage: req.file ? `/uploads/${req.file.filename}` : req.body.referenceImage,
  };

  const request = new CustomRequest(requestObj);
  try {
    const saved = await request.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin: Get all custom requests
router.get('/', async (req, res) => {
  if (!global.DB_AVAILABLE) {
    return res.json([]);
  }

  try {
    const requests = await CustomRequest.find().populate('user', 'name email phone savedAddress').sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Update custom request status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Reviewed', 'Accepted', 'Rejected'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const request = await CustomRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email phone savedAddress');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
