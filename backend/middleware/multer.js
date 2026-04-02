const multer = require('multer');
const path = require('path');

let storage;

// Use Cloudinary if credentials are available, otherwise use local disk
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  const cloudinary = require('../config/cloudinary');

  storage = new CloudinaryStorage({
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
  console.log('✓ Using Cloudinary storage for uploads');
} else {
  // Fallback to local disk storage
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  });
  console.log('⚠ Using local disk storage (images will not persist on Render restarts)');
}

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (jpeg, jpg, png, gif) and PDFs are allowed'));
  }
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

module.exports = upload;
