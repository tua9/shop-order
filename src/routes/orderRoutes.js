const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { requireLogin } = require("../middleware/authMiddleware");

// List orders (public view)
router.get("/", orderController.getAllOrders);
router.get("/orders", orderController.getAllOrders);

// Create order (Requires user to be logged in)
router.get("/orders/create", requireLogin, orderController.getCreateOrderPage);
router.post("/orders/create", requireLogin, orderController.createOrder);

// Update order (Requires user to be logged in)
router.get("/orders/update/:id", requireLogin, orderController.getUpdateOrderPage);
router.post("/orders/update/:id", requireLogin, orderController.updateOrder);

// Delete order (Requires user to be logged in)
router.get("/orders/delete/:id", requireLogin, orderController.deleteOrder);
router.post("/orders/delete/:id", requireLogin, orderController.deleteOrder);

module.exports = router;
