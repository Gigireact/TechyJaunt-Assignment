const User = require("../models/user.models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const toPublicUser = require("../helpers/publicUser");
const { assignOtp, clearOtp, isOtpCoolingDown, checkOtp } = require("../helpers/otp");
const { sendOtpEmail, sendLoginAlertEmail } = require("../helpers/userEmails");



const signUp = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    const otp = assignOtp(newUser, "verify-email");
    await newUser.save();

    try {
      await sendOtpEmail(newUser, otp, {
        subject: "Your verification code",
        heading: "Verify your email",
        purpose: "verify your email address",
      });
    } catch (error) {
      await User.deleteOne({ _id: newUser._id });
      throw error;
    }

    return res.status(201).json({
      message: "User created successfully. A verification code was sent to your email.",
      user: toPublicUser(newUser),
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error" });
  }
};



const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "This account uses Google sign-in",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message: "User is not verified",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    if (!process.env.ACCESS_TOKEN_SECRET) {
      throw new Error("ACCESS_TOKEN_SECRET is missing");
    }

    const accessToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        roles: user.roles,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    // Login notification is optional.
    // An email failure must not prevent successful login.
    try {
      await sendLoginAlertEmail(user, new Date().toUTCString());
    } catch (emailError) {
      console.error("Login notification email failed:", emailError.message);
    }

    return res.status(200).json({
      message: "Login successful",
      user: toPublicUser(user),
      accessToken,
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};




const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.isVerified) {
      return res.status(400).json({
        message: "Invalid or expired code",
      });
    }

    const result = checkOtp(user, String(otp), "verify-email");

    if (!result.ok) {
      if (result.failed) {
        await user.save();
      }

      return res.status(400).json({
        message: result.error,
      });
    }

    user.isVerified = true;
    clearOtp(user);
    await user.save();

    if (!process.env.ACCESS_TOKEN_SECRET) {
      throw new Error("ACCESS_TOKEN_SECRET is missing");
    }

    const accessToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        roles: user.roles,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    return res.status(200).json({
      message: "Email verified successfully",
      user: toPublicUser(user),
      accessToken,
    });

  } catch (error) {
    console.error("Email verification error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


const resendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.isVerified) {
      return res.status(200).json({
        message: "If an unverified account exists, a verification code was sent.",
      });
    }

    if (isOtpCoolingDown(user)) {
      return res.status(429).json({ message: "Please wait before requesting another code." });
    }

    const otp = assignOtp(user, "verify-email");
    await user.save();
    await sendOtpEmail(user, otp, {
      subject: "Your verification code",
      heading: "Verify your email",
      purpose: "verify your email address",
    });

    return res.status(200).json({
      message: "If an unverified account exists, a verification code was sent.",
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.isVerified) {
      return res.status(200).json({
        message: "If a verified account exists, a reset code was sent.",
      });
    }

    if (isOtpCoolingDown(user)) {
      return res.status(429).json({ message: "Please wait before requesting another code." });
    }

    const otp = assignOtp(user, "reset-password");
    await user.save();
    await sendOtpEmail(user, otp, {
      subject: "Your password reset code",
      heading: "Reset your password",
      purpose: "reset your password",
    });

    return res.status(200).json({
      message: "If a verified account exists, a reset code was sent.",
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.isVerified) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    const result = checkOtp(user, String(otp), "reset-password");
    if (!result.ok) {
      if (result.failed) {
        await user.save();
      }
      return res.status(400).json({ message: result.error });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    clearOtp(user);
    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User profile retrieved successfully",
      user: toPublicUser(user),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


module.exports = {
  signUp,
  login,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  getMe
};