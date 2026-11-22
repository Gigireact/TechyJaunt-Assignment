const Product = require("../models/product.models");
const Vendor = require("../models/vendor.models");

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      priceKobo,
      stockQuantity,
    } = req.body;

    if (
      !name ||
      !description ||
      !category ||
      priceKobo === undefined ||
      stockQuantity === undefined
    ) {
      return res.status(400).json({
        message: "Please provide all required product details",
      });
    }

    if (!Number.isSafeInteger(priceKobo) || priceKobo <= 0) {
      return res.status(400).json({
        message: "Product price must be a positive whole number in kobo",
      });
    }

    if (!Number.isSafeInteger(stockQuantity) || stockQuantity < 0) {
      return res.status(400).json({
        message: "Stock quantity must be a non-negative whole number",
      });
    }

    const vendor = await Vendor.findOne({
      user: req.user.id,
      status: "approved",
    });

    if (!vendor) {
      return res.status(403).json({
        message: "You must have an approved vendor account to add products",
      });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const product = await Product.create({
      vendor: vendor._id,
      name,
      slug,
      description,
      category,
      priceKobo,
      stockQuantity,
    });

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "You already have a product with this name",
      });
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


const getMyProducts = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({
      user: req.user.id,
      status: "approved",
    });

    if (!vendor) {
      return res.status(403).json({
        message: "You must have an approved vendor account",
      });
    }

    const products = await Product.find({
      vendor: vendor._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Your products retrieved successfully",
      total: products.length,
      products,
    });
  } catch (error) {
    console.error("Get vendor products error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      category,
      priceKobo,
      stockQuantity,
      status,
    } = req.body;

    const vendor = await Vendor.findOne({
      user: req.user.id,
      status: "approved",
    });

    if (!vendor) {
      return res.status(403).json({
        message: "You must have an approved vendor account",
      });
    }

    const product = await Product.findOne({
      _id: id,
      vendor: vendor._id,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (
      priceKobo !== undefined &&
      (!Number.isSafeInteger(priceKobo) || priceKobo <= 0)
    ) {
      return res.status(400).json({
        message: "Price must be a positive whole number in kobo",
      });
    }

    if (
      stockQuantity !== undefined &&
      (!Number.isSafeInteger(stockQuantity) || stockQuantity < 0)
    ) {
      return res.status(400).json({
        message: "Stock quantity must be a non-negative whole number",
      });
    }

    if (
      status !== undefined &&
      !["active", "inactive"].includes(status)
    ) {
      return res.status(400).json({
        message: "Status must be active or inactive",
      });
    }

    if (name !== undefined) {
      product.name = name;
      product.slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }

    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;
    if (priceKobo !== undefined) product.priceKobo = priceKobo;
    if (stockQuantity !== undefined) product.stockQuantity = stockQuantity;
    if (status !== undefined) product.status = status;

    await product.save();

    return res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "A product with this name already exists in your store",
      });
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await Vendor.findOne({
      user: req.user.id,
      status: "approved",
    });

    if (!vendor) {
      return res.status(403).json({
        message: "You must have an approved vendor account",
      });
    }

    const product = await Product.findOne({
      _id: id,
      vendor: vendor._id,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (product.status === "inactive") {
      return res.status(409).json({
        message: "This product is already inactive",
      });
    }

    product.status = "inactive";
    await product.save();

    return res.status(200).json({
      message: "Product deactivated successfully",
      product,
    });
  } catch (error) {
    console.error("Deactivate product error:", error.message);

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


const getAllProducts = async (req, res) => {
  try {
    const { category, search, page: pageQuery, limit: limitQuery } =
    req.validated?.query || req.query;

    const page = Math.max(1, parseInt(pageQuery, 10) || 1);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(limitQuery, 10) || 10)
    );

    const skip = (page - 1) * limit;

    const filter = {
      status: "active",
    };

    if (category) {
      filter.category = new RegExp(`^${category}$`, "i");
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("vendor", "storeName slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Product.countDocuments(filter),
    ]);

    return res.status(200).json({
      message: "Products retrieved successfully",
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
      products,
    });
  } catch (error) {
    console.error("Get all products error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


// GET A SINGLE ACTIVE PRODUCT
const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      _id: id,
      status: "active",
    }).populate("vendor", "storeName slug description logo");

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message: "Product retrieved successfully",
      product,
    });
  } catch (error) {
    console.error("Get single product error:", error.message);

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
  



module.exports = {
  createProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
};
