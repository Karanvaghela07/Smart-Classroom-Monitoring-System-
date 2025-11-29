import React from "react";
import AdityaPhoto from "../images/Aditya.png";
import Photo2 from "../images/Karan4.jpg";
import Photo3 from "../images/Niti.png";
import Photo4 from "../images/sahil.png";
import "../styles/about.css";


export default function About() {
  const teamMembers = [
    {
      id: 1,
      name: "Aditya Patel",
      role: "Full Stack Developer",
      photo: AdityaPhoto,
      description: "Backend & Face Recognition",
      linkedin: "#",
      github: "#"
    },
    {
      id: 2,
      name: "Karan",
      role: "Frontend Developer",
      photo: Photo2,
      description: "UI/UX & React Development",
      linkedin: "#",
      github: "#"
    },
    {
      id: 3,
      name: "Niti",
      role: "ML Engineer",
      photo: Photo3,
      description: "Machine Learning & OpenCV",
      linkedin: "#",
      github: "#"
    },
    {
      id: 4,
      name: "Sahil",
      role: "Backend Developer",
      photo: Photo4,
      description: "API & Database Management",
      linkedin: "#",
      github: "#"
    }
  ];

  const technologies = [
    { name: "React", icon: "⚛️", color: "#61dafb" },
    { name: "Node.js", icon: "🟢", color: "#68a063" },
    { name: "FastAPI", icon: "⚡", color: "#009688" },
    { name: "OpenCV", icon: "👁️", color: "#5c3ee8" },
    { name: "Face Recognition", icon: "🔍", color: "#ff6b6b" },
    { name: "MongoDB", icon: "🍃", color: "#4db33d" }
  ];

  const features = [
    {
      icon: "🎯",
      title: "Accurate Recognition",
      description: "Advanced face detection with 98% accuracy"
    },
    {
      icon: "⚡",
      title: "Real-time Processing",
      description: "Instant attendance marking in milliseconds"
    },
    {
      icon: "📊",
      title: "Analytics Dashboard",
      description: "Comprehensive reports and visualizations"
    },
    {
      icon: "🔒",
      title: "Secure & Private",
      description: "End-to-end encrypted data storage"
    }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <div className="about-hero">
        <div className="hero-badge">
          <span className="badge-icon">🎓</span>
          <span className="badge-text">Final Year Project 2024-25</span>
        </div>
        <h1 className="hero-title">
          Smart Class Monitoring System
        </h1>
        <p className="hero-subtitle">
          Face Recognition Based Attendance System
        </p>
        <div className="hero-description">
          An intelligent attendance management system leveraging cutting-edge face recognition 
          technology to automate and streamline the attendance tracking process in educational institutions.
        </div>
      </div>

      {/* Project Overview */}
      <div className="about-section">
        <div className="section-header">
          <h2 className="section-title">
            <span className="title-icon">📋</span>
            Project Overview
          </h2>
        </div>
        
        <div className="overview-grid">
          <div className="overview-card">
            <div className="card-icon">🎯</div>
            <h3 className="card-title">Our Mission</h3>
            <p className="card-text">
              To revolutionize traditional attendance systems by implementing a contactless, 
              automated solution that saves time, reduces errors, and provides real-time insights 
              for better administrative decision-making.
            </p>
          </div>

          <div className="overview-card">
            <div className="card-icon">💡</div>
            <h3 className="card-title">The Problem</h3>
            <p className="card-text">
              Traditional manual attendance systems are time-consuming, prone to proxy attendance, 
              and lack real-time data analysis capabilities, making it difficult to track and 
              improve student engagement effectively.
            </p>
          </div>

          <div className="overview-card">
            <div className="card-icon">✨</div>
            <h3 className="card-title">Our Solution</h3>
            <p className="card-text">
              An automated face recognition system that instantly marks attendance, prevents proxy, 
              generates comprehensive reports, and provides actionable insights through an intuitive 
              dashboard interface.
            </p>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="about-section features-section">
        <div className="section-header">
          <h2 className="section-title">
            <span className="title-icon">⭐</span>
            Key Features
          </h2>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h4 className="feature-title">{feature.title}</h4>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Technologies */}
      <div className="about-section tech-section">
        <div className="section-header">
          <h2 className="section-title">
            <span className="title-icon">🛠️</span>
            Technologies Used
          </h2>
        </div>

        <div className="tech-grid">
          {technologies.map((tech, index) => (
            <div key={index} className="tech-card" style={{ '--tech-color': tech.color }}>
              <div className="tech-icon">{tech.icon}</div>
              <div className="tech-name">{tech.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Section */}
<div className="about-section team-section">
  <div className="section-header">
    <h2 className="section-title">Meet Our Team</h2>
  </div>

  <div className="team-grid">
    {teamMembers.map((member) => (
      <div key={member.id} className="team-card">

        <img
          src={member.photo}
          alt={member.name}
          className="team-photo-big"
        />

        <h3 className="team-name">{member.name}</h3>
        <div className="team-role">{member.role}</div>


      </div>
    ))}
  </div>
</div>



      {/* Project Stats */}
      <div className="about-section stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">98%</div>
            <div className="stat-label">Accuracy Rate</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">&lt;2s</div>
            <div className="stat-label">Processing Time</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">500+</div>
            <div className="stat-label">Students Registered</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">24/7</div>
            <div className="stat-label">System Uptime</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="about-footer">
        <div className="footer-content">
          <div className="footer-icon">🎓</div>
          <h3 className="footer-title">Smart Class Monitoring System</h3>
          <p className="footer-text">
            Developed as part of Final Year Project • 2024-25
          </p>
          <div className="footer-badges">
            <span className="footer-badge">React</span>
            <span className="footer-badge">Node.js</span>
            <span className="footer-badge">OpenCV</span>
            <span className="footer-badge">Face Recognition</span>
          </div>
        </div>
      </div>
    </div>
  );
}