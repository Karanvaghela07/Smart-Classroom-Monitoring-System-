import React, { useState, useEffect } from "react";

export default function Settings() {
  // Load settings from localStorage or use defaults
  const loadSettings = () => {
    const saved = localStorage.getItem("appSettings");
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      darkTheme: false,
      cameraNotifications: true,
      emailNotifications: true,
      soundEnabled: true,
      autoAttendance: false,
      faceRecognitionSensitivity: "medium",
      attendanceReminder: true,
      language: "english",
      timeFormat: "12h",
      dateFormat: "DD/MM/YYYY"
    };
  };

  const [settings, setSettings] = useState(loadSettings());
  const [saveStatus, setSaveStatus] = useState("");

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("appSettings", JSON.stringify(settings));
    
    // Apply dark theme
    if (settings.darkTheme) {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
  }, [settings]);

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    showSaveStatus();
  };

  const handleSelectChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    showSaveStatus();
  };

  const showSaveStatus = () => {
    setSaveStatus("saved");
    setTimeout(() => {
      setSaveStatus("");
    }, 2000);
  };

  const handleResetSettings = () => {
    if (window.confirm("Are you sure you want to reset all settings to default?")) {
      const defaultSettings = {
        darkTheme: false,
        cameraNotifications: true,
        emailNotifications: true,
        soundEnabled: true,
        autoAttendance: false,
        faceRecognitionSensitivity: "medium",
        attendanceReminder: true,
        language: "english",
        timeFormat: "12h",
        dateFormat: "DD/MM/YYYY"
      };
      setSettings(defaultSettings);
      setSaveStatus("reset");
      setTimeout(() => setSaveStatus(""), 2000);
    }
  };

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="settings-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your application preferences</p>
        </div>
        
        {saveStatus && (
          <div className={`save-indicator ${saveStatus}`}>
            <span className="indicator-icon">
              {saveStatus === "saved" ? "✓" : "🔄"}
            </span>
            <span className="indicator-text">
              {saveStatus === "saved" ? "Settings Saved" : "Settings Reset"}
            </span>
          </div>
        )}
      </div>

      {/* Settings Grid */}
      <div className="settings-grid">
        
        {/* Appearance Section */}
        <div className="settings-section">
          <div className="section-header">
            <div className="section-icon">🎨</div>
            <div>
              <h3 className="section-title">Appearance</h3>
              <p className="section-description">Customize the look and feel</p>
            </div>
          </div>

          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">
                  <span className="label-icon">🌙</span>
                  Dark Theme
                </div>
                <p className="setting-description">Enable dark mode for better viewing at night</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.darkTheme}
                  onChange={() => handleToggle("darkTheme")}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">
                  <span className="label-icon">🌍</span>
                  Language
                </div>
                <p className="setting-description">Select your preferred language</p>
              </div>
              <select
                className="setting-select"
                value={settings.language}
                onChange={(e) => handleSelectChange("language", e.target.value)}
              >
                <option value="english">English</option>
                <option value="hindi">Hindi</option>
                <option value="gujarati">Gujarati</option>
                <option value="marathi">Marathi</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">
                  <span className="label-icon">🕐</span>
                  Time Format
                </div>
                <p className="setting-description">Choose 12-hour or 24-hour format</p>
              </div>
              <select
                className="setting-select"
                value={settings.timeFormat}
                onChange={(e) => handleSelectChange("timeFormat", e.target.value)}
              >
                <option value="12h">12 Hour (AM/PM)</option>
                <option value="24h">24 Hour</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">
                  <span className="label-icon">📅</span>
                  Date Format
                </div>
                <p className="setting-description">Select date display format</p>
              </div>
              <select
                className="setting-select"
                value={settings.dateFormat}
                onChange={(e) => handleSelectChange("dateFormat", e.target.value)}
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="settings-section">
          <div className="section-header">
            <div className="section-icon">🔔</div>
            <div>
              <h3 className="section-title">Notifications</h3>
              <p className="section-description">Manage notification preferences</p>
            </div>
          </div>

          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">
                  <span className="label-icon">📸</span>
                  Camera Notifications
                </div>
                <p className="setting-description">Get alerts when camera detects a face</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.cameraNotifications}
                  onChange={() => handleToggle("cameraNotifications")}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">
                  <span className="label-icon">📧</span>
                  Email Notifications
                </div>
                <p className="setting-description">Receive attendance reports via email</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle("emailNotifications")}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">
                  <span className="label-icon">🔊</span>
                  Sound Effects
                </div>
                <p className="setting-description">Play sound when attendance is marked</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={() => handleToggle("soundEnabled")}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">
                  <span className="label-icon">⏰</span>
                  Attendance Reminders
                </div>
                <p className="setting-description">Daily reminders for attendance marking</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.attendanceReminder}
                  onChange={() => handleToggle("attendanceReminder")}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Attendance Settings */}
        <div className="settings-section">
          <div className="section-header">
            <div className="section-icon">✅</div>
            <div>
              <h3 className="section-title">Attendance</h3>
              <p className="section-description">Configure attendance system</p>
            </div>
          </div>

          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">
                  <span className="label-icon">🤖</span>
                  Auto Attendance
                </div>
                <p className="setting-description">Automatically mark attendance when face is detected</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.autoAttendance}
                  onChange={() => handleToggle("autoAttendance")}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">
                  <span className="label-icon">🎯</span>
                  Face Recognition Sensitivity
                </div>
                <p className="setting-description">Adjust accuracy vs speed tradeoff</p>
              </div>
              <select
                className="setting-select"
                value={settings.faceRecognitionSensitivity}
                onChange={(e) => handleSelectChange("faceRecognitionSensitivity", e.target.value)}
              >
                <option value="low">Low (Fast)</option>
                <option value="medium">Medium (Balanced)</option>
                <option value="high">High (Accurate)</option>
              </select>
            </div>
          </div>
        </div>

        {/* System Section */}
        <div className="settings-section">
          <div className="section-header">
            <div className="section-icon">⚙️</div>
            <div>
              <h3 className="section-title">System</h3>
              <p className="section-description">Application information and actions</p>
            </div>
          </div>

          <div className="settings-list">
            <div className="setting-item info-item">
              <div className="setting-info">
                <div className="setting-label">
                  <span className="label-icon">📱</span>
                  Version
                </div>
                <p className="setting-description">Current application version</p>
              </div>
              <div className="info-badge">v1.0.0</div>
            </div>

            <div className="setting-item info-item">
              <div className="setting-info">
                <div className="setting-label">
                  <span className="label-icon">💾</span>
                  Storage Used
                </div>
                <p className="setting-description">Local storage consumption</p>
              </div>
              <div className="info-badge">2.4 MB</div>
            </div>
          </div>

          <div className="action-buttons">
            <button className="action-btn reset-btn" onClick={handleResetSettings}>
              <span className="btn-icon">🔄</span>
              Reset to Defaults
            </button>
            <button className="action-btn clear-btn" onClick={() => {
              if(window.confirm("Clear all cache and data?")) {
                localStorage.clear();
                alert("Cache cleared! Please refresh the page.");
              }
            }}>
              <span className="btn-icon">🗑️</span>
              Clear Cache
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="settings-footer">
        <div className="footer-info">
          <span className="footer-icon">ℹ️</span>
          <span className="footer-text">
            Settings are automatically saved and synced to your browser's local storage.
          </span>
        </div>
      </div>
    </div>
  );
}