// client/src/pages/Reports.jsx
import React, { useEffect, useState } from "react";
import api from "../api/api";
import "../styles/reports.css";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load summary from backend
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/reports/summary");
        if (res.data.success) {
          setStats(res.data.stats);
          setTrend(res.data.trend || []);
          setDepartments(res.data.departments || []);
        }
      } catch (err) {
        console.error("Reports load error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const safeStats = stats || {
    totalStudents: 0,
    todayPresent: 0,
    todayAbsent: 0,
    todayRate: 0,
    totalMarks: 0,
    totalDays: 0,
    overallRate: 0,
  };

  // Download helper
  const downloadCsv = async (type) => {
    try {
      const res = await api.get(`/reports/export/${type}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${type}_data.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download file. Check console for details.");
    }
  };

  // Transform trend for charts
  const trendData = trend.map((t) => ({
    date: t.date.slice(5), // MM-DD
    present: t.present,
  }));

  return (
    <div className="reports-page">
      {/* Header */}
      <div className="reports-header">
        <div>
          <div className="reports-badge">
            <span className="reports-badge-icon">📊</span>
            <span className="reports-badge-text">Analytics Center</span>
          </div>
          <h1 className="reports-title">Attendance Reports</h1>
          <p className="reports-subtitle">
            Live insights generated directly from your MongoDB data.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="reports-summary-grid">
        <div className="reports-card card-blue">
          <div className="card-label">Total Students</div>
          <div className="card-value">
            {loading ? "…" : safeStats.totalStudents}
          </div>
          <div className="card-footnote">Across all departments</div>
        </div>

        <div className="reports-card card-green">
          <div className="card-label">Present Today</div>
          <div className="card-value">
            {loading ? "…" : safeStats.todayPresent}
          </div>
          <div className="card-footnote">
            {loading ? "" : `${safeStats.todayRate}% of total`}
          </div>
        </div>

        <div className="reports-card card-orange">
          <div className="card-label">Absent Today</div>
          <div className="card-value">
            {loading ? "…" : safeStats.todayAbsent}
          </div>
          <div className="card-footnote">Not marked present yet</div>
        </div>

        <div className="reports-card card-purple">
          <div className="card-label">Overall Attendance Rate</div>
          <div className="card-value">
            {loading ? "…" : `${safeStats.overallRate}%`}
          </div>
          <div className="card-footnote">
            {loading
              ? ""
              : `${safeStats.totalMarks} total presents over ${safeStats.totalDays} day(s)`}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="reports-charts-row">
        {/* Trend chart */}
        <div className="reports-panel">
          <div className="panel-header">
            <h3>Last 7 Days Trend</h3>
            <p>Daily present count over the last week</p>
          </div>
          <div className="panel-body chart-body">
            {trendData.length === 0 ? (
              <div className="empty-chart">No attendance data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="present"
                    stroke="#4ade80"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Department performance */}
        <div className="reports-panel">
          <div className="panel-header">
            <h3>Department Performance</h3>
            <p>Average attendance rate by department</p>
          </div>
          <div className="panel-body dept-body">
            {departments.length === 0 ? (
              <div className="empty-chart">No department data yet.</div>
            ) : (
              <div className="dept-list">
                {departments.map((d, idx) => (
                  <div key={idx} className="dept-item">
                    <div className="dept-info">
                      <div className="dept-name">{d.name}</div>
                      <div className="dept-meta">
                        {d.students} students • {d.present} presents
                      </div>
                    </div>
                    <div className="dept-bar-wrapper">
                      <div className="dept-bar-track">
                        <div
                          className="dept-bar-fill"
                          style={{ width: `${Math.min(d.rate, 100)}%` }}
                        ></div>
                      </div>
                      <div className="dept-rate">{d.rate}%</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Small bar chart summary */}
      <div className="reports-panel full-width">
        <div className="panel-header">
          <h3>Today vs Overall</h3>
          <p>Quick comparison of today’s status and global average</p>
        </div>
        <div className="panel-body chart-body small-chart">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart
              data={[
                {
                  label: "Today",
                  present: safeStats.todayRate,
                  absent: 100 - safeStats.todayRate,
                },
                {
                  label: "Overall",
                  present: safeStats.overallRate,
                  absent: 100 - safeStats.overallRate,
                },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" stackId="a" fill="#22c55e" />
              <Bar dataKey="absent" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Export Section */}
      <div className="reports-panel export-panel">
        <div className="panel-header">
          <h3>Export Data (CSV)</h3>
          <p>Download raw data directly from MongoDB for analysis or backup.</p>
        </div>
        <div className="panel-body export-body">
          <button
            className="export-btn export-students"
            onClick={() => downloadCsv("students")}
          >
            👨‍🎓 Download Students CSV
          </button>

          <button
            className="export-btn export-attendance"
            onClick={() => downloadCsv("attendance")}
          >
            ✅ Download Attendance CSV
          </button>

          <button
            className="export-btn export-logins"
            onClick={() => downloadCsv("logins")}
          >
            🔐 Download Login CSV
          </button>
        </div>
      </div>
    </div>
  );
}
