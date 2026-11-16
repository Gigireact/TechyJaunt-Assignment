const mongoose = require("mongoose");
require("dotenv").config();

const url = process.env.MONGODB_URI;


const connectDB = async () => {
  try {
    await mongoose.connect(url)
    console.log("MongoDB connected successfully");
    } catch (error) {
      console.log( error);
      process.exit(1);
    }
};

module.exports = connectDB;