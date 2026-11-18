const Joi = require("joi");

// Signup validation
const signupSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required(),
  lastName: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(8).required(),
});

// Login validation
const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});

// OTP verification validation
const verifyOtpSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  otp: Joi.string().length(6).required(),
});

// Resend OTP validation
const resendOtpSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
});

// Forgot password validation
const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
});

// Reset password validation
const resetPasswordSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  otp: Joi.string().length(6).required(),
  newPassword: Joi.string().min(8).required(),
});

module.exports = {
  signupSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};