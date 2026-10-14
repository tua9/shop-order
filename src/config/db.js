const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const User = require('../models/userModel');

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shop_order';
  const atlasUri = 'mongodb+srv://leanhtuan180303_db_user:MDn1OD050L1jpqez@shop-order-cluster01.thsgqoc.mongodb.net/?appName=shop-order-cluster01';

  try {
    const conn = await mongoose.connect(primaryUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedInitialData();
  } catch (error) {
    console.warn(`Primary connection (${primaryUri}) failed: ${error.message}. Trying Atlas fallback...`);
    try {
      const conn = await mongoose.connect(atlasUri);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      await seedInitialData();
    } catch (atlasError) {
      console.error(`Error connecting to MongoDB: ${atlasError.message}`);
      process.exit(1);
    }
  }
};

const seedInitialData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const defaultPassword = await bcrypt.hash('123456', 10);
      await User.insertMany([
        {
          username: 'admin',
          password: defaultPassword,
          fullName: 'Administrator',
          role: 'admin'
        },
        {
          username: 'tuandz',
          password: defaultPassword,
          fullName: 'Lê Anh Tuấn',
          role: 'user'
        }
      ]);
      console.log('Sample users seeded successfully (admin/123456, tuandz/123456).');
    }

    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany([
        {
          productName: 'Wireless Mouse',
          category: 'Electronics',
          stockStatus: 'in_stock',
          unitPrice: 250000,
          tags: ['bestseller', 'wireless', 'accessory']
        },
        {
          productName: 'Mechanical Keyboard',
          category: 'Electronics',
          stockStatus: 'in_stock',
          unitPrice: 800000,
          tags: ['gaming', 'keyboard', 'accessory']
        },
        {
          productName: 'USB-C Hub',
          category: 'Electronics',
          stockStatus: 'in_stock',
          unitPrice: 350000,
          tags: ['adapter', 'accessory']
        }
      ]);
      console.log('Sample products seeded successfully.');
    }

    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      await Order.insertMany([
        {
          customerName: 'Nguyen Thi Lan',
          productName: 'Wireless Mouse',
          quantity: 2,
          orderDate: new Date('2024-10-17T00:00:00Z'),
          totalPrice: 500000
        },
        {
          customerName: 'Pham Van Duc',
          productName: 'Mechanical Keyboard',
          quantity: 1,
          orderDate: new Date('2024-10-18T00:00:00Z'),
          totalPrice: 800000
        }
      ]);
      console.log('Sample orders seeded successfully (matching Figure 1).');
    }
  } catch (error) {
    console.error('Error seeding data:', error.message);
  }
};

module.exports = connectDB;
