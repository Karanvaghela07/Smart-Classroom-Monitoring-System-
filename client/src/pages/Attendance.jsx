// frontend/src/pages/Attendance.jsx
import React, { useState, useRef, useEffect } from "react";
import "../styles/theme.css";
import api from "../api/api";

// interval (ms)
const CAPTURE_INTERVAL = 700; // ~0.7s - good tradeoff for >6 faces

export default function Attendance() {
  const [running, setRunning] = useState(false);
  const [recognitionLog, setRecognitionLog] = useState([]);
  const [markedStudents, setMarkedStudents] = useState(new Set());
  const [popup, setPopup] = useState({ open: false, message: "", type: "" });

  const videoRef = useRef();
  const markedRef = useRef(markedStudents);
  const processingRef = useRef(false);

  useEffect(() => { markedRef.current = markedStudents; }, [markedStudents]);

  const showPopup = (msg, type = "success") => {
    setPopup({ open: true, message: msg, type });
    setTimeout(() => setPopup({ open: false, message: "", type: "" }), 3000);
  };

  const startCamera = async () => {
    try {
      setRunning(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
      });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    } catch (err) {
      alert("Camera access denied or not available");
      setRunning(false);
    }
  };

  const stopCamera = () => {
    setRunning(false);
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    processingRef.current = false;
  };

  const captureAndSend = async () => {
    if (!videoRef.current || !running) return;
    if (processingRef.current) return;

    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      // video not ready yet
      return;
    }

    processingRef.current = true;

    try {
      // downscale to speed network + Python processing while preserving multiple faces
      const targetW = 960; // still large enough for 6+ faces
      const scale = targetW / video.videoWidth;
      const targetH = Math.round(video.videoHeight * scale);

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // convert to blob
      const blob = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.8)
      );
      if (!blob) { processingRef.current = false; return; }

      const form = new FormData();
      form.append("frame", blob);

      const currentSession = localStorage.getItem("current_session") || "default";

      const res = await api.post(`/face/recognize?session=${encodeURIComponent(currentSession)}`, form);

      if (!res.data || !res.data.success) {
        // show warning only if meaningful message
        if (res.data && res.data.message && res.data.message !== "No faces recognized") {
          console.log("Backend:", res.data.message);
        }
        processingRef.current = false;
        return;
      }

      const recognized = (res.data.data && res.data.data.recognized) || [];
      const newlyMarked = res.data.newlyMarkedIds || [];

      if (recognized.length === 0) {
        processingRef.current = false;
        return;
      }

      // update UI for each recognized student
      let addedCount = 0;
      recognized.forEach((r) => {
        const id = String(r.studentId);
        if (markedRef.current.has(id)) return;
        addedCount++;

        setMarkedStudents((prev) => new Set([...prev, id]));

        setRecognitionLog((prev) => [
          {
            id: Date.now() + Math.random(),
            studentId: id,
            name: r.name,
            confidence: r.confidence || r.confidence === 0 ? r.confidence : "",
            time: new Date().toLocaleTimeString(),
            status: newlyMarked.includes(id) ? "success" : "repeat",
          },
          ...prev,
        ]);
      });

      if (newlyMarked.length > 0) {
        showPopup(`Marked ${newlyMarked.length} present`, "success");
      } else if (addedCount > 0) {
        showPopup(`${addedCount} recognized (already marked earlier)`, "warning");
      }
    } catch (err) {
      console.error("Capture/send error:", err);
    }

    processingRef.current = false;
  };

  useEffect(() => {
    let timer;
    if (running) {
      timer = setInterval(() => { captureAndSend(); }, CAPTURE_INTERVAL);
    }
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  return (
    <div className="dashboard-container">
      <div className="page-header-section">
        <div className="page-header-content">
          <div className="page-badge"><span>📸</span><span>Face Recognition</span></div>
          <h1 className="page-main-title">Take Attendance</h1>
          <p>Use face recognition to mark attendance automatically</p>
        </div>

        <div className="page-header-stats">
          <div className="header-stat-item"><span className="header-stat-value">{recognitionLog.length}</span><span>Recognized Today</span></div>
          <div className="header-stat-divider"></div>
          <div className="header-stat-item"><span className="header-stat-value">{running ? "Active" : "Inactive"}</span><span>Camera Status</span></div>
        </div>
      </div>

      <div className="attendance-grid">
        <div className="camera-panel">
          <div className="panel-header">
            <div><h3>Live Camera Feed</h3><p>Position faces in frame</p></div>
            <div className="camera-status"><span className={`status-dot ${running ? "active" : "inactive"}`}></span><span>{running ? "Live" : "Offline"}</span></div>
          </div>

          <div className="camera-container">
            <video ref={videoRef} className="camera-video" playsInline autoPlay muted />
            {!running && <div className="camera-overlay"><div><span>📷</span><p>Camera is off</p></div></div>}
            {running && <div className="camera-frame-guide"><div className="frame-corner top-left"></div><div className="frame-corner top-right"></div><div className="frame-corner bottom-left"></div><div className="frame-corner bottom-right"></div></div>}
          </div>

          <div className="camera-controls">
            {!running ? <button className="btn-camera primary" onClick={startCamera}><span>▶</span>Start Camera</button> : <><button className="btn-camera danger" onClick={stopCamera}><span>■</span>Stop Camera</button><button className="btn-camera success" disabled><span>⚡</span>Auto Recognition ON</button></>}
          </div>
        </div>

        <div className="log-panel">
          <div className="panel-header"><div><h3>Recognition Log</h3><p>Real-time attendance</p></div>
            {recognitionLog.length > 0 && <button className="btn-clear" onClick={() => { setRecognitionLog([]); setMarkedStudents(new Set()); }}>Clear All</button>}
          </div>

          <div className="log-container">
            {recognitionLog.length === 0 ? <div className="log-empty-state"><span>👤</span><p>No faces recognized yet</p></div> : <div className="log-list">{recognitionLog.map((log) => (
              <div key={log.id} className="log-item">
                <div className="log-avatar">{log.name.split(" ").map(n => n[0]).join("")}</div>
                <div className="log-details">
                  <div className="log-name-row"><span className="log-name">{log.name}</span><span className="log-confidence">{log.confidence}%</span></div>
                  <div className="log-meta-row"><span className="log-id">{log.studentId}</span><span className="log-time">{log.time}</span></div>
                </div>
                <div className="log-status success"><span>✓</span></div>
              </div>
            ))}</div>}
          </div>
        </div>
      </div>

      {popup.open && (
        <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",backgroundColor:"rgba(0,0,0,0.4)",zIndex:1200}}>
          <div style={{background:"white",padding:20,borderRadius:8}}>
            <p style={{margin:0,color: popup.type==="success"?"green": "orange"}}>{popup.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
