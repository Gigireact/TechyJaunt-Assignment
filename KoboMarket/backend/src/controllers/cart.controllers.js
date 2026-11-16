const Cart = require("../models/cart.models");
const Product = require("../models/product.models");

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    if (!productId || quantity === undefined) {
      return res.status(400).json({
        message: "Please provide a product ID and quantity",
      });
    }

    if (!Number.isSafeInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        message: "Quantity must be a positive whole number",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      status: "active",
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found or unavailable",
      });
    }

    if (quantity > product.stockQuantity) {
      return res.status(400).json({
        message: "Requested quantity exceeds available stock",
      });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [{ product: productId, quantity }],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;

        if (newQuantity > product.stockQuantity) {
          return res.status(400).json({
            message: "Requested quantity exceeds available stock",
          });
        }

        existingItem.quantity = newQuantity;
      } else {
        cart.items.push({
          product: productId,
          quantity,
        });
      }

      await cart.save();
    }

    await cart.populate("items.product", "name priceKobo images stockQuantity");

    return res.status(200).json({
      message: "Product added to cart successfully",
      cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId }).populate(
      "items.product",
      "name priceKobo images stockQuantity status"
    );

    if (!cart) {
      return res.status(200).json({
        message: "Your cart is empty",
        totalItems: 0,
        totalAmountKobo: 0,
        items: [],
      });
    }

    const originalLength = cart.items.length;

    cart.items = cart.items.filter((item) => item.product !== null);

    if (cart.items.length !== originalLength) {
      await cart.save();
    }

    let totalItems = 0;
    let totalAmountKobo = 0;

    const items = cart.items.map((item) => {
      const product = item.product;

      const isActive = product.status === "active";
      const hasEnoughStock = product.stockQuantity >= item.quantity;

      const available = isActive && hasEnoughStock;

      const subtotalKobo = available
        ? product.priceKobo * item.quantity
        : 0;

      if (available) {
        totalItems += item.quantity;
        totalAmountKobo += subtotalKobo;
      }

      return {
        product,
        quantity: item.quantity,
        available,
        availabilityMessage: !isActive
          ? "This product is no longer available"
          : !hasEnoughStock
            ? "Requested quantity exceeds available stock"
            : "Available",
        subtotalKobo,
      };
    });

    return res.status(200).json({
      message: "Cart retrieved successfully",
      totalItems,
      totalAmountKobo,
      items,
    });
  } catch (error) {
    console.error("Get cart error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};



const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    if (!Number.isSafeInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        message: "Quantity must be a positive whole number",
      });
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    const cartItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({
        message: "Product not found in your cart",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      status: "active",
    });

    if (!product) {
      return res.status(404).json({
        message: "Product is no longer available",
      });
    }

    if (quantity > product.stockQuantity) {
      return res.status(400).json({
        message: "Requested quantity exceeds available stock",
      });
    }

    cartItem.quantity = quantity;

    await cart.save();

    await cart.populate(
      "items.product",
      "name priceKobo images stockQuantity"
    );

    return res.status(200).json({
      message: "Cart quantity updated successfully",
      cart,
    });
  } catch (error) {
    console.error("Update cart item error:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    const itemExists = cart.items.some(
      (item) => item.product.toString() === productId
    );

    if (!itemExists) {
      return res.status(404).json({
        message: "Product not found in your cart",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    await cart.populate(
      "items.product",
      "name priceKobo images stockQuantity"
    );

    return res.status(200).json({
      message: "Product removed from cart successfully",
      cart,
    });
  } catch (error) {
    console.error("Remove cart item error:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    cart.items = [];

    await cart.save();

    return res.status(200).json({
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    console.error("Clear cart error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};





module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
