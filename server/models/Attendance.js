// models/Attendance.js (should already exist)
const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true },
    name: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    time: { type: String },
    markedBy: { type: String },
    session: { type: String, default: "default" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", AttendanceSchema);