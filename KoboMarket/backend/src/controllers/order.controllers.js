
const crypto = require("crypto");

const Order = require("../models/order.models");
const Cart = require("../models/cart.models");

const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { deliveryAddress } = req.body;

    // Validate delivery address
    if (
      !deliveryAddress ||
      typeof deliveryAddress !== "string" ||
      !deliveryAddress.trim()
    ) {
      return res.status(400).json({
        message: "Please provide a delivery address",
      });
    }

    // Retrieve the user's cart and populate product details
    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "name priceKobo images stockQuantity status vendor",
      populate: {
        path: "vendor",
        select: "status",
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Your cart is empty",
      });
    }

    let subtotalKobo = 0;
    const orderItems = [];

    // Validate each product and prepare order items
    for (const item of cart.items) {
      const product = item.product;

      if (!product) {
        return res.status(400).json({
          message: "One or more products in your cart no longer exist",
        });
      }

      if (product.status !== "active") {
        return res.status(400).json({
          message: `${product.name} is no longer available`,
        });
      }

      if (!product.vendor || product.vendor.status !== "approved") {
        return res.status(400).json({
          message: `${product.name} is from an unavailable vendor`,
        });
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`,
        });
      }

      const itemSubtotal = product.priceKobo * item.quantity;

      if (!Number.isSafeInteger(itemSubtotal)) {
        return res.status(400).json({
          message: "Order amount is too large",
        });
      }

      subtotalKobo += itemSubtotal;

      orderItems.push({
        product: product._id,
        vendor: product.vendor._id,
        name: product.name,
        images: product.images.map((image) => image.url),
        quantity: item.quantity,
        priceKobo: product.priceKobo,
      });
    }

    if (!Number.isSafeInteger(subtotalKobo)) {
      return res.status(400).json({
        message: "Order total is too large",
      });
    }

    // Delivery fee is currently zero
    const deliveryFeeKobo = 0;
    const totalAmountKobo = subtotalKobo + deliveryFeeKobo;

    const order = await Order.create({
      orderNumber: `KBO-${crypto.randomBytes(6).toString("hex").toUpperCase()}`,
      user: userId,
      items: orderItems,
      subtotalKobo,
      deliveryFeeKobo,
      totalAmountKobo,
      deliveryAddress: deliveryAddress.trim(),
    });

    return res.status(201).json({
      message: "Order created successfully. Proceed to payment.",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid order information",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .select("-__v");

    return res.status(200).json({
      message: "Orders retrieved successfully",
      totalOrders: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get my orders error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.status(200).json({
      message: "Order retrieved successfully",
      order,
    });
  } catch (error) {
    console.error("Get order by ID error:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.orderStatus !== "pending") {
      return res.status(400).json({
        message: "Only pending orders can be cancelled",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        message: "Paid orders cannot be cancelled through this endpoint",
      });
    }

    order.orderStatus = "cancelled";
    await order.save();

    return res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};




module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
};
