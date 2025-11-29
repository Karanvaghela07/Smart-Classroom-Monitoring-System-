// client/src/pages/History.jsx
import React, { useState, useEffect } from "react";
import api from "../api/api";
import "../styles/history.css";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function History() {
  const [history, setHistory] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [filterStudent, setFilterStudent] = useState("");

  const role = localStorage.getItem("role");
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser")) || {};
  const displayName = (loggedUser.name || loggedUser.username || "").split(" ")[0];

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/attendance/history");

        const records = (res.data.history || []).map((r) => ({
          StudentID: r.studentId,
          Name: r.name,
          Date: r.date,
          Time: r.time,
          MarkedBy: r.markedBy,
        }));

        setHistory(
          role === "student" && loggedUser.studentId
            ? records.filter((r) => r.StudentID === loggedUser.studentId)
            : records
        );
      } catch (err) {
        console.error("Error loading history:", err);
      }
    };

    fetchHistory();
  }, [role, loggedUser.studentId]);

  // Filters
  const filteredHistory = history.filter((record) => {
    const matchesDate = !filterDate || record.Date === filterDate;
    const search = filterStudent.toLowerCase();

    return (
      matchesDate &&
      (record.Name.toLowerCase().includes(search) ||
        record.StudentID.toLowerCase().includes(search))
    );
  });

  const uniqueDates = [...new Set(history.map((r) => r.Date))].sort();

  // ⭐ Daily trend data
  const lineData = uniqueDates.map((date) => ({
    date,
    count: history.filter((item) => item.Date === date).length,
  }));

  // ⭐ Pie chart (Admin Only)
  const presentCount = history.length;
  const pieData = [
    { name: "Present Records", value: presentCount },
  ];

  const colors = ["#6c63ff", "#ff7d7d"];

  // ⭐ Top students by attendance (Admin Only)
  const studentCounts = {};
  history.forEach((h) => {
    studentCounts[h.Name] = (studentCounts[h.Name] || 0) + 1;
  });

  const topStudents = Object.entries(studentCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // ⭐ STUDENT ONLY: Donut Chart - Attendance by Time of Day
  const getTimeCategory = (time) => {
    if (!time) return "Unknown";
    const hour = parseInt(time.split(":")[0]);
    
    if (hour >= 6 && hour < 12) return "Morning (6AM-12PM)";
    if (hour >= 12 && hour < 17) return "Afternoon (12PM-5PM)";
    if (hour >= 17 && hour < 21) return "Evening (5PM-9PM)";
    return "Night (9PM-6AM)";
  };

  const timeCategoryCounts = {};
  history.forEach((record) => {
    const category = getTimeCategory(record.Time);
    timeCategoryCounts[category] = (timeCategoryCounts[category] || 0) + 1;
  });

  const donutData = Object.entries(timeCategoryCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const donutColors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

  // ⭐ STUDENT ONLY: Monthly attendance stats
  const monthlyStats = {};
  history.forEach((record) => {
    const month = record.Date.substring(0, 7); // Get YYYY-MM
    monthlyStats[month] = (monthlyStats[month] || 0) + 1;
  });

  const monthlyData = Object.entries(monthlyStats)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return (
    <div className="dashboard-container">

      {/* HEADER */}
      <div className="page-header-section">
        <div className="page-header-content">
          <div className="page-badge">
            <span className="page-badge-icon">📜</span>
            <span className="page-badge-text">
              {role === "student" ? "My Attendance" : "Attendance History"}
            </span>
          </div>

          <h1 className="page-main-title">
            {role === "student" ? `Welcome, ${displayName}` : "Attendance History"}
          </h1>
        </div>
      </div>

      {/* =======================
          📊 CHARTS SECTION
      ======================= */}
      <div className="history-charts">

        {/* STUDENT VIEW CHARTS */}
        {role === "student" && (
          <>
            {/* Line Chart – Daily Trend */}
            <div className="chart-box">
              <h3>📈 My Attendance Trend</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Donut Chart - Attendance by Time of Day */}
            <div className="chart-box">
              <h3>🍩 Attendance by Time of Day</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    label
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={index} fill={donutColors[index % donutColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart - Monthly Stats */}
            <div className="chart-box">
              <h3>📊 Monthly Attendance</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* ADMIN VIEW CHARTS */}
        {role === "admin" && (
          <>
            {/* Line Chart – Daily Trend */}
            <div className="chart-box">
              <h3>📈 Daily Attendance Trend</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#6c63ff" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart – Only Admin */}
            <div className="chart-box">
              <h3>📊 Attendance Records Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top Students Bar Chart */}
            <div className="chart-box">
              <h3>🏆 Top Active Students</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topStudents}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#22c55e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

      </div>

      {/* TABLE SECTION */}
      <div className="history-table-panel">
        <div className="table-toolbar">
          {role === "admin" && (
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={filterStudent}
              onChange={(e) => setFilterStudent(e.target.value)}
              className="search-input"
            />
          )}

          <select
            className="filter-select"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          >
            <option value="">All Dates</option>
            {uniqueDates.map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
        </div>

        <div className="table-wrapper">
          <table className="modern-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student ID</th>
                <th>Name</th>
                <th>Date</th>
                <th>Time</th>
                <th>Marked By</th>
              </tr>
            </thead>

            <tbody>
            {filteredHistory.map((record, index) => (
              <tr key={index}>
                <td data-label="#"> {index + 1} </td>
                <td data-label="Student ID"> {record.StudentID} </td>
                <td data-label="Name"> {record.Name} </td>
                <td data-label="Date"> {record.Date} </td>
                <td data-label="Time"> {record.Time} </td>
                <td data-label="Marked By"> {record.MarkedBy} </td>
              </tr>
            ))}
          </tbody>

          </table>
        </div>

      </div>
    </div>
  );
}