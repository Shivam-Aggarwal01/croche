const mongoose = require('mongoose');

// Track database status
global.DB_AVAILABLE = false;

async function connectDatabase() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/cozycacoon';
    
    console.log('Attempting MongoDB connection...');
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
    });

    global.DB_AVAILABLE = true;
    console.log('✓ MongoDB connected successfully');
    return true;
  } catch (err) {
    global.DB_AVAILABLE = false;
    console.error('✗ MongoDB connection error:', err.message);

    // For cloud MongoDB failures, don't try local fallback
    if (process.env.MONGO_URI) {
      console.warn('⚠ Cloud MongoDB failed. Check credentials and IP whitelist.');
      console.warn('  Ensure IP 0.0.0.0/0 is added in MongoDB Atlas Network Access.');
      return false;
    }


    console.log('Attempting local MongoDB fallback...');
    try {
      await mongoose.connect('mongodb://localhost:27017/cozycacoon', {
        serverSelectionTimeoutMS: 5000,
      });
      global.DB_AVAILABLE = true;
      console.log('✓ Local MongoDB fallback connected');
      return true;
    } catch (fallbackErr) {
      console.error('✗ Local MongoDB fallback failed:', fallbackErr.message);
      console.warn('⚠ Running in offline mode with fallback data only');
      return false;
    }
  }
}

module.exports = { connectDatabase };
