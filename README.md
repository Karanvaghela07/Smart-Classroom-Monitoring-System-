# Smart Classroom Monitoring System

A web-based automated attendance tracking system using face recognition technology for educational institutions.

## 🎯 Project Overview

This system provides two separate interfaces for administrators (teachers) and students to manage classroom attendance efficiently using real-time face recognition technology.

## ✨ Features

### Admin/Teacher Panel
- **Dashboard**: Overview of attendance statistics and system activity
- **Student Management**: Add, edit, and manage student records with photos
- **Automated Attendance**: Real-time face recognition-based attendance marking
- **Attendance History**: View and filter attendance records with CSV export
- **Settings**: Configure system parameters and preferences
- **Gesture Recognition**: Detects student presence through facial gestures

### Student Panel
- **Attendance View**: Access personal attendance records and statistics
- **Limited Access**: Restricted to attendance-related information only

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Python Flask
- **Face Recognition**: OpenCV + face_recognition library
- **Database**: CSV file storage
- **Camera Integration**: Real-time webcam feed processing

## 📦 Dependencies

fastapi>=0.104.1
uvicorn[standard]>=0.24.0
gunicorn>=21.2.0
face-recognition>=1.3.0
opencv-python>=4.8.0
numpy>=1.24.0
Pillow>=10.0.0
python-multipart>=0.0.6


## 🚀 How It Works

1. **Student Registration**: Admin adds student data (photo, ID, name, contact)
2. **Face Data Storage**: System processes and stores facial features
3. **Lecture Start**: Camera activates automatically when lecture begins
4. **Attendance Marking**: System recognizes faces and marks attendance
5. **Duplicate Prevention**: Prevents multiple entries for the same day
6. **History Tracking**: All attendance records stored in history page


## 🔐 Access Levels

| Role | Access |
|------|--------|
| Admin/Teacher | Full system access - Dashboard, Student Management, Attendance, History, Settings |
| Student | Limited access - Personal attendance records only |

## 📊 Key Features

- **Real-time Recognition**: Instant face detection using webcam
- **Automated Process**: No manual attendance marking required
- **Data Management**: Complete CRUD operations for student records
- **Export Functionality**: Download attendance reports in CSV format
- **Responsive Design**: Works on desktop and tablet devices

## 🎓 Use Cases

- Educational institutions (Schools, Colleges, Universities)
- Training centers
- Corporate meeting rooms
- Workshop attendance tracking

## 👨‍💻 Developer

**Karan Vaghela**
- Email: vaghelakaran8599@gmail.com
- GitHub: [@Karanvaghela07](https://github.com/Karanvaghela07)
- LinkedIn: [karanvaghela07](https://www.linkedin.com/in/karanvaghela07/)

## 📝 License

This project is open source and available under the MIT License.

## ⭐ Acknowledgments

- OpenCV community for computer vision libraries
- face_recognition library by Adam Geitgey
- Flask framework documentation

---

**If you find this project helpful, please consider giving it a star! ⭐**

