const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  stockStatus: {
    type: String,
    required: true,
    enum: ['in_stock', 'out_of_stock', 'discontinued'],
    default: 'in_stock'
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  tags: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
