
const express = require("express");
const router = express.Router();

const authenticateUser = require("../middlewares/auth.middleware");
const { addToCart } = require("../controllers/cart.controllers");

router.post("/add", authenticateUser, addToCart);

module.exports = router;
