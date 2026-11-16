const express = require('express');
const connectDB = require("./src/configs/db");
const morgan = require("morgan");

require("dotenv").config();

const app = express();
const userRoutes = require("./src/routes/user.routes");
const vendorRoutes = require("./src/routes/vendor.routes");
const adminRoutes = require("./src/routes/admin.routes");

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(morgan("dev"));

connectDB();

app.get("/", (req, res) => {
  res.send("Hello, this is the Kobo Market API!");
});

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/vendor", vendorRoutes);
app.use("/api/v1/admin", adminRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});