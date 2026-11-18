const express = require("express");
const router = express.Router();

const authenticateUser = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate.middleware");

const {
  createProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct
} = require("../controllers/product.controllers");

const {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
  getAllProductsSchema
} = require("../validators/product.validator");

router.post(
  "/",
  authenticateUser,
  authorizeRoles("vendor"),
  validate(createProductSchema),
  createProduct
);

router.patch(
  "/:id",
  authenticateUser,
  authorizeRoles("vendor"),
  validate(productIdSchema, "params"),
  validate(updateProductSchema),
  updateProduct
);

router.get(
  "/my-products",
  authenticateUser,
  authorizeRoles("vendor"),
  getMyProducts
);

router.delete(
  "/:id",
  authenticateUser,
  authorizeRoles("vendor"),
  validate(productIdSchema, "params"),
  deleteProduct
);

router.get(
  "/",
  validate(getAllProductsSchema, "query"),
  getAllProducts
);
router.get(
  "/:id",
  validate(productIdSchema, "params"),
  getSingleProduct
);

module.exports = router;