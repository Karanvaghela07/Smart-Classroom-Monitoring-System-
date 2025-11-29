import React, { useEffect, useState } from "react";
import api from "../api/api";
import "../styles/students.css";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("all");

  // Load real data from backend
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get("/students");
        const list = res.data.students || [];

        const mapped = list.map((s) => ({
        id: s.studentId,        // FIXED
        name: s.name,
        email: s.email,
        phone: s.phone,
        rollNo: s.rollNo,
        department: s.department,
        year: s.year,
        photo: s.photo
          ? `http://localhost:5000/uploads/student_photos/${s.photo}`
          : "https://via.placeholder.com/150",
      }));


        setStudents(mapped);
      } catch (err) {
        console.error("Error loading students:", err);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter((student) => {
    const search = searchTerm.toLowerCase();
    return (
      student.name.toLowerCase().includes(search) ||
      student.email.toLowerCase().includes(search) ||
      student.rollNo.toLowerCase().includes(search)
    );
  });

  return (
    <div className="students-container">
      <div className="students-header">
        <h1>Student Directory</h1>
        <p>Manage all registered students</p>
      </div>

      {/* Search + Count */}
      <div className="students-topbar">
        <input
          className="students-search"
          placeholder="Search by name, email or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="students-count">Total Students: {students.length}</div>
      </div>

      {/* Student Cards */}
      <div className="students-grid">
        {filteredStudents.map((student, i) => (
          <div className="student-card" key={i}>
            <img src={student.photo} alt={student.name} className="student-photo" />

            <div className="student-info">
              <h2>{student.name}</h2>
              <p><b>ID:</b> {student.id}</p>
              <p><b>{student.department}</b> — {student.year}</p>
              <p>{student.email}</p>
              <p>{student.phone}</p>
            </div>

            <div className="student-actions">
              <button className="btn-view">View</button>
              <button className="btn-edit">Edit</button>
              <button className="btn-delete">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <p className="empty-message">No students found.</p>
      )}
    </div>
  );
}
