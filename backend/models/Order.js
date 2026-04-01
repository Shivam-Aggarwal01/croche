const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  sizeType: { type: String, enum: ['standard', 'custom'], required: true },
  size: { type: String }, // 'S', 'M', 'L' etc for standard
  measurements: {
    bust: { type: String },
    waist: { type: String },
    length: { type: String },
  },
  comments: { type: String },
  quantity: { type: Number, required: true, default: 1 },
  priceAtTime: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerDetails: {
    email: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
  },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Processing', 'In Production', 'Shipped', 'Delivered'], default: 'Processing' },
  estimatedDelivery: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);
