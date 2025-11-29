// client/src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import "../styles/theme.css";

import api from "../api/api";
import { io } from "socket.io-client";
const socket = io("http://localhost:5000");

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  const [students, setStudents] = useState([]);
  const [attendanceAll, setAttendanceAll] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Session state (for multiple attendance rounds)
  const getInitialSession = () => {
    if (typeof window === "undefined") return "default";
    const saved = localStorage.getItem("current_session");
    if (saved) return saved;
    const s =
      "session-" + new Date().toISOString().slice(0, 10) + "-initial";
    localStorage.setItem("current_session", s);
    return s;
  };

  const [sessionId, setSessionId] = useState(getInitialSession);

  // Auto Update Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // -------------------------
  // LOAD STUDENTS
  // -------------------------
  const loadStudents = async () => {
    try {
      const res = await api.get("/students");
      const data = res.data;

      let list = [];

      if (Array.isArray(data)) list = data;
      else if (data.students) list = data.students;

      const normalized = list.map((s) => ({
        student_id: s.student_id || s.StudentID || "",
        name: s.name || s.Name || "",
        email: s.email || s.Email || "",
        class: s.class || s.Class || s.department || "",
        phone: s.phone || s.Phone || "",
        joinDate: s.joinDate || s.JoinDate || "",
        photo: s.photo || s.Photo || "",
      }));

      setStudents(normalized);
    } catch (err) {
      console.error("Error loading students:", err);
      setStudents([]);
    }
  };

  // -------------------------
  // LOAD ATTENDANCE (Mongo + session)
  // -------------------------
  const loadAttendance = async () => {
    try {
      const res = await api.get("/attendance/history");
      const history = res.data.history || [];

      const mapped = history.map((r) => ({
        StudentID: r.studentId,
        Name: r.name,
        Date: r.date,
        Time: r.time,
        MarkedBy: r.markedBy,
        Session: r.session || "default",
      }));

      setAttendanceAll(mapped);

      const todayISO = new Date().toISOString().slice(0, 10);
      const currentSession =
        localStorage.getItem("current_session") || sessionId || "default";

      const todayList = mapped.filter((row) => {
        if (!row.Date) return false;
        const sameDay = String(row.Date).slice(0, 10) === todayISO;
        const sameSession = row.Session === currentSession;
        return sameDay && sameSession;
      });

      setTodayAttendance(todayList);
    } catch (err) {
      console.error("Error loading attendance:", err);
      setAttendanceAll([]);
      setTodayAttendance([]);
    }
  };

  // -------------------------
  // INITIAL LOAD
  // -------------------------
  useEffect(() => {
    setLoading(true);
    Promise.all([loadStudents(), loadAttendance()]).finally(() =>
      setLoading(false)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------
  // SOCKET.IO LIVE UPDATE
  // -------------------------
  useEffect(() => {
    socket.on("attendance_updated", () => loadAttendance());
    socket.on("students_updated", () => loadStudents());

    return () => {
      socket.off("attendance_updated");
      socket.off("students_updated");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------
  // CALCULATIONS
  // -------------------------
  const total = students.length;
  const present = todayAttendance.length;
  const absent = Math.max(total - present, 0);
  const percent = total ? Math.round((present / total) * 100) : 0;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const time = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const hour = currentTime.getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const recentAttendance = todayAttendance
    .slice()
    .reverse()
    .slice(0, 8)
    .map((a, idx) => ({
      id: `${a.StudentID}-${idx}`,
      name: a.Name,
      time: a.Time,
      status: "present",
    }));

  // -------------------------
  // UI
  // -------------------------
  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-icon">🎯</span>
            <span className="hero-badge-text">Dashboard Overview</span>
          </div>
          <h1 className="hero-title">
            {greeting}, <span className="gradient-text">Administrator</span>
          </h1>
          <p className="hero-subtitle">
            Welcome to your Smart Classroom Monitoring Dashboard.
          </p>
          <div className="hero-meta">
            <div className="hero-meta-item">
              <span className="hero-meta-icon">📅</span>
              <span className="hero-meta-text">{today}</span>
            </div>
            <div className="hero-meta-divider"></div>
            <div className="hero-meta-item">
              <span className="hero-meta-icon">🕐</span>
              <span className="hero-meta-text">{time}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card stat-card-purple">
          <div className="stat-card-header">
            <div className="stat-card-icon-wrapper purple">
              <span className="stat-card-icon">👥</span>
            </div>
          </div>
          <h3 className="stat-card-value">{loading ? "..." : total}</h3>
          <p className="stat-card-label">Total Students</p>
        </div>

        <div className="stat-card stat-card-green">
          <div className="stat-card-header">
            <div className="stat-card-icon-wrapper green">
              <span className="stat-card-icon">✅</span>
            </div>
          </div>
          <h3 className="stat-card-value">{loading ? "..." : present}</h3>
          <p className="stat-card-label">Present Today</p>
        </div>

        <div className="stat-card stat-card-orange">
          <div className="stat-card-header">
            <div className="stat-card-icon-wrapper orange">
              <span className="stat-card-icon">📊</span>
            </div>
          </div>
          <h3 className="stat-card-value">{loading ? "..." : absent}</h3>
          <p className="stat-card-label">Absent Today</p>
        </div>

        <div className="stat-card stat-card-blue">
          <div className="stat-card-header">
            <div className="stat-card-icon-wrapper blue">
              <span className="stat-card-icon">📈</span>
            </div>
          </div>
          <h3 className="stat-card-value">
            {loading ? "..." : `${percent}%`}
          </h3>
          <p className="stat-card-label">Attendance Rate</p>
        </div>
      </div>

      {/* Recent Attendance + Actions + Status */}
      <div className="dashboard-grid">
        <div className="dashboard-panel recent-attendance-panel">
          <div className="panel-header">
            <h3 className="panel-title">Recent Attendance</h3>
          </div>

          <div className="panel-body">
            {recentAttendance.length > 0 ? (
              <div className="attendance-list">
                {recentAttendance.map((rec) => (
                  <div key={rec.id} className="attendance-item">
                    <div className="attendance-avatar">
                      {rec.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="attendance-info">
                      <p className="attendance-name">{rec.name}</p>
                      <p className="attendance-time">{rec.time}</p>
                    </div>
                    <span className="attendance-badge present">✓</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-state-icon">📋</span>
                <p>No attendance yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-panel actions-panel">
          <div className="panel-header">
            <h3 className="panel-title">Quick Actions</h3>
          </div>
          <div className="panel-body">
            <div className="quick-actions-grid">
              <button
                className="quick-action-btn primary"
                onClick={() => (window.location.href = "/attendance")}
              >
                📸 Take Attendance →
              </button>

              <button
                className="quick-action-btn secondary"
                onClick={() => (window.location.href = "/add-student")}
              >
                👨‍🎓 Add Student →
              </button>

              <button
                className="quick-action-btn tertiary"
                onClick={() => (window.location.href = "/reports")}
              >
                📊 View Reports →
              </button>

              <button
                className="quick-action-btn quaternary"
                onClick={() => (window.location.href = "/history")}
              >
                📜 View History →
              </button>

              {/* 🔥 NEW: Start New Attendance Session */}
              <button
                className="quick-action-btn danger"
                onClick={() => {
                  const newSession =
                    "session-" +
                    new Date().toISOString().slice(0, 10) +
                    "-" +
                    Date.now();
                  localStorage.setItem("current_session", newSession);
                  setSessionId(newSession);
                  setTodayAttendance([]);
                }}
              >
                🔄 Start New Session
              </button>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="dashboard-panel status-panel">
          <div className="panel-header">
            <h3 className="panel-title">System Status</h3>
          </div>
          <div className="panel-body">
            <p>All systems operational.</p>
            <p style={{ fontSize: "12px", opacity: 0.7 }}>
              Active session: <strong>{sessionId}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
