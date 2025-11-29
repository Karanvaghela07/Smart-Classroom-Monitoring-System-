// routes/attendance.js
const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");

// Helper: Today in YYYY-MM-DD format
const getTodayIso = () => new Date().toISOString().slice(0, 10);

// --------------------------------------------------------
// POST: Mark attendance (Once per day per student per session)
// --------------------------------------------------------
router.post("/mark", async (req, res) => {
  try {
    const { studentId, name, session: bodySession } = req.body;

    if (!studentId || !name) {
      return res.status(400).json({
        success: false,
        message: "studentId and name are required",
      });
    }

    const todayIso = getTodayIso();
    const session = bodySession || req.query.session || "default";

    // Check if already marked today in this session
    const existing = await Attendance.findOne({
      studentId: String(studentId),
      date: todayIso,
      session,
    });

    if (existing) {
      return res.json({
        success: true,
        message: "Already marked for today (this session)",
        already: true,
      });
    }

    const time = new Date().toLocaleTimeString();

    // Insert into MongoDB
    await Attendance.create({
      studentId: String(studentId),
      name,
      date: todayIso,
      time,
      markedBy: "Camera",
      session,
    });

    // Emit socket event
    if (req.io) req.io.emit("attendance_updated");

    return res.json({
      success: true,
      newlyMarked: true,
      message: "Attendance marked",
    });
  } catch (err) {
    console.error("Mark error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// --------------------------------------------------------
// GET: Today’s attendance (Role-aware, all sessions for today)
// --------------------------------------------------------
router.get("/today", async (req, res) => {
  try {
    const today = getTodayIso();

    let query = { date: today };

    // 🔒 Students can only access their own records
    if (req.user && req.user.role === "student" && req.studentId) {
      query.studentId = req.studentId;
    }

    const records = await Attendance.find(query).sort({
      time: -1,
    });

    return res.json({
      success: true,
      count: records.length,
      today: records,
    });
  } catch (err) {
    console.error("Today fetch error:", err);
    return res.status(500).json({
      success: false,
      message: "Error loading today's attendance",
    });
  }
});

// --------------------------------------------------------
// GET: Full Attendance History (Role-aware)
// --------------------------------------------------------
router.get("/history", async (req, res) => {
  try {
    let query = {};

    // 🔒 Student can only see their own records
    if (req.user && req.user.role === "student" && req.studentId) {
      query.studentId = req.studentId;
    }

    const records = await Attendance.find(query).sort({
      date: -1,
      time: -1,
    });

    return res.json({
      success: true,
      count: records.length,
      history: records,
    });
  } catch (err) {
    console.error("History error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
