const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true },
    name: String,
    email: String,
    phone: String,
    department: String,
    year: String,
    rollNo: String,
    dateOfBirth: String,
    address: String,
    photo: String,
    joinDate: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", StudentSchema);
