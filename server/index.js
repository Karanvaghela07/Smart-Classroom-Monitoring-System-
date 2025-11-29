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

// 🔗 CONNECT TO MONGODB
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

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth middleware
const auth = require("./middleware/auth");

// --------------------------------------
// STATIC FILES & FOLDERS
// --------------------------------------
const ensure = (p) => !fs.existsSync(p) && fs.mkdirSync(p, { recursive: true });

ensure(path.join(__dirname, "uploads"));
ensure(path.join(__dirname, "uploads/student_photos"));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --------------------------------------
// SOCKET CONFIG
// --------------------------------------
const io = new Server(server, {
  cors: { origin: "http://localhost:5173" },
});
app.set("io", io);

// --------------------------------------
// ROUTES
// --------------------------------------
app.use("/api/auth", require("./routes/auth")); // Public
app.use("/api/students", auth, require("./routes/students")); // Protected
app.use("/api/attendance", auth, require("./routes/attendance")); // Protected
app.use("/api/face", auth, require("./routes/face")); // Protected
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
server.listen(process.env.PORT || 5000, () =>
  console.log(`🚀 Server running at http://localhost:${process.env.PORT || 5000}`)
);
