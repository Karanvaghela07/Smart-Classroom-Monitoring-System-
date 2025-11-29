const mongoose = require("mongoose");

const LoginSchema = new mongoose.Schema(
  {
    username: String,
    role: String,
    datetime: String,
    ip: String,
    success: Boolean
  },
  { timestamps: true }
);

module.exports = mongoose.model("Login", LoginSchema);
