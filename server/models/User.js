const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // hashed
    role: { type: String, required: true }, // admin | student
    studentId: { type: String, default: null }, // link to student
    name: { type: String, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
