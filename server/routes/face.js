// server/routes/face.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const Attendance = require("../models/Attendance");

const tempDir = path.join(__dirname, "../temp");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

const storage = multer.diskStorage({
  destination: tempDir,
  filename: (_, file, cb) => cb(null, `${Date.now()}_${Math.floor(Math.random()*10000)}.jpg`),
});
const upload = multer({ storage });

// path to Python recognizer (keep same)
const PYTHON = path.join(__dirname, "../python/recognize.py");

// Small worker queue so we don't overload CPU when many frames arrive
const MAX_PARALLEL = 2;
let runningWorkers = 0;
const queue = [];

// helper date
const getTodayIso = () => new Date().toISOString().slice(0, 10);

// schedule worker
function schedule() {
  if (queue.length === 0 || runningWorkers >= MAX_PARALLEL) return;
  const job = queue.shift();
  runningWorkers++;
  runRecognizer(job.imgPath)
    .then((out) => job.resolve(out))
    .catch((err) => job.reject(err))
    .finally(() => {
      runningWorkers--;
      schedule();
    });
}

// spawn python and parse output
function runRecognizer(imgPath) {
  return new Promise((resolve, reject) => {
    const python = spawn("python", [PYTHON, imgPath]);
    let stdout = "";
    let stderr = "";

    python.stdout.on("data", (d) => (stdout += d.toString()));
    python.stderr.on("data", (d) => (stderr += d.toString()));
    python.on("error", (err) => (stderr += err.message));
    python.on("close", (code) => {
      // delete image file asap
      try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch (_) {}

      if (!stdout) {
        return reject(new Error("No output from recognizer: " + stderr));
      }

      let result;
      try {
        result = JSON.parse(stdout);
      } catch (e) {
        return reject(new Error("Invalid JSON from recognizer: " + stdout));
      }

      resolve(result);
    });
  });
}

// POST /face/recognize
router.post("/recognize", upload.single("frame"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No image sent" });
  }

  const session = req.query.session || "default";
  const imgPath = req.file.path;

  // enqueue job
  const jobPromise = new Promise((resolve, reject) => {
    queue.push({ imgPath, resolve, reject });
    schedule();
  });

  try {
    const result = await jobPromise;

    if (!result || !Array.isArray(result.recognized)) {
      return res.status(500).json({
        success: false,
        message: result && result.error ? result.error : "Invalid recognition output",
        data: { recognized: [] },
      });
    }

    const recognized = result.recognized;
    if (recognized.length === 0) {
      return res.json({ success: false, message: "No faces recognized", data: { recognized: [] } });
    }

    const today = getTodayIso();
    const newlyMarkedIds = [];
    const alreadyMarkedIds = [];

    // iterate and mark attendance for all recognized faces
    for (const r of recognized) {
      const studentId = String(r.studentId || "").trim();
      const name = r.name || "Unknown";

      if (!studentId || studentId === "-" || studentId === "undefined") {
        console.log("Skipping invalid studentId for recognized item:", r);
        continue;
      }

      try {
        const exists = await Attendance.findOne({ studentId, date: today, session });
        if (!exists) {
          await Attendance.create({
            studentId,
            name,
            date: today,
            time: new Date().toLocaleTimeString(),
            markedBy: "Camera",
            session,
          });
          newlyMarkedIds.push(studentId);
          console.log(`Marked: ${name} (${studentId})`);
        } else {
          alreadyMarkedIds.push(studentId);
          console.log(`Already marked: ${name} (${studentId})`);
        }
      } catch (err) {
        console.error("Error marking attendance for", studentId, err);
      }
    }

    // emit socket if available
    if (req.app && req.app.get("io")) {
      req.app.get("io").emit("attendance_updated");
    }

    return res.json({
      success: true,
      message: `Recognized ${recognized.length} face(s), marked ${newlyMarkedIds.length}`,
      data: { recognized },
      newlyMarkedIds,
      alreadyMarkedIds,
    });
  } catch (err) {
    console.error("Recognition route error:", err);
    // ensure temp file removed if job errored before deletion
    try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch (_) {}
    return res.status(500).json({
      success: false,
      message: "Server error during recognition",
      error: err.message || String(err),
    });
  }
});

module.exports = router;
