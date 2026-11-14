
const Vendor = require("../models/vendor.models");

// APPLY TO BECOME A VENDOR
const applyAsVendor = async (req, res) => {
  try {
    const { storeName, description } = req.body;

    // Get the logged-in user's ID from the authentication middleware
    const userId = req.user.id;

    // Check if the user already has a vendor application
    const existingApplication = await Vendor.findOne({ user: userId });

    if (existingApplication) {
      return res.status(409).json({
        message: "You have already submitted a vendor application",
      });
    }

    // Generate a URL-friendly slug from the store name
    const slug = storeName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Check if the store name/slug is already taken
    const existingStore = await Vendor.findOne({ slug });

    if (existingStore) {
      return res.status(409).json({
        message: "This store name is already taken",
      });
    }

    // Create the vendor application
    const application = await Vendor.create({
      user: userId,
      storeName,
      slug,
      description,
      status: "pending",
    });

    return res.status(201).json({
      message: "Vendor application submitted successfully",
      application,
    });
  } catch (error) {
    console.error("Vendor application error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = { applyAsVendor };
