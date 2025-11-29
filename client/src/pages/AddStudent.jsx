import React, { useState } from "react";
import api from "../api/api";

export default function AddStudent() {
  const [form, setForm] = useState({
    name: "",
    student_id: "",
    email: "",
    phone: "",
    department: "",
    year: "",
    rollNo: "",
    dateOfBirth: "",
    address: ""
  });
  
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.name || !form.student_id || !form.email) {
    alert("Please fill in required fields (Name, Student ID, Email)");
    return;
  }

  setLoading(true);

  try {
    const data = new FormData();

    for (let key in form) {
      data.append(key, form[key]);
    }

    if (photo) data.append("photo", photo);

   const token = localStorage.getItem("token");

  const res = await api.post("/students/add", data, {
    headers: {
      "Content-Type": "multipart/form-data",
      "Authorization": `Bearer ${token}`,   // ✅ CORRECT FORMAT
    },
  });


    if (res.data.success) {
      alert("✅ Student added successfully!");
    }

    // Reset form
    setForm({
      name: "",
      student_id: "",
      email: "",
      phone: "",
      department: "",
      year: "",
      rollNo: "",
      dateOfBirth: "",
      address: ""
    });

    setPhoto(null);
    setPhotoPreview(null);

  } catch (err) {
    console.error(err);
    alert("❌ Error adding student");
  }

  setLoading(false);
};

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the form?")) {
      setForm({
        name: "",
        student_id: "",
        email: "",
        phone: "",
        department: "",
        year: "",
        rollNo: "",
        dateOfBirth: "",
      });
      setPhoto(null);
      setPhotoPreview(null);
    }
  };

  return (
    <div className="add-student-page">
      {/* Header */}
      <div className="add-student-header">
        <div>
          <h1 className="page-title">Add New Student</h1>
          <p className="page-subtitle">Fill in the student information below</p>
        </div>
        <div className="header-badge">
          <span className="badge-icon">➕</span>
          <span className="badge-text">New Entry</span>
        </div>
      </div>

      {/* Form Container */}
      <div className="form-container">
        <div className="form-grid">
          {/* Left Column - Photo Upload */}
          <div className="photo-section">
            <div className="photo-upload-card">
              <h3 className="section-title">
                <span className="title-icon">📸</span>
                Student Photo
              </h3>
              
              <div className="photo-upload-area">
                {photoPreview ? (
                  <div className="photo-preview">
                    <img src={photoPreview} alt="Preview" className="preview-image" />
                    <button 
                      type="button"
                      className="remove-photo-btn"
                      onClick={handleRemovePhoto}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="upload-label">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="file-input"
                    />
                    <div className="upload-placeholder">
                      <span className="upload-icon">📷</span>
                      <span className="upload-text">Click to upload photo</span>
                      <span className="upload-hint">PNG, JPG up to 5MB</span>
                    </div>
                  </label>
                )}
              </div>

              <div className="photo-info">
                <span className="info-icon">ℹ️</span>
                <span className="info-text">Upload a clear front-facing photo for face recognition</span>
              </div>
            </div>
          </div>

          {/* Right Column - Form Fields */}
          <div className="form-section">
            <div className="form-card">
              <h3 className="section-title">
                <span className="title-icon">📝</span>
                Personal Information
              </h3>

              <div className="form-fields">
                {/* Name */}
                <div className="form-group">
                  <label className="form-label">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    className="form-input"
                    required
                  />
                </div>

                {/* Student ID and Roll No */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Student ID <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="student_id"
                      value={form.student_id}
                      onChange={handleInputChange}
                      placeholder="e.g., STU001"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Roll Number</label>
                    <input
                      type="text"
                      name="rollNo"
                      value={form.rollNo}
                      onChange={handleInputChange}
                      placeholder="e.g., 2021001"
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Email and Phone */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Email Address <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleInputChange}
                      placeholder="student@example.com"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Department and Year */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select
                      name="department"
                      value={form.department}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">Select Department</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Civil">Civil</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Year</label>
                    <select
                      name="year"
                      value={form.year}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">Select Year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={form.dateOfBirth}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

               
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-reset"
            onClick={handleReset}
            disabled={loading}
          >
            <span className="btn-icon">🔄</span>
            Reset Form
          </button>
          
          <button
            type="submit"
            className="btn btn-submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="btn-icon spinner">⏳</span>
                Saving...
              </>
            ) : (
              <>
                <span className="btn-icon">✅</span>
                Save Student
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}