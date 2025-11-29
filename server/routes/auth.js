const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");     // Admin users
const Student = require("../models/Student"); // Student details stored here
const Login = require("../models/Login");

// ---------------------------------------------
// ⭐ POST: LOGIN (ADMIN + STUDENT)
// ---------------------------------------------
router.post("/login", async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.json({
      success: false,
      message: "Username, password, and role are required",
    });
  }

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const inputRole = role.toLowerCase();
  const inputName = username.trim().toLowerCase();

  // ---------------------------------------------
  // 🔹 STUDENT LOGIN USING STUDENT COLLECTION
  // ---------------------------------------------
  if (inputRole === "student") {
    // Find student by NAME
    const student = await Student.findOne({
      name: { $regex: new RegExp(`^${inputName}$`, "i") }
    });

    if (!student) {
      await Login.create({
        username,
        role,
        datetime: new Date().toISOString(),
        ip,
        success: false
      });

      return res.json({
        success: false,
        message: "Student not found"
      });
    }

    // Default password check
    if (password !== "student123") {
      return res.json({
        success: false,
        message: "Incorrect password",
      });
    }

    // Generate student JWT
    const token = jwt.sign(
      {
        name: student.name,
        role: "student",
        studentId: student.studentId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    // Log entry
    await Login.create({
      username: student.name,
      role: "student",
      datetime: new Date().toISOString(),
      ip,
      success: true
    });

    return res.json({
      success: true,
      user: {
        name: student.name,
        role: "student",
        studentId: student.studentId,
        token,
      },
    });
  }


  // ---------------------------------------------
  // 🔹 ADMIN LOGIN (USERS TABLE)
  // ---------------------------------------------
  const admin = await User.findOne({ username: inputName, role: inputRole });

  if (!admin) {
    await Login.create({
      username,
      role,
      datetime: new Date().toISOString(),
      ip,
      success: false
    });

    return res.json({ success: false, message: "Admin user not found" });
  }

  // Check password
  const match = await bcrypt.compare(password, admin.password);
  if (!match) {
    return res.json({ success: false, message: "Wrong password" });
  }

  // Generate admin JWT
  const token = jwt.sign(
    {
      username: admin.username,
      role: admin.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "2d" }
  );

  return res.json({
    success: true,
    user: {
      username: admin.username,
      role: admin.role,
      token,
    },
  });
});


// ---------------------------------------------
// ⭐ REGISTER ADMIN ACCOUNT
// ---------------------------------------------
router.post("/register", async (req, res) => {
  const { username, password, role, name } = req.body;

  if (!username || !password || !role) {
    return res.json({
      success: false,
      message: "All fields required",
    });
  }

  const exists = await User.findOne({ username });
  if (exists) return res.json({ success: false, message: "User already exists" });

  const hashed = await bcrypt.hash(password, 10);

  await User.create({
    username: username.toLowerCase(),
    password: hashed,
    role: role.toLowerCase(),
    name: name || null,
  });

  res.json({ success: true, message: "Admin registered successfully" });
});

module.exports = router;
