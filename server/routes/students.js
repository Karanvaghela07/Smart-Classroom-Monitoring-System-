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

// -------------------------------
// LOCAL UPLOAD DIRECTORY
// -------------------------------
const photosDir = path.join(__dirname, "../uploads/student_photos");
if (!fs.existsSync(photosDir)) fs.mkdirSync(photosDir, { recursive: true });

// -------------------------------
// CLOUDINARY CONFIG (OPTIONAL)
// -------------------------------
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// -------------------------------
// HYBRID STORAGE: Cloudinary OR Local
// -------------------------------
let storage;

if (process.env.USE_CLOUDINARY === "true") {
  console.log("⚡ Using Cloudinary storage");
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "scms_students",
      format: async () => "jpg",
      public_id: (req, file) => {
        const id = req.body.student_id.trim();
        const name = req.body.name.trim().replace(/\s+/g, "_");
        return `${id}_${name}`;
      },
    },
  });
} else {
  console.log("📁 Using Local storage");
  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, photosDir),
    filename: (req, file, cb) => {
      const id = req.body.student_id.trim();
      const name = req.body.name.trim().replace(/\s+/g, "_");
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${id}_${name}${ext}`);
    },
  });
}

const upload = multer({ storage });

// -------------------------------
// GET all students
// -------------------------------
router.get("/", async (req, res) => {
  try {
    const students = await Student.find().sort({ name: 1 });
    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching students" });
  }
});

// -------------------------------
// ADD STUDENT + LOGIN
// -------------------------------
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

    // CLOUDINARY → req.file.path
    // LOCAL → req.file.filename
    const photo =
      process.env.USE_CLOUDINARY === "true"
        ? req.file?.path || ""
        : req.file?.filename || "";

    const joinDate = new Date().toISOString().slice(0, 10);

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

    // Create Student Login
    const defaultPassword = student_id;
    const hashed = await bcrypt.hash(defaultPassword, 10);

    await User.create({
      username: student_id.toLowerCase(),
      password: hashed,
      role: "student",
      studentId: student_id,
      name,
    });

    // ---------------------------
    // PYTHON ENCODING (LOCAL ONLY)
    // ---------------------------
    if (process.env.USE_CLOUDINARY !== "true" && req.file) {
      try {
        const photoPath = path.join(
          __dirname,
          "../uploads/student_photos",
          req.file.filename
        );

        const studentId = req.body.student_id;
        const cleanName = `${studentId}_${req.body.name.replace(/\s+/g, "")}`;

        const python = spawn("python", [
          path.join(__dirname, "../python/encode_single.py"),
          photoPath,
          studentId,
          cleanName,
        ]);

        python.stdout.on("data", (d) =>
          console.log("ENCODE OUT:", d.toString())
        );
        python.stderr.on("data", (d) =>
          console.log("ENCODE ERR:", d.toString())
        );
      } catch (err) {
        console.error("Encoding failed:", err);
      }
    }

    // Emit update
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
      login: { username: student_id, password: defaultPassword },
    });
  } catch (err) {
    console.error("Error adding student:", err);
    res.status(500).json({ success: false, message: "Error adding student" });
  }
});

module.exports = router;
