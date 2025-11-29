const express = require("express");
const router = express.Router();
const path = require("path");
const { readJSON, writeJSON } = require("../utils/file");

const settingsFile = path.join(__dirname, "../data/settings.json");

// Get all settings
router.get("/", (req, res) => {
  const settings = readJSON(settingsFile);
  res.json(settings);
});

// Update settings
router.post("/update", (req, res) => {
  writeJSON(settingsFile, req.body);
  res.json({ success: true });
});

module.exports = router;
