
const express = require("express");
const router = express.Router();

const authenticateUser = require("../middlewares/auth.middleware");
const { addToCart, getCart, updateCartItem, removeCartItem, clearCart, } = require("../controllers/cart.controllers");

router.post("/add", authenticateUser, addToCart);
router.get("/", authenticateUser, getCart);
router.patch(
  "/:productId",
  authenticateUser,
  updateCartItem
);
router.delete(
  "/:productId",
  authenticateUser,
  removeCartItem
);
router.delete(
  "/",
  authenticateUser,
  clearCart
);
module.exports = router;
