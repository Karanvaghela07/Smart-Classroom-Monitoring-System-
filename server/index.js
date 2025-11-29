require("dotenv").config();
const connectDB = require("./db");
const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const fs = require("fs");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Connect DB
connectDB();

const User = require("./models/User");
const bcrypt = require("bcrypt");

async function createDefaultAdmin() {
  const exists = await User.findOne({ role: "admin" });
  if (exists) return console.log("✔ Admin already exists");

  const hashed = await bcrypt.hash("admin123", 10);

  await User.create({
    username: "admin",
    password: hashed,
    role: "admin",
  });

  console.log("⚡ Default admin created (username: admin, pass: admin123)");
}

createDefaultAdmin();


// --------------------------------------
// ⭐ FINAL CORS FIX (WORKS FOR ALL ORIGINS)
// --------------------------------------
app.use(
  cors({
    origin: "*",              // ⭐ Allow all origins (Netlify + Render + localhost)
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: false        // ⭐ Must be false when using wildcard origin
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth Middleware
const auth = require("./middleware/auth");


// --------------------------------------
// STATIC FILES
// --------------------------------------
const ensure = (p) => !fs.existsSync(p) && fs.mkdirSync(p, { recursive: true });
ensure(path.join(__dirname, "uploads"));
ensure(path.join(__dirname, "uploads/student_photos"));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// --------------------------------------
// ⭐ SOCKET.IO FIX (Allow All Origins)
// --------------------------------------
const io = new Server(server, {
  cors: {
    origin: "*",               // ⭐ Allow all origins
    methods: ["GET", "POST"],
  },
});

app.set("io", io);
// Increase upload limit (critical for face recognition)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Allow uploads folder publicly
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// --------------------------------------
// ROUTES
// --------------------------------------
app.use("/api/auth", require("./routes/auth"));
app.use("/api/students", auth, require("./routes/students"));
app.use("/api/attendance", auth, require("./routes/attendance"));
app.use("/api/face", auth, require("./routes/face"));
app.use("/api/reports", auth, require("./routes/reports"));


// --------------------------------------
// HEALTH CHECK
// --------------------------------------
app.get("/", (req, res) => {
  res.json({ status: "Backend Running", database: "Mongo Connected!" });
});


// --------------------------------------
// START SERVER
// --------------------------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
