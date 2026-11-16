const User = require("../models/user.models");
const Vendor = require("../models/vendor.models");

// GET ALL PENDING VENDOR APPLICATIONS
const getPendingVendorApplications = async (req, res) => {
  try {
    const applications = await Vendor.find({ status: "pending" })
      .populate("user", "firstName lastName email")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      message: "Pending vendor applications retrieved successfully",
      total: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Get pending applications error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


// APPROVE VENDOR APPLICATION
const approveVendorApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Vendor.findById(id);

    if (!application) {
      return res.status(404).json({
        message: "Vendor application not found",
      });
    }

    if (application.status !== "pending") {
      return res.status(409).json({
        message: "This application has already been reviewed",
      });
    }

    const user = await User.findById(application.user);

    if (!user) {
      return res.status(404).json({
        message: "Applicant account not found",
      });
    }

    // Add vendor role without removing existing roles
    await User.findByIdAndUpdate(application.user, {
      $addToSet: { roles: "vendor" },
    });

    application.status = "approved";
    application.approvedAt = new Date();
    application.approvedBy = req.user.id;

    await application.save();

    return res.status(200).json({
      message: "Vendor application approved successfully",
      application,
    });
  } catch (error) {
    console.error("Approve vendor error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


// REJECT VENDOR APPLICATION
const rejectVendorApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({
        message: "Please provide a reason for rejecting this application",
      });
    }

    const application = await Vendor.findById(id);

    if (!application) {
      return res.status(404).json({
        message: "Vendor application not found",
      });
    }

    if (application.status !== "pending") {
      return res.status(409).json({
        message: "This application has already been reviewed",
      });
    }

    application.status = "rejected";
    application.rejectionReason = rejectionReason.trim();

    await application.save();

    return res.status(200).json({
      message: "Vendor application rejected successfully",
      application,
    });
  } catch (error) {
    console.error("Reject vendor error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};



module.exports = {
  getPendingVendorApplications,
  approveVendorApplication,
  rejectVendorApplication
};

