const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'cozycacoon',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
    public_id: (req, file) => {
      const name = file.originalname.split('.')[0];
      return `${Date.now()}-${name}`;
    },
  },
});

// Create multer instance
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

module.exports = upload;
