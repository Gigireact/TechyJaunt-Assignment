
const express = require("express");
const router = express.Router();

const authenticateUser = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

const {
  createProduct,
    getMyProducts,
    updateProduct,
    deleteProduct,
    getAllProducts,
    getSingleProduct
} = require("../controllers/product.controllers");


router.post(
  "/",
  authenticateUser,
  authorizeRoles("vendor"),
  createProduct
);

router.patch(
  "/:id",
  authenticateUser,
  authorizeRoles("vendor"),
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
  deleteProduct
);

router.get("/", getAllProducts);

router.get("/:id", getSingleProduct);

module.exports = router;
