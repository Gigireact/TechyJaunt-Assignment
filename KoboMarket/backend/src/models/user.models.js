const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const addressSchema = new Schema({
    line1: {
        type: String,
        maxlength: 120,
        default: ''
    },
    city: {
        type: String,
        maxlength: 80,
        default: ''
    },
    state: {
        type: String,
        maxlength: 80,
        default: ''
    },
    country: {
        type: String,
        maxlength: 80,
        default: ''
    },
    postalCode: {
        type: String,
        maxlength: 20,
        default: ''
    }
}, { _id: false });

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    phoneNumber: {
      type: String,
      trim: true,
    },

    roles: {
      type: [String],
      enum: ["buyer", "vendor", "admin"],
      default: ["buyer"],
    },

    address: {
      type: addressSchema,
      default: undefined,
    },

    profilePictureUrl: {
      type: String,
      default: null,
    },
    profilePicturePublicId: {
      type: String,
      default: null,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    otpHash: {
      type: String,
      default: null,
    },
    otpPurpose: {
      type: String,
      enum: ["verify-email", "reset-password", null],
      default: null,
    },
    otpExpiresAt: {
      type: Date,
      default: null,
    },
    otpSentAt: {
      type: Date,
      default: null,
    },
    otpAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    isFrozen: {
      type: Boolean,
      default: false,
    },

    refreshTokens: [
      {
        tokenHash: {
          type: String,
          required: true,
        },
        expiresAt: {
          type: Date,
          required: true,
        },
      },
    ],
  },
  { timestamps: true, versionKey: false },
);

const User = mongoose.model("User", userSchema);

module.exports = User;
