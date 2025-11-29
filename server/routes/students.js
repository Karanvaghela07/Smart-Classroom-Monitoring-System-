const bcrypt = require("bcrypt");
const User = require("../models/User");
const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { spawn } = require("child_process");
const Student = require("../models/Student");
const auth = require("../middleware/auth");


const photosDir = path.join(__dirname, "../uploads/student_photos");
if (!fs.existsSync(photosDir)) fs.mkdirSync(photosDir, { recursive: true });

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, photosDir),
  filename: (req, file, cb) => {
    const id = (req.body.student_id || "student").trim();
    const name = (req.body.name || "name").trim();

    // Make filename perfectly consistent
    const safeId = id.toUpperCase().replace(/\s+/g, "");
    const safeName = name.replace(/\s+/g, "_");
    const ext = path.extname(file.originalname).toLowerCase();

    // Final filename format
    const finalName = `${safeId}_${safeName}${ext}`;
    cb(null, finalName);
  }
});


const upload = multer({ storage });

// GET all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find().sort({ name: 1 });
    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching students" });
  }
});

// ADD student
// --------------------------------------
// ADD STUDENT (NOW ALSO CREATES USER LOGIN)
// --------------------------------------
router.post("/add", auth, upload.single("photo"), async (req, res) => {
  try {
    const {
      name,
      student_id,
      email,
      phone,
      department,
      year,
      rollNo,
      dateOfBirth,
      address,
    } = req.body;

    const photo = req.file ? req.file.filename : "";
    const joinDate = new Date().toISOString().slice(0, 10);

    // Check duplicate student
    const exists = await Student.findOne({ studentId: student_id });
    if (exists) {
      return res.json({ success: false, message: "Student already exists" });
    }

    // Save Student
    await Student.create({
      studentId: student_id,
      name,
      email,
      phone,
      department,
      year,
      rollNo,
      dateOfBirth,
      address,
      photo,
      joinDate,
    });

    

    // 🔥 CREATE USER ACCOUNT FOR STUDENT
    const defaultPassword = student_id; // student will login using studentId
    const hashed = await bcrypt.hash(defaultPassword, 10);

    await User.create({
      username: student_id.toLowerCase(),
      password: hashed,
      role: "student",
      studentId: student_id,
      name,
    });

    console.log(`👤 Student user created: ${student_id}`);
    // After Student.create(...)
try {
  if (req.file) {
    const { spawn } = require("child_process");
    const path = require("path");

    const photoPath = path.join(
      __dirname,
      "../uploads/student_photos",
      req.file.filename
    );

    const studentId = req.body.student_id;
    const name = `${studentId}_${req.body.name.replace(/\s+/g, "")}`;

    const python = spawn("python", [
      path.join(__dirname, "../python/encode_single.py"),
      photoPath,
      studentId,
      name,
    ]);

    python.stdout.on("data", (data) => {
      console.log("ENCODE OUT:", data.toString());
    });

    python.stderr.on("data", (data) => {
      console.log("ENCODE ERR:", data.toString());
    });
  }
} catch (err) {
  console.error("Encoding failed:", err);
}

    // Realtime emit
    try {
      if (req.io) {
        req.io.emit("students_updated", { student_id, name });
      }
    } catch (e) {
      console.log("Realtime update skipped:", e.message);
    }

    res.json({
      success: true,
      message: "Student added + login created",
      login: {
        username: student_id,
        password: defaultPassword,
      },
    });

  } catch (err) {
    console.error("Error adding student:", err);
    res.status(500).json({ success: false, message: "Error adding student" });
  }
});

module.exports = router;
