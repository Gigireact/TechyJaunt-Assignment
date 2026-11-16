
const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
  try {
    // Get the token from the request headers
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required. Please log in.",
      });
    }

    // Extract the actual token
    const token = authHeader.split(" ")[1];

    // Verify the token
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    // Attach the decoded user details to the request
    req.user = decoded;

    // Allow the request to continue
    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired access token",
    });
  }
};

module.exports = authenticateUser;
