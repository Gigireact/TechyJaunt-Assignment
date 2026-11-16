const express = require("express");
const router = express.Router();

const authenticateUser = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

const {
  getPendingVendorApplications,
    approveVendorApplication,
    rejectVendorApplication
} = require("../controllers/admin.controllers");

// Protect every route below this point
router.use(authenticateUser, authorizeRoles("admin"));

// GET ALL PENDING VENDOR APPLICATIONS
router.get("/vendors/pending", getPendingVendorApplications);
router.patch("/vendors/:id/approve", approveVendorApplication);
router.patch("/vendors/:id/reject", rejectVendorApplication);

module.exports = router;
