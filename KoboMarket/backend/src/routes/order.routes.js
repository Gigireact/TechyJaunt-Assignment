
const express = require("express");
const router = express.Router();

const authenticateUser = require("../middlewares/auth.middleware");

const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
} = require("../controllers/order.controllers");

// Create a new order
router.post("/", authenticateUser, createOrder);

// Get all orders belonging to the logged-in customer
router.get("/", authenticateUser, getMyOrders);

// Get one specific order
router.get("/:orderId", authenticateUser, getOrderById);
// Cancel a pending order
router.patch("/:orderId/cancel", authenticateUser, cancelOrder);

module.exports = router;
