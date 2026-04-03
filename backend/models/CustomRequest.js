const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  phone: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  measurements: { type: String },
  referenceImage: { type: String }, // URL or path
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['Pending', 'Reviewed', 'Accepted', 'Rejected'], default: 'Pending' },
});

module.exports = mongoose.model('CustomRequest', requestSchema);
