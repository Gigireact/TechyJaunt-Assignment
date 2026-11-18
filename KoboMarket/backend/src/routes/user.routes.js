const express = require("express");
const router = express.Router();
const validate = require("../middlewares/validate.middleware");

const {
  signupSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../validators/user.validator");

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

router.post("/signup", validate(signupSchema), signUp);
router.post("/login", validate(loginSchema), login);
router.post("/verify-otp", validate(verifyOtpSchema), verifyOtp);
router.post("/resend-otp", validate(resendOtpSchema), resendOtp);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.get("/me", authenticateUser, getMe);

module.exports = router;