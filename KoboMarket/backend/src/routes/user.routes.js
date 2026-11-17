const express = require("express");
const router = express.Router();

const {
  signUp,
  login,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  getMe,
} = require("../controllers/user.controllers");

const authenticateUser = require("../middlewares/auth.middleware");

router.post("/signup", signUp);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", authenticateUser, getMe);

module.exports = router;