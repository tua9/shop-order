const Order = require('../models/orderModel');
const Product = require('../models/productModel');

// Helper to check if current user owns the order (or is admin)
const isOrderOwner = (order, user) => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (order.userId && user.userId && order.userId.toString() === user.userId.toString()) {
    return true;
  }
  // Fallback for sample or existing orders matched by customerName
  if (
    order.customerName &&
    ((user.fullName && order.customerName.trim().toLowerCase() === user.fullName.trim().toLowerCase()) ||
     (user.username && order.customerName.trim().toLowerCase() === user.username.trim().toLowerCase()))
  ) {
    return true;
  }
  return false;
};

// @desc    Retrieve the list of product orders (Requirement 5)
// @route   GET / or GET /orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ orderDate: -1, createdAt: -1 });
    const error = req.query.error || null;
    res.render('order', { orders, error });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send('Server Error: ' + error.message);
  }
};

// @desc    Show create new order form (Requirement 7)
// @route   GET /orders/create
exports.getCreateOrderPage = async (req, res) => {
  try {
    const products = await Product.find();
    const defaultCustomerName = req.session?.user?.fullName || req.session?.user?.username || '';
    res.render('createOrder', {
      products,
      error: null,
      formData: { customerName: defaultCustomerName }
    });
  } catch (error) {
    console.error('Error loading create page:', error);
    res.status(500).send('Server Error: ' + error.message);
  }
};

// @desc    Add a new product order (Requirement 7, 8, 10)
// @route   POST /orders/create
exports.createOrder = async (req, res) => {
  const { customerName, productName, quantity, orderDate } = req.body;
  try {
    const products = await Product.find();

    if (!customerName || !productName || !quantity || !orderDate) {
      return res.render('createOrder', {
        products,
        error: 'Please fill in all required fields.',
        formData: req.body
      });
    }

    // Constraint: Only products that already exist in the system can be ordered (Requirement 8)
    const existingProduct = await Product.findOne({
      productName: { $regex: new RegExp(`^${productName.trim()}$`, 'i') }
    });

    if (!existingProduct) {
      return res.render('createOrder', {
        products,
        error: `Constraint Violated: Product "${productName}" does not exist in the system.`,
        formData: req.body
      });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.render('createOrder', {
        products,
        error: 'Quantity must be a positive number.',
        formData: req.body
      });
    }

    // Automatically calculate the total price based on quantity and unitPrice (Requirement 10)
    const totalPrice = existingProduct.unitPrice * qty;

    await Order.create({
      userId: req.session?.user?.userId || null,
      customerName: customerName.trim(),
      productName: existingProduct.productName,
      quantity: qty,
      orderDate: new Date(orderDate),
      totalPrice: totalPrice
    });

    res.redirect('/');
  } catch (error) {
    console.error('Error creating order:', error);
    const products = await Product.find().catch(() => []);
    res.render('createOrder', {
      products,
      error: 'Error creating order: ' + error.message,
      formData: req.body
    });
  }
};

// @desc    Show update order form (Requirement 9)
// @route   GET /orders/update/:id
exports.getUpdateOrderPage = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).send('Order not found');
    }

    // Enforce ownership: only owner or admin can update
    if (!isOrderOwner(order, req.session?.user)) {
      return res.redirect('/?error=' + encodeURIComponent('Bạn chỉ có thể cập nhật đơn hàng của chính mình.'));
    }

    const products = await Product.find();
    res.render('updateOrder', { order, products, error: null });
  } catch (error) {
    console.error('Error loading update page:', error);
    res.status(500).send('Server Error: ' + error.message);
  }
};

// @desc    Update order information by orderId (Requirement 9, 10)
// @route   POST /orders/update/:id
exports.updateOrder = async (req, res) => {
  const { customerName, productName, quantity, orderDate } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).send('Order not found');
    }

    // Enforce ownership: only owner or admin can update
    if (!isOrderOwner(order, req.session?.user)) {
      return res.redirect('/?error=' + encodeURIComponent('Bạn không có quyền cập nhật đơn hàng của người khác.'));
    }

    const products = await Product.find();

    // Check product existence
    const existingProduct = await Product.findOne({
      productName: { $regex: new RegExp(`^${productName.trim()}$`, 'i') }
    });

    if (!existingProduct) {
      return res.render('updateOrder', {
        order: { ...req.body, _id: req.params.id },
        products,
        error: `Constraint Violated: Product "${productName}" does not exist in the system.`
      });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.render('updateOrder', {
        order: { ...req.body, _id: req.params.id },
        products,
        error: 'Quantity must be a positive number.'
      });
    }

    // Automatically recalculate total price
    const totalPrice = existingProduct.unitPrice * qty;

    order.customerName = customerName.trim();
    order.productName = existingProduct.productName;
    order.quantity = qty;
    order.orderDate = new Date(orderDate);
    order.totalPrice = totalPrice;

    await order.save();

    res.redirect('/');
  } catch (error) {
    console.error('Error updating order:', error);
    const products = await Product.find().catch(() => []);
    res.render('updateOrder', {
      order: { ...req.body, _id: req.params.id },
      products,
      error: 'Error updating order: ' + error.message
    });
  }
};

// @desc    Delete an order by orderId (Requirement 6)
// @route   GET /orders/delete/:id or POST /orders/delete/:id
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).send('Order not found');
    }

    // Enforce ownership: only owner or admin can delete
    if (!isOrderOwner(order, req.session?.user)) {
      return res.redirect('/?error=' + encodeURIComponent('Bạn không có quyền xóa đơn hàng của người khác.'));
    }

    await Order.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).send('Server Error: ' + error.message);
  }
};
