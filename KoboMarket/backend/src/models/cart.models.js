const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    // Each cart belongs to one user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Products added to the cart
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
          validate: {
            validator: Number.isSafeInteger,
            message: "Quantity must be a whole number",
          },
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
