const express = require("express");
const router = express.Router();

const authenticateUser = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");

const { applyAsVendor } = require("../controllers/vendor.controllers");
const { vendorApplicationSchema } = require("../validators/vendor.validator");

router.post(
  "/apply",
  authenticateUser,
  validate(vendorApplicationSchema),
  applyAsVendor
);

module.exports = router;