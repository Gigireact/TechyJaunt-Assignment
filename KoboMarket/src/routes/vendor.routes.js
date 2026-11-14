const express = require("express");
const router = express.Router();

const authenticateUser = require("../middlewares/auth.middleware");
const { applyAsVendor } = require("../controllers/vendor.controllers");

router.post("/apply", authenticateUser, applyAsVendor);

module.exports = router;