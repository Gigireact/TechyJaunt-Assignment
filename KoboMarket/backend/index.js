const express = require('express');
const connectDB = require("./src/configs/db");
const morgan = require("morgan");
const cors = require("cors");

require("dotenv").config();

const app = express();
const userRoutes = require("./src/routes/user.routes");
const vendorRoutes = require("./src/routes/vendor.routes");
const adminRoutes = require("./src/routes/admin.routes");
const productRoutes = require("./src/routes/product.routes");
const cartRoutes = require("./src/routes/cart.routes");
const orderRoutes = require("./src/routes/order.routes");

const PORT = process.env.PORT || 3000;

app.use(express.json());
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Idempotency-Key"],
}));
app.use(morgan("dev"));

connectDB();

app.get("/", (req, res) => {
  res.send("Hello, this is the Kobo Market API!");
});

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/vendor", vendorRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", orderRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});