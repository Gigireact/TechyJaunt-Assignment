const User = require("../models/user.models");

const authorizeRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id)
        .select("roles isFrozen");

      if (!user) {
        return res.status(401).json({
          message: "User account not found",
        });
      }

      if (user.isFrozen) {
        return res.status(403).json({
          message: "Your account has been frozen",
        });
      }

      const hasPermission = allowedRoles.some((role) =>
        user.roles.includes(role)
      );

      if (!hasPermission) {
        return res.status(403).json({
          message: "You do not have permission to perform this action",
        });
      }

      next();
    } catch (error) {
      console.error("Authorization error:", error.message);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  };
};

module.exports = authorizeRoles;
