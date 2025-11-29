// server/routes/reports.js
const express = require("express");
const router = express.Router();

const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const Login = require("../models/Login");

// --------------------------
// Helper: CSV Builder
// --------------------------
function toCsv(rows, headers) {
  const headerLine = headers.map((h) => h.label).join(",");
  const lines = rows.map((row) =>
    headers
      .map((h) => {
        let val = row[h.key] ?? "";
        val = String(val).replace(/"/g, '""'); // escape quotes
        // wrap in quotes in case of comma
        return `"${val}"`;
      })
      .join(",")
  );
  return [headerLine, ...lines].join("\r\n");
}

// --------------------------
// GET /api/reports/summary
// --------------------------
router.get("/summary", async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const totalStudents = await Student.countDocuments();

    const todayPresent = await Attendance.countDocuments({ date: today });
    const todayAbsent = Math.max(totalStudents - todayPresent, 0);
    const todayRate = totalStudents
      ? Math.round((todayPresent / totalStudents) * 100)
      : 0;

    // Overall stats across all days
    const allDates = await Attendance.distinct("date");
    const totalDays = allDates.length;
    const totalMarks = await Attendance.countDocuments();

    const totalPossible = totalStudents * totalDays;
    const overallRate = totalPossible
      ? Math.round((totalMarks / totalPossible) * 100)
      : 0;

    // Last 7 days trend
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().slice(0, 10);

      const count = await Attendance.countDocuments({ date: dStr });

      trend.push({
        date: dStr,
        present: count,
      });
    }

    // Simple department summary (no >100%)
    const students = await Student.find();
    const studentDeptMap = {};
    students.forEach((s) => {
      studentDeptMap[s.studentId] = s.department || "Unknown";
    });

    const deptMap = {};
    (await Attendance.find()).forEach((a) => {
      const dept = studentDeptMap[a.studentId] || "Unknown";
      if (!deptMap[dept]) {
        deptMap[dept] = { students: new Set(), present: 0 };
      }
      deptMap[dept].students.add(a.studentId);
      deptMap[dept].present++;
    });

    const departments = Object.entries(deptMap).map(([name, info]) => {
      const studentCount = info.students.size;
      const possible = studentCount * totalDays || 1;
      const rate = Math.min(
        100,
        Math.round((info.present / possible) * 100)
      );

      return {
        name,
        students: studentCount,
        present: info.present,
        rate,
      };
    });

    return res.json({
      success: true,
      stats: {
        totalStudents,
        todayPresent,
        todayAbsent,
        todayRate,
        totalMarks,
        totalDays,
        overallRate,
      },
      trend,
      departments,
    });
  } catch (err) {
    console.error("Report summary error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load reports summary",
    });
  }
});

// --------------------------
// GET /api/reports/export/students
// --------------------------
router.get("/export/students", async (req, res) => {
  try {
    const students = await Student.find().lean();

    const rows = students.map((s) => ({
      studentId: s.studentId,
      name: s.name,
      email: s.email,
      phone: s.phone,
      department: s.department,
      year: s.year,
      rollNo: s.rollNo,
      dateOfBirth: s.dateOfBirth,
      address: s.address,
      photo: s.photo,
      joinDate: s.joinDate,
      createdAt: s.createdAt,
    }));

    const csv = toCsv(rows, [
      { key: "studentId", label: "StudentID" },
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "department", label: "Department" },
      { key: "year", label: "Year" },
      { key: "rollNo", label: "RollNo" },
      { key: "dateOfBirth", label: "DateOfBirth" },
      { key: "address", label: "Address" },
      { key: "photo", label: "PhotoFile" },
      { key: "joinDate", label: "JoinDate" },
      { key: "createdAt", label: "CreatedAt" },
    ]);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="students_data.csv"'
    );
    return res.send(csv);
  } catch (err) {
    console.error("Export students error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to export students",
    });
  }
});

// --------------------------
// GET /api/reports/export/attendance
// --------------------------
router.get("/export/attendance", async (req, res) => {
  try {
    const records = await Attendance.find().lean();

    const rows = records.map((a) => ({
      studentId: a.studentId,
      name: a.name,
      date: a.date,
      time: a.time,
      markedBy: a.markedBy,
      createdAt: a.createdAt,
    }));

    const csv = toCsv(rows, [
      { key: "studentId", label: "StudentID" },
      { key: "name", label: "Name" },
      { key: "date", label: "Date" },
      { key: "time", label: "Time" },
      { key: "markedBy", label: "MarkedBy" },
      { key: "createdAt", label: "CreatedAt" },
    ]);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="attendance_data.csv"'
    );
    return res.send(csv);
  } catch (err) {
    console.error("Export attendance error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to export attendance",
    });
  }
});

// --------------------------
// GET /api/reports/export/logins
// --------------------------
router.get("/export/logins", async (req, res) => {
  try {
    const records = await Login.find().lean();

    const rows = records.map((l) => ({
      username: l.username,
      role: l.role,
      datetime: l.datetime,
      ip: l.ip,
      success: l.success ? 1 : 0,
      createdAt: l.createdAt,
    }));

    const csv = toCsv(rows, [
      { key: "username", label: "Username" },
      { key: "role", label: "Role" },
      { key: "datetime", label: "DateTime" },
      { key: "ip", label: "IP" },
      { key: "success", label: "Success" },
      { key: "createdAt", label: "CreatedAt" },
    ]);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="logins_data.csv"'
    );
    return res.send(csv);
  } catch (err) {
    console.error("Export logins error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to export logins",
    });
  }
});

module.exports = router;
