
require("dotenv").config();

const bcrypt = require("bcryptjs");
const User = require("../src/models/user.models");
const connectDB = require("../src/configs/db");

const createAdmin = async () => {
  try {
    await connectDB();

    const { ADMIN_FIRST_NAME, ADMIN_LAST_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } =
      process.env;

    if (!ADMIN_FIRST_NAME || !ADMIN_LAST_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error("Please provide all admin details in your .env file");
    }

    const existingAdmin = await User.findOne({
      email: ADMIN_EMAIL.toLowerCase(),
    });

      if (existingAdmin) {
        if (existingAdmin.roles.includes("admin")) {
          console.log("This account is already an admin.");
          return;
        }

      existingAdmin.roles.push("admin");
      await existingAdmin.save();

      console.log("Existing account successfully promoted to admin!");
      console.log("Admin email:", existingAdmin.email);
      return;
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    const admin = await User.create({
      firstName: ADMIN_FIRST_NAME,
      lastName: ADMIN_LAST_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      roles: ["admin"],
      isEmailVerified: true,
    });

    console.log("Admin account created successfully!");
    console.log("Admin email:", admin.email);
  } catch (error) {
    console.error("Admin seeder error:", error.message);
    process.exitCode = 1;
  } finally {
    await require("mongoose").disconnect();
  }
};

createAdmin();
