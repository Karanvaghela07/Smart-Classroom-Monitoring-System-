require("dotenv").config();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("./models/User");

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔗 Connected to MongoDB");

    const username = "admin";
    const password = "admin123"; // change later
    const role = "admin";

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hash,
      role
    });

    console.log("✅ Admin created successfully:");
    console.log(user);
    process.exit(0);

  } catch (err) {
    console.error("❌ Error creating admin:", err);
    process.exit(1);
  }
}

createAdmin();
