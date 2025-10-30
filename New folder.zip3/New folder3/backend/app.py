import os
import csv
import pickle
from datetime import datetime, date
from typing import List
import face_recognition
import cv2
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="Face Recognition Attendance System")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Globals
known_face_encodings = []
known_face_names = []
attendance_records = []
model_loaded = False
student_map = {}  # Make this a global variable

# Data models

class RecognitionResponse(BaseModel):
    recognized_names: List[str]
    attendance_updated: bool
    message: str

class AttendanceRecord(BaseModel):
    student_id: str
    name: str
    date: str
    time: str
    marked_by: str

class Student(BaseModel):
    name: str
    photo_url: str
    
class LoginAttempt(BaseModel):
    username: str
    password: str
    role: str

# Utils

def normalize(name: str) -> str:
    # Lowercase, strip, remove spaces and underscores
    return name.strip().lower().replace("_", "").replace(" ", "")

def load_students():
    global student_map
    student_map = {}
    if os.path.exists("students.csv"):
        with open('students.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                student_map[row['Name'].strip().lower()] = row['StudentID'].strip()
    print("Loaded students:", student_map)

# Auth

@app.post("/login/")
async def login(data: LoginAttempt, request: Request):
    login_success = False
    reason = ""

    if data.role == "admin":
        if data.username.lower() == "admin" and data.password == "admin123":
            login_success = True
        else:
            reason = "Invalid admin credentials"

    elif data.role == "student":
        known_student_names = [s.lower() for s in known_face_names]
        if data.username.lower() in known_student_names and data.password == "student123":
            login_success = True
        else:
            reason = "Invalid student credentials"

    log_path = "backend/login.csv"
    is_new = not os.path.exists(log_path)
    with open(log_path, "a", newline='', encoding="utf-8") as f:
        writer = csv.writer(f)
        if is_new:
            writer.writerow(["username", "role", "datetime", "ip", "success", "reason"])
        ip = request.client.host if request.client else "unknown"
        writer.writerow([
            data.username, data.role,
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            ip, int(login_success), reason
        ])

    if login_success:
        return {"success": True, "message": "Login successful!"}
    else:
        return {"success": False, "message": reason or "Invalid credentials"}

# Startup

@app.get("/")
def serve_login():
    if os.path.exists("frontend/login.html"):
        return FileResponse("frontend/login.html")
    elif os.path.exists("../frontend/login.html"):
        return FileResponse("../frontend/login.html")
    else:
        return JSONResponse(status_code=404, content={"message": "login.html not found"})

@app.on_event("startup")
async def load_model():
    global known_face_encodings, known_face_names, model_loaded
    try:
        if os.path.exists("model.pkl"):
            with open("model.pkl", "rb") as f:
                data = pickle.load(f)
                known_face_encodings = data.get("encodings", [])
                known_face_names = data.get("names", [])

        if not known_face_encodings and os.path.exists("backend/known_faces"):
            known_faces_dir = "backend/known_faces"
        elif not known_face_encodings and os.path.exists("known_faces"):
            known_faces_dir = "known_faces"
        else:
            known_faces_dir = None
            
        if known_faces_dir:
            for filename in os.listdir(known_faces_dir):
                if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                    name = os.path.splitext(filename)[0]
                    image_path = os.path.join(known_faces_dir, filename)
                    image = face_recognition.load_image_file(image_path)
                    encodings = face_recognition.face_encodings(image)
                    if encodings:
                        known_face_encodings.append(encodings[0])
                        known_face_names.append(name)

        model_loaded = True
        print(f"Loaded {len(known_face_names)} known faces: {known_face_names}")

        load_students()

        if not os.path.exists("attendance.csv"):
            with open("attendance.csv", "w", newline="") as f:
                writer = csv.writer(f)
                writer.writerow(["StudentID", "Name", "Date", "Time", "MarkedBy"])

    except Exception as e:
        print(f"Error loading model: {e}")
        model_loaded = False

# ----------------------------
# Static
# ----------------------------
if os.path.exists("backend/known_faces"):
    app.mount("/static", StaticFiles(directory="backend/known_faces"), name="static")
elif os.path.exists("known_faces"):
    app.mount("/static", StaticFiles(directory="known_faces"), name="static")

if os.path.exists("../frontend"):
    app.mount("/app", StaticFiles(directory="../frontend", html=True), name="frontend")
elif os.path.exists("frontend"):
    app.mount("/app", StaticFiles(directory="frontend", html=True), name="frontend")

# ----------------------------
# API
# ----------------------------
@app.get("/")
async def root():
    return {"message": "Face Recognition Attendance System API", "model_loaded": model_loaded}

@app.post("/recognize/", response_model=RecognitionResponse)

async def recognize_face(file: UploadFile = File(...)):
    if not model_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

        recognized_names = []
        attendance_updated = False
        
        for face_encoding in face_encodings:
            matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
            face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
            
            if len(face_distances) > 0:
                best_match_index = np.argmin(face_distances)
                
                if matches[best_match_index] and face_distances[best_match_index] < 0.6:
                    raw_name = known_face_names[best_match_index]  # e.g. "Aditya"
                    display_name = raw_name.strip()
                    lookup_key = normalize(display_name)
                    print(f"DEBUG: raw_name={repr(raw_name)}, display_name={repr(display_name)}, lookup_key={repr(lookup_key)}, student_map_keys={list(student_map.keys())}")

                    # THIS will now work!
                    student_id = student_map.get(lookup_key, "-")
                    print(f"Recognized: {display_name}, Lookup key: {lookup_key}, StudentID: {student_id}")

                    recognized_names.append(display_name)

                    today = date.today().strftime("%Y-%m-%d")
                    already_marked = any(
                        record["name"] == display_name and record["date"] == today 
                        for record in attendance_records
                    )
                    
                    if not already_marked:
                        current_time = datetime.now().strftime("%H:%M:%S")
                        attendance_record = {
                            "student_id": student_id,
                            "name": display_name,
                            "date": today,
                            "time": current_time,
                            "marked_by": "Camera"
                        }
                        attendance_records.append(attendance_record)
                        
                        with open("attendance.csv", "a", newline="") as f:
                            writer = csv.writer(f)
                            writer.writerow([student_id, display_name, today, current_time, "Camera"])
                        
                        attendance_updated = True
        
        message = f"Recognized: {', '.join(recognized_names)}" if recognized_names else "No faces recognized"
        
        return RecognitionResponse(
            recognized_names=recognized_names,
            attendance_updated=attendance_updated,
            message=message
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recognition error: {str(e)}")

@app.get("/students/", response_model=List[Student])
async def get_students():
    students = []
    known_faces_dir = None
    if os.path.exists("backend/known_faces"):
        known_faces_dir = "backend/known_faces"
    elif os.path.exists("known_faces"):
        known_faces_dir = "known_faces"
    
    if known_faces_dir:
        for filename in os.listdir(known_faces_dir):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                name = os.path.splitext(filename)[0]
                photo_url = f"/static/{filename}"
                students.append(Student(name=name, photo_url=photo_url))
    
    return students

@app.get("/attendance/today", response_model=List[AttendanceRecord])
async def get_today_attendance():
    today = date.today().strftime("%Y-%m-%d")
    today_records = [
        AttendanceRecord(
            student_id=record["student_id"], 
            name=record["name"], 
            date=record["date"], 
            time=record["time"],
            marked_by=record["marked_by"]
        )
        for record in attendance_records
        if record["date"] == today
    ]
    return today_records

@app.get("/attendance/history", response_model=List[AttendanceRecord])
async def get_attendance_history():
    history = []
    if os.path.exists("attendance.csv"):
        with open("attendance.csv", "r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Force map CSV "StudentID" to model's "student_id"
                history.append(AttendanceRecord(
                    student_id=row.get("StudentID", "-"),
                    name=row.get("Name", "-"),
                    date=row.get("Date", "-"),
                    time=row.get("Time", "-"),
                    marked_by=row.get("MarkedBy", "-")
                ))
    return history


@app.post("/students/")
async def add_student(name: str = Form(...), student_id: str = Form(...), photo: UploadFile = File(...)):
    try:
        # Ensure known_faces directory exists
        if os.path.exists("backend/known_faces"):
            known_faces_dir = "backend/known_faces"
        else:
            known_faces_dir = "known_faces"
            os.makedirs(known_faces_dir, exist_ok=True)

        # Normalize and determine filename (use name as base)
        base_name = os.path.splitext(photo.filename)[0] or name
        safe_name = name.strip()
        file_ext = os.path.splitext(photo.filename)[1].lower() or ".jpg"
        filename = f"{safe_name}{file_ext}"
        save_path = os.path.join(known_faces_dir, filename)

        # Save uploaded file to disk
        contents = await photo.read()
        with open(save_path, "wb") as f:
            f.write(contents)

        # Update students.csv (create if missing)
        csv_path = "students.csv"
        is_new = not os.path.exists(csv_path)
        with open(csv_path, "a", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            if is_new:
                writer.writerow(["StudentID", "Name", "Class", "Email", "Phone", "JoinDate"])
            writer.writerow([student_id, safe_name, "", "", "", datetime.now().strftime("%Y-%m-%d")])

        # Update in-memory models
        try:
            image = face_recognition.load_image_file(save_path)
            encodings = face_recognition.face_encodings(image)
            if encodings:
                known_face_encodings.append(encodings[0])
                known_face_names.append(safe_name)
        except Exception as encode_err:
            # If encoding fails, keep file and CSV but report warning
            print(f"Warning: Failed to encode face for {safe_name}: {encode_err}")

        # Update student_map
        try:
            load_students()
        except Exception as e:
            print(f"Warning: Failed to reload students.csv: {e}")

        return {"success": True, "message": "Student added successfully", "photo_url": f"/static/{filename}", "id": student_id, "name": safe_name}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add student: {str(e)}")

@app.get("/get_attendance")
async def get_attendance():
    records = []
    try:
        with open("attendance.csv", mode="r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                records.append(row)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Attendance file not found")
    return {"status": "success", "data": records}

@app.get("/download/attendance")
async def download_attendance():
    if os.path.exists("attendance.csv"):
        return FileResponse(
            "attendance.csv",
            media_type="text/csv",
            filename="attendance_history.csv"
        )
    else:
        raise HTTPException(status_code=404, detail="Attendance file not found")


@app.get("/students_with_attendance_stats")
async def students_with_attendance_stats():
    today = date.today().strftime("%Y-%m-%d")
    students = []

    # Load all students from CSV
    with open("students.csv", "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            students.append({
                "name": row["Name"],
                "id": row["StudentID"],
                "photo_url": f"/static/{row['Name']}.jpg",
                "class": row.get("Class", ""),
                "email": row.get("Email", ""),
                "phone": row.get("Phone", ""),
                "join_date": row.get("JoinDate", "")
            })

    # Load full attendance history from file
    attendance_history = []
    if os.path.exists("attendance.csv"):
        with open("attendance.csv", "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            attendance_history = list(reader)

    # Calculate stats for each student
    for student in students:
        # All attendance records for this student
        records = [r for r in attendance_history if r["Name"] == student["name"]]
        present_days = len(records)
        total_days = len(set(r["Date"] for r in attendance_history))
        absent_days = max(total_days - present_days, 0)
        attendance_percent = (present_days / total_days * 100) if total_days > 0 else 0

        # Check if present today
        present_today = any(r["Name"] == student["name"] and r["Date"] == today for r in attendance_history)

        # Last seen time today (if present)
        last_seen = (
            max(r["Time"] for r in records if r["Date"] == today)
            if present_today else ""
        )

        student.update({
            "present_today": present_today,
            "present_days": present_days,
            "absent_days": absent_days,
            "attendance_percent": round(attendance_percent, 1),
            "total_days": total_days,
            "last_seen": last_seen
        })

    return students

# ----------------------------
# Main
# ----------------------------
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=7000)
















