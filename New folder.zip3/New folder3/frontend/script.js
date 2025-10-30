// API Base URL - Change this for production deployment
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:7000'
    : window.location.origin;

// Global variables
let video = null;
let canvas = null;
let ctx = null;
let stream = null;
let isDetecting = false;
let detectionInterval = null;
let lastRecognitionTime = 0;
let recognitionCooldown = 5000; // 5 seconds cooldown between recognitions

// Centralized Student Data Management
const STUDENTS_DATA = {
    'Aditya': {
        id: 1,
        name: 'Aditya',
        fullName: 'Aditya Sharma',
        studentId: 'STU001',
        class: 'Grade 10-A',
        email: 'aditya@school.com',
        phone: '+91 98765 43210',
        photo: '/static/Aditya.jpg',
        joinDate: '2024-01-15',
        lastSeen: null,
        attendanceHistory: [],
        totalPresent: 0,
        totalAbsent: 0,
        attendancePercentage: 0
    },
    'Karan': {
        id: 2,
        name: 'Karan',
        fullName: 'Karan Patel',
        studentId: 'STU002',
        class: 'Grade 10-B',
        email: 'karan@school.com',
        phone: '+91 98765 43211',
        photo: '/static/Karan.jpg',
        joinDate: '2024-01-16',
        lastSeen: null,
        attendanceHistory: [],
        totalPresent: 0,
        totalAbsent: 0,
        attendancePercentage: 0
    },
    'Niti': {
        id: 3,
        name: 'Niti',
        fullName: 'Niti Gupta',
        studentId: 'STU003',
        class: 'Grade 11-A',
        email: 'niti@school.com',
        phone: '+91 98765 43212',
        photo: '/static/Niti.jpg',
        joinDate: '2024-01-17',
        lastSeen: null,
        attendanceHistory: [],
        totalPresent: 0,
        totalAbsent: 0,
        attendancePercentage: 0
    },
    'Sahil': {
        id: 4,
        name: 'Sahil',
        fullName: 'Sahil Kumar',
        studentId: 'STU004',
        class: 'Grade 11-B',
        email: 'sahil@school.com',
        phone: '+91 98765 43213',
        photo: '/static/Sahil.jpg',
        joinDate: '2024-01-18',
        lastSeen: null,
        attendanceHistory: [],
        totalPresent: 0,
        totalAbsent: 0,
        attendancePercentage: 0
    },
    'Vinit': {
        id: 5,
        name: 'Vinit',
        fullName: 'Vinit Singh',
        studentId: 'STU005',
        class: 'Grade 10-A',
        email: 'vinit@school.com',
        phone: '+91 98765 43214',
        photo: '/static/Vinit.jpg',
        joinDate: '2024-08-01',
        lastSeen: null,
        attendanceHistory: [],
        totalPresent: 0,
        totalAbsent: 0,
        attendancePercentage: 0
    },
    'Shreyash': {
        id: 6,
        name: 'Shreyash',
        fullName: 'Shreyash Vekariya',
        studentId: 'STU006',
        class: 'Grade 10-A',
        email: 'vinit@school.com',
        phone: '+91 98765 43214',
        photo: '/static/Shreyash.jpg',
        joinDate: '2024-08-01',
        lastSeen: null,
        attendanceHistory: [],
        totalPresent: 0,
        totalAbsent: 0,
        attendancePercentage: 0
    },
    'Krinal': {
        id: 7,
        name: 'Krinal',
        fullName: 'Krinal Thummar',
        studentId: 'STU007',
        class: 'Grade 10-A',
        email: 'vinit@school.com',
        phone: '+91 98765 43214',
        photo: '/static/Krinal.jpg',
        joinDate: '2024-08-01',
        lastSeen: null,
        attendanceHistory: [],
        totalPresent: 0,
        totalAbsent: 0,
        attendancePercentage: 0
    },
    'Vaibhav': {
        id: 8,
        name: 'Vaibhav',
        fullName: 'Vibhav Jaiswal',
        studentId: 'STU008',
        class: 'Grade 10-A',
        email: 'vinit@school.com',
        phone: '+91 98765 43214',
        photo: '/static/Vaibhav.jpg',
        joinDate: '2024-08-01',
        lastSeen: null,
        attendanceHistory: [],
        totalPresent: 0,
        totalAbsent: 0,
        attendancePercentage: 0
    },
    'Sandhya': {
        id: 9,
        name: 'Sandyha',
        fullName: 'Sandhya Rana',
        studentId: 'STU009',
        class: 'Grade 10-A',
        email: 'vinit@school.com',
        phone: '+91 98765 43214',
        photo: '/static/Sandhya.jpg',
        joinDate: '2024-08-01',
        lastSeen: null,
        attendanceHistory: [],
        totalPresent: 0,
        totalAbsent: 0,
        attendancePercentage: 0
    },
    'Vishal': {
        id: 10,
        name: 'Vishal',
        fullName: 'Vishal Solanki',
        studentId: 'STU010',
        class: 'Grade 10-A',
        email: 'vinit@school.com',
        phone: '+91 98765 43214',
        photo: '/static/Vishal.jpg',
        joinDate: '2024-08-01',
        lastSeen: null,
        attendanceHistory: [],
        totalPresent: 0,
        totalAbsent: 0,
        attendancePercentage: 0
    }
};



// Global attendance state
let globalAttendanceData = {
    todayRecords: [],
    historyRecords: [],
    lastUpdated: null
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loaded, initializing page...');
    initializePage();
    initializeNavigation();
});

// Navigation functionality
function initializeNavigation() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenuWrapper = document.querySelector('.nav-menu-wrapper');
    
    if (mobileMenuBtn && navMenuWrapper) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenuBtn.classList.toggle('active');
            navMenuWrapper.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on a nav link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                navMenuWrapper.classList.remove('active');
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.navbar')) {
                mobileMenuBtn.classList.remove('active');
                navMenuWrapper.classList.remove('active');
            }
        });
    }
}

function initializePage() {
    const currentPage = getCurrentPage();
    console.log('Initializing page:', currentPage);

    switch (currentPage) {
        case 'index':
            initializeDashboard();
            break;
        case 'recognition':
            initializeRecognition();
            break;
        case 'history':
            initializeHistory();
            break;
        case 'students':
            initializeStudents();
            break;
    }
}

function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('recognition')) return 'recognition';
    if (path.includes('history')) return 'history';
    if (path.includes('students')) return 'students';
    return 'index';
}

// Theme Functions - Dark mode only
function initializeTheme() {
    // Always use dark theme
    document.body.className = 'dark-theme';
    localStorage.setItem('theme', 'dark');
}

// Dashboard Functions
function initializeDashboard() {
    initializeTheme();
    updateWelcomeMessage();
    updateCurrentDate();

    // Add animation delays to stat cards
    setTimeout(() => {
        const statCards = document.querySelectorAll('.animate-card');
        statCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.animationDelay = `${index * 100}ms`;
                card.classList.add('animate-card');
            }, index * 100);
        });
    }, 300);

    loadDashboardStats();
    loadRecentAttendanceForDashboard();
    initializeWeeklyChart();

    const downloadBtn = document.getElementById('download-csv');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadAttendanceCSV);
    }

    // Add floating animation to controls
    const themeControls = document.querySelector('.theme-controls');
    if (themeControls) {
        themeControls.classList.add('floating');
    }
}

function updateWelcomeMessage() {
    const now = new Date();
    const hour = now.getHours();
    let greeting;

    if (hour < 12) {
        greeting = 'Good morning';
    } else if (hour < 17) {
        greeting = 'Good afternoon';
    } else {
        greeting = 'Good evening';
    }

    const welcomeMsg = document.getElementById('welcome-message');
    if (welcomeMsg) {
        welcomeMsg.textContent = `${greeting}, Administrator! Welcome to your dashboard.`;
    }
}

function updateCurrentDate() {
    const now = new Date();
    const options = { month: 'short', day: 'numeric' };
    const dateStr = now.toLocaleDateString('en-US', options);

    const currentDateEl = document.getElementById('current-date');
    if (currentDateEl) {
        currentDateEl.textContent = dateStr;
    }
}

async function loadDashboardStats() {
    try {
        showLoading();

        const [studentsResponse, todayResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/students/`),
            fetch(`${API_BASE_URL}/attendance/today`)
        ]);

        const students = await studentsResponse.json();
        const todayAttendance = await todayResponse.json();

        const totalStudents = students.length;
        const todayCount = todayAttendance.length;
        const attendanceRate = totalStudents > 0 ? Math.round((todayCount / totalStudents) * 100) : 0;

        // Update stats with animation
        animateCounter('total-students', totalStudents);
        animateCounter('today-attendance', todayCount);
        animateCounter('attendance-rate', attendanceRate, '%');

        // Update attendance warning
        updateAttendanceWarning(attendanceRate);

        hideLoading();
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        hideLoading();
    }
}

function animateCounter(elementId, targetValue, suffix = '') {
    const element = document.getElementById(elementId);
    if (!element) return;

    const startValue = 0;
    const duration = 1000;
    const startTime = performance.now();

    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
        element.textContent = currentValue + suffix;

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }

    requestAnimationFrame(updateCounter);
}

function updateAttendanceWarning(rate) {
    const warningEl = document.getElementById('attendance-warning');
    if (warningEl) {
        const span = warningEl.querySelector('span');
        if (span) {
            span.textContent = `Low attendance rate today: ${rate}%`;
        }

        if (rate >= 70) {
            warningEl.style.display = 'none';
        } else {
            warningEl.style.display = 'flex';
        }
    }
}

async function loadRecentAttendanceForDashboard() {
    try {
        const response = await fetch(`${API_BASE_URL}/attendance/today`);
        const attendance = await response.json();

        const listEl = document.getElementById('recent-attendance-list');
        if (!listEl) return;

        if (attendance.length === 0) {
            listEl.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-clipboard-list"></i>
                    <p>No attendance recorded today</p>
                </div>
            `;
            return;
        }

        const recentAttendance = attendance.slice(-5).reverse();

        const html = recentAttendance.map(record => `
            <div class="attendance-item">
                <span class="attendance-name">${record.name}</span>
                <span class="attendance-time">${record.time}</span>
            </div>
        `).join('');

        listEl.innerHTML = html;

    } catch (error) {
        console.error('Error loading recent attendance:', error);
    }
}

function initializeWeeklyChart() {
    const ctx = document.getElementById('weeklyChart');
    if (!ctx) return;

    const weeklyData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Attendance',
            data: [2.5, 3, 4, 3.5, 4, 3, 4],
            borderColor: '#60a5fa',
            backgroundColor: 'rgba(96, 165, 250, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#60a5fa',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 3,
            pointRadius: 6,
            pointHoverRadius: 10,
            pointHoverBackgroundColor: '#3b82f6',
            pointHoverBorderColor: '#ffffff',
            pointHoverBorderWidth: 3
        }]
    };

    new Chart(ctx, {
        type: 'line',
        data: weeklyData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#9ca3af',
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#9ca3af',
                        font: {
                            size: 12
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// Recognition Functions
function initializeRecognition() {
    console.log('Initializing recognition page...');

    initializeTheme();

    video = document.getElementById('video');
    canvas = document.getElementById('canvas');

    if (canvas) {
        ctx = canvas.getContext('2d');
    }

    // Button event listeners
    const startBtn = document.getElementById('start-camera');
    const stopBtn = document.getElementById('stop-camera');
    const captureBtn = document.getElementById('capture');
    const manualBtn = document.getElementById('mark-manual-attendance');

    console.log('Found buttons:', { startBtn, stopBtn, captureBtn, manualBtn });

    if (startBtn) {
        startBtn.addEventListener('click', function (e) {
            e.preventDefault();
            console.log('Start camera clicked');
            startCamera();
        });
    }

    if (stopBtn) {
        stopBtn.addEventListener('click', function (e) {
            e.preventDefault();
            console.log('Stop camera clicked');
            stopCamera();
        });
    }

    if (captureBtn) {
        captureBtn.addEventListener('click', function (e) {
            e.preventDefault();
            console.log('Capture clicked');
            captureAndRecognize();
        });
    }

    if (manualBtn) {
        manualBtn.addEventListener('click', function (e) {
            e.preventDefault();
            console.log('Manual attendance clicked');
            markManualAttendance();
        });
    }

    // Set current time for manual entry
    const timeInput = document.getElementById('attendance-time');
    if (timeInput) {
        const now = new Date();
        const timeString = now.toTimeString().slice(0, 5);
        timeInput.value = timeString;
    }

    loadTodayAttendanceForRecognition();

    console.log('Recognition page initialized successfully');
}

async function startCamera() {
    console.log('Starting camera...');

    try {
        showLoading();

        // Request camera access
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user'
            }
        });

        console.log('Camera stream obtained:', stream);

        // Set video source
        if (video) {
            video.srcObject = stream;

            // Wait for video to be ready
            video.addEventListener('loadedmetadata', () => {
                console.log('Video metadata loaded, starting automatic detection');
                startAutomaticDetection();
            });
        }

        // Update UI
        const startBtn = document.getElementById('start-camera');
        const captureBtn = document.getElementById('capture');
        const stopBtn = document.getElementById('stop-camera');

        if (startBtn) startBtn.style.display = 'none';
        if (captureBtn) {
            captureBtn.style.display = 'inline-block';
            captureBtn.textContent = 'Manual Capture';
            captureBtn.innerHTML = '<i class="fas fa-camera"></i><span>Manual Capture</span>';
        }
        if (stopBtn) stopBtn.style.display = 'inline-block';

        // Update recognition indicator
        updateRecognitionIndicator('detecting', 'Automatic face detection active...');

        // Add scanning line to camera container
        const cameraContainer = document.querySelector('.camera-container');
        if (cameraContainer) {
            cameraContainer.classList.add('auto-detecting');

            // Add scanning line
            const scanningLine = document.createElement('div');
            scanningLine.className = 'scanning-line';
            cameraContainer.appendChild(scanningLine);
        }

        // Update recognition results
        const resultsEl = document.getElementById('recognition-results');
        if (resultsEl) {
            resultsEl.innerHTML = `
                <div class="no-recognition">
                    <i class="fas fa-eye fa-pulse"></i>
                    <p>🤖 AI is actively scanning for faces...</p>
                    <small>No need to click capture - attendance will be marked automatically!</small>
                </div>
            `;
        }

        hideLoading();
        showNotification('Camera started! AI face detection is now active.', 'success');
        console.log('Camera started successfully with automatic detection');

    } catch (error) {
        console.error('Error accessing camera:', error);
        hideLoading();
        updateRecognitionIndicator('error', 'Camera access denied');
        showNotification('Error accessing camera. Please ensure camera permissions are granted.', 'error');
    }
}

function stopCamera() {
    console.log('Stopping camera...');

    // Stop automatic detection
    stopAutomaticDetection();

    // Remove scanning effects
    const cameraContainer = document.querySelector('.camera-container');
    if (cameraContainer) {
        cameraContainer.classList.remove('auto-detecting');
        const scanningLine = cameraContainer.querySelector('.scanning-line');
        if (scanningLine) {
            scanningLine.remove();
        }
    }

    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }

    if (video) {
        video.srcObject = null;
    }

    // Update UI
    const startBtn = document.getElementById('start-camera');
    const captureBtn = document.getElementById('capture');
    const stopBtn = document.getElementById('stop-camera');

    if (startBtn) startBtn.style.display = 'inline-block';
    if (captureBtn) captureBtn.style.display = 'none';
    if (stopBtn) stopBtn.style.display = 'none';

    // Update recognition indicator
    updateRecognitionIndicator('offline', 'Camera stopped');

    // Update recognition results
    const resultsEl = document.getElementById('recognition-results');
    if (resultsEl) {
        resultsEl.innerHTML = `
            <div class="no-recognition">
                <i class="fas fa-camera"></i>
                <p>Start camera to begin automatic face detection</p>
            </div>
        `;
    }

    showNotification('Camera and AI detection stopped', 'info');
}

async function captureAndRecognize() {
    console.log('Capturing and recognizing...');

    if (!video || !canvas || !stream) {
        showNotification('Camera not active. Please start camera first.', 'error');
        return;
    }

    try {
        showLoading();

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0);

        // Convert canvas to blob
        canvas.toBlob(async (blob) => {
            try {
                const formData = new FormData();
                formData.append('file', blob, 'capture.jpg');

                console.log('Sending image to AI model...');

                const response = await fetch(`${API_BASE_URL}/recognize/`, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log('AI Recognition result:', result);

                displayRecognitionResults(result);

                if (result.attendance_updated) {
                    loadTodayAttendanceForRecognition();
                }

                hideLoading();

            } catch (error) {
                console.error('Error during recognition:', error);
                hideLoading();
                displayRecognitionResults({
                    recognized_names: [],
                    attendance_updated: false,
                    message: 'Recognition failed. Please try again.'
                });
            }
        }, 'image/jpeg', 0.8);

    } catch (error) {
        console.error('Error capturing image:', error);
        hideLoading();
        showNotification('Error capturing image', 'error');
    }
}

function displayRecognitionResults(result) {
    const resultsEl = document.getElementById('recognition-results');
    if (!resultsEl) return;

    if (result.recognized_names && result.recognized_names.length > 0) {
        const names = result.recognized_names.join(', ');
        const attendanceStatus = result.attendance_updated ? 'Attendance marked successfully!' : 'Already marked today';

        // Update centralized data if attendance was marked
        if (result.attendance_updated) {
            result.recognized_names.forEach(name => {
                const currentTime = new Date().toTimeString().slice(0, 8);
                markAttendance(name, currentTime);
            });
        }

        // Get full names for display
        const fullNames = result.recognized_names.map(name => {
            const student = STUDENTS_DATA[name];
            return student ? student.fullName : name;
        }).join(', ');

        resultsEl.innerHTML = `
            <div class="recognition-success">
                <i class="fas fa-check-circle"></i>
                <h4>Recognition Successful!</h4>
                <p><strong>Recognized:</strong> ${fullNames}</p>
                <p>${attendanceStatus}</p>
            </div>
        `;

        updateRecognitionIndicator('success', `Recognized: ${fullNames}`);
        showNotification(`Welcome ${fullNames}! ${attendanceStatus}`, 'success');

        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (stream) {
                resultsEl.innerHTML = `
                    <div class="no-recognition">
                        <i class="fas fa-video"></i>
                        <p>Camera active - Click "Capture & Recognize" button</p>
                    </div>
                `;
                updateRecognitionIndicator('ready', 'Camera ready - Click capture to recognize');
            }
        }, 5000);

    } else {
        resultsEl.innerHTML = `
            <div class="recognition-error">
                <i class="fas fa-times-circle"></i>
                <h4>No Face Recognized</h4>
                <p>${result.message || 'Please try again or use manual entry'}</p>
            </div>
        `;

        updateRecognitionIndicator('error', 'No face recognized');
        showNotification('No face recognized. Please try again.', 'error');

        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (stream) {
                resultsEl.innerHTML = `
                    <div class="no-recognition">
                        <i class="fas fa-video"></i>
                        <p>Camera active - Click "Capture & Recognize" button</p>
                    </div>
                `;
                updateRecognitionIndicator('ready', 'Camera ready - Click capture to recognize');
            }
        }, 3000);
    }
}

function updateRecognitionIndicator(status, message) {
    const indicator = document.getElementById('recognition-indicator');
    if (!indicator) return;

    const icon = indicator.querySelector('i');
    const text = indicator.querySelector('span');

    // Remove all status classes
    indicator.classList.remove('success', 'warning', 'error', 'processing');

    switch (status) {
        case 'ready':
            indicator.classList.add('success');
            if (icon) icon.className = 'fas fa-user-check';
            break;
        case 'detecting':
            indicator.classList.add('warning');
            if (icon) icon.className = 'fas fa-eye fa-pulse';
            break;
        case 'processing':
            indicator.classList.add('processing');
            if (icon) icon.className = 'fas fa-brain fa-spin';
            break;
        case 'success':
            indicator.classList.add('success');
            if (icon) icon.className = 'fas fa-check-circle';
            break;
        case 'error':
            indicator.classList.add('error');
            if (icon) icon.className = 'fas fa-exclamation-triangle';
            break;
        case 'offline':
            if (icon) icon.className = 'fas fa-camera-slash';
            break;
        default:
            if (icon) icon.className = 'fas fa-user-slash';
    }

    if (text) text.textContent = message;
}

async function loadTodayAttendanceForRecognition() {
    try {
        const response = await fetch(`${API_BASE_URL}/attendance/today`);
        const attendance = await response.json();

        const listEl = document.getElementById('today-attendance-list');
        const countEl = document.getElementById('attendance-count');

        if (countEl) {
            countEl.textContent = `${attendance.length} marked`;
        }

        if (!listEl) return;

        if (attendance.length === 0) {
            listEl.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-clipboard-list"></i>
                    <p>No attendance recorded today</p>
                </div>
            `;
            return;
        }

        const recentAttendance = attendance.slice().reverse();

        const html = recentAttendance.map(record => `
            <div class="attendance-item">
                <div class="attendance-info">
                    <span class="attendance-name">${record.name}</span>
                    <span class="attendance-time">${record.time}</span>
                </div>
                <div class="attendance-status">
                    <i class="fas fa-check-circle"></i>
                </div>
            </div>
        `).join('');

        listEl.innerHTML = html;

    } catch (error) {
        console.error('Error loading today attendance:', error);
    }
}

async function markManualAttendance() {
    const nameInput = document.getElementById('student-name');
    const idInput = document.getElementById('student-id');
    const timeInput = document.getElementById('attendance-time');

    const inputName = nameInput ? nameInput.value.trim() : '';
    const studentId = idInput ? idInput.value.trim() : '';
    const time = timeInput ? timeInput.value : '';

    if (!inputName) {
        showNotification('Please enter student name', 'error');
        return;
    }

    // Find matching student by name or ID
    let matchedStudent = null;
    let studentKey = null;

    for (const [key, student] of Object.entries(STUDENTS_DATA)) {
        if (student.fullName.toLowerCase().includes(inputName.toLowerCase()) ||
            student.name.toLowerCase() === inputName.toLowerCase() ||
            student.studentId === studentId) {
            matchedStudent = student;
            studentKey = key;
            break;
        }
    }

    if (!matchedStudent) {
        showNotification('Student not found in the system', 'error');
        return;
    }

    try {
        showLoading();

        // Mark attendance using centralized system
        const currentTime = time || new Date().toTimeString().slice(0, 8);
        const wasMarked = markAttendance(studentKey, currentTime);

        const manualResult = {
            recognized_names: [studentKey],
            attendance_updated: wasMarked,
            message: `Manual attendance marked for ${matchedStudent.fullName}`
        };

        displayRecognitionResults(manualResult);

        // Clear form
        if (nameInput) nameInput.value = '';
        if (idInput) idInput.value = '';

        hideLoading();

    } catch (error) {
        console.error('Error marking manual attendance:', error);
        hideLoading();
        showNotification('Error marking manual attendance', 'error');
    }
}

// History Functions
let allHistoryData = [];
let filteredHistoryData = [];
let currentPage = 1;
let recordsPerPage = 25;

function initializeHistory() {
    initializeTheme();

    // Add animation delays to stat cards
    setTimeout(() => {
        const statCards = document.querySelectorAll('.animate-card');
        statCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.animationDelay = `${index * 100}ms`;
                card.classList.add('animate-card');
            }, index * 100);
        });
    }, 300);

    loadHistoryData();
    setupHistoryEventListeners();
    initializeHistoryStats();
    setupTableSorting();
}

function setupHistoryEventListeners() {
    const dateFromInput = document.getElementById('date-from');
    const dateToInput = document.getElementById('date-to');
    const studentFilter = document.getElementById('student-filter');
    const classFilter = document.getElementById('class-filter');
    const searchInput = document.getElementById('search-records');
    const searchBtn = document.getElementById('search-btn');
    const clearBtn = document.getElementById('clear-filters');
    const downloadBtn = document.getElementById('download-csv');
    const pageSizeSelect = document.getElementById('page-size');
    const selectAllCheckbox = document.getElementById('select-all');

    if (dateFromInput) dateFromInput.addEventListener('change', applyHistoryFilters);
    if (dateToInput) dateToInput.addEventListener('change', applyHistoryFilters);
    if (studentFilter) studentFilter.addEventListener('change', applyHistoryFilters);
    if (classFilter) classFilter.addEventListener('change', applyHistoryFilters);
    if (searchInput) searchInput.addEventListener('input', applyHistoryFilters);
    if (searchBtn) searchBtn.addEventListener('click', applyHistoryFilters);
    if (clearBtn) clearBtn.addEventListener('click', clearHistoryFilters);
    if (downloadBtn) downloadBtn.addEventListener('click', downloadAttendanceCSV);

    if (pageSizeSelect) {
        pageSizeSelect.addEventListener('change', (e) => {
            recordsPerPage = parseInt(e.target.value);
            currentPage = 1;
            displayHistoryTable();
            setupHistoryPagination();
        });
    }

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function () {
            const checkboxes = document.querySelectorAll('.attendance-table tbody input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
    }
}

async function loadHistoryData() {
    try {
        showLoading();

        const [historyResponse, studentsResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/attendance/history`),
            fetch(`${API_BASE_URL}/students/`)
        ]);

        allHistoryData = await historyResponse.json();
        const students = await studentsResponse.json();

        filteredHistoryData = [...allHistoryData];

        updateHistoryStats();
        populateStudentFilter(students);
        displayHistoryTable();
        setupHistoryPagination();
        updateHistoryChart('week');

        hideLoading();

    } catch (error) {
        console.error('Error loading history data:', error);
        hideLoading();
        showNotification('Error loading attendance history', 'error');
    }
}

function updateHistoryStats() {
    const totalRecords = allHistoryData.length;
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = allHistoryData.filter(record => record.date === today).length;

    // Calculate this week's records
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekRecords = allHistoryData.filter(record => record.date >= weekStartStr).length;

    // Calculate daily average (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRecords = allHistoryData.filter(record => new Date(record.date) >= thirtyDaysAgo);
    const avgDaily = Math.round(recentRecords.length / 30);

    animateCounter('total-records', totalRecords);
    animateCounter('today-records', todayRecords);
    animateCounter('week-records', weekRecords);
    animateCounter('avg-daily', avgDaily);
}

function populateStudentFilter(students) {
    const studentFilter = document.getElementById('student-filter');
    if (!studentFilter) return;

    const options = students.map(student =>
        `<option value="${student.name}">${student.name}</option>`
    ).join('');

    studentFilter.innerHTML = '<option value="">All Students</option>' + options;
}

function displayHistoryTable() {
    const tbody = document.getElementById('history-tbody');
    const showingEl = document.getElementById('showing-records');

    if (!tbody) return;

    if (filteredHistoryData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="loading-row">
                    <i class="fas fa-search"></i>
                    No attendance records found
                </td>
            </tr>
        `;
        if (showingEl) showingEl.textContent = 'Showing 0 of 0 records';
        return;
    }

    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const pageData = filteredHistoryData.slice(startIndex, endIndex);

    const html = pageData.map(record => `
        <tr>
            <td>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-user-circle" style="color: var(--purple);"></i>
                    ${record.name}
                </div>
            </td>
            <td>${formatDate(record.date)}</td>
            <td>${record.time}</td>
            <td>
                <span class="status-badge present">
                    <i class="fas fa-check-circle"></i>
                    Present
                </span>
            </td>
            <td>
                <div class="action-cell">
                    <button class="action-icon" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-icon" title="Edit Record">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    tbody.innerHTML = html;

    if (showingEl) {
        const showing = Math.min(endIndex, filteredHistoryData.length);
        showingEl.textContent = `Showing ${startIndex + 1}-${showing} of ${filteredHistoryData.length} records`;
    }
}

function setupHistoryPagination() {
    const totalPages = Math.ceil(filteredHistoryData.length / recordsPerPage);
    const paginationContainer = document.getElementById('pagination');
    const paginationText = document.getElementById('pagination-text');

    if (paginationText) {
        paginationText.textContent = `Page ${currentPage} of ${totalPages}`;
    }

    if (!paginationContainer || totalPages <= 1) {
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }

    let paginationHTML = '';

    // Previous button
    if (currentPage > 1) {
        paginationHTML += `<button class="page-btn" onclick="changeHistoryPage(${currentPage - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>`;
    }

    // Page numbers (show max 5 pages)
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `<button class="page-btn ${i === currentPage ? 'active' : ''}" 
                          onclick="changeHistoryPage(${i})">${i}</button>`;
    }

    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `<button class="page-btn" onclick="changeHistoryPage(${currentPage + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>`;
    }

    paginationContainer.innerHTML = paginationHTML;
}

function changeHistoryPage(page) {
    currentPage = page;
    displayHistoryTable();
    setupHistoryPagination();
}

function applyHistoryFilters() {
    const dateFrom = document.getElementById('date-from')?.value;
    const dateTo = document.getElementById('date-to')?.value;
    const studentName = document.getElementById('student-filter')?.value;
    const searchTerm = document.getElementById('search-records')?.value.toLowerCase();

    filteredHistoryData = allHistoryData.filter(record => {
        const matchesDateFrom = !dateFrom || record.date >= dateFrom;
        const matchesDateTo = !dateTo || record.date <= dateTo;
        const matchesStudent = !studentName || record.name === studentName;
        const matchesSearch = !searchTerm || record.name.toLowerCase().includes(searchTerm);

        return matchesDateFrom && matchesDateTo && matchesStudent && matchesSearch;
    });

    currentPage = 1;
    displayHistoryTable();
    setupHistoryPagination();
}

function clearHistoryFilters() {
    const dateFrom = document.getElementById('date-from');
    const dateTo = document.getElementById('date-to');
    const studentFilter = document.getElementById('student-filter');
    const searchInput = document.getElementById('search-records');

    if (dateFrom) dateFrom.value = '';
    if (dateTo) dateTo.value = '';
    if (studentFilter) studentFilter.value = '';
    if (searchInput) searchInput.value = '';

    filteredHistoryData = [...allHistoryData];
    currentPage = 1;
    displayHistoryTable();
    setupHistoryPagination();
}

function initializeHistoryChart() {
    const ctx = document.getElementById('attendanceChart');
    if (!ctx) return;

    // Sample data for the chart
    const chartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Daily Attendance',
            data: [12, 8, 15, 10, 14, 6, 4],
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#8b5cf6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8
        }]
    };

    window.historyChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#a0a3bd'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#a0a3bd'
                    }
                }
            }
        }
    });
}

function updateHistoryChart(period) {
    if (!window.historyChart) return;

    let labels, data;

    switch (period) {
        case 'week':
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            data = [12, 8, 15, 10, 14, 6, 4];
            break;
        case 'month':
            labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
            data = [45, 52, 38, 41];
            break;
        case 'year':
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            data = [180, 165, 190, 175, 200, 185, 170, 195, 210, 188, 175, 160];
            break;
    }

    window.historyChart.data.labels = labels;
    window.historyChart.data.datasets[0].data = data;
    window.historyChart.update();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Make changeHistoryPage available globally
window.changeHistoryPage = changeHistoryPage;

// Students Functions
function initializeStudents() {
    initializeTheme();
    loadStudentsData();
    setupStudentsEventListeners();

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function setupStudentsEventListeners() {
    const searchInput = document.getElementById('student-search');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const addStudentBtn = document.getElementById('add-student-btn');
    const exportBtn = document.getElementById('export-students-btn');
    const modal = document.getElementById('add-student-modal');
    const closeModal = document.getElementById('close-modal');
    const cancelBtn = document.getElementById('cancel-add');
    const addForm = document.getElementById('add-student-form');

    if (searchInput) {
        searchInput.addEventListener('input', filterStudents);
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterStudents();
        });
    });

    if (addStudentBtn) {
        addStudentBtn.addEventListener('click', () => {
            if (modal) modal.style.display = 'flex';
        });
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', exportStudentsList);
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            if (modal) modal.style.display = 'none';
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (modal) modal.style.display = 'none';
        });
    }

    if (addForm) {
        addForm.addEventListener('submit', handleAddStudent);
    }

    // Close modal on outside click
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}

let allStudents = [];
let todayAttendance = [];

async function loadStudentsData() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/students_with_attendance_stats`);
        if (!response.ok) throw new Error('Failed to fetch students attendance stats');
        const students = await response.json();

        updateStudentsStats(students);
        displayStudents(students);
        hideLoading();
    } catch (error) {
        console.error('Error loading students data:', error);
        hideLoading();
        showNotification('Error loading students data', 'error');
    }
}

function updateStudentsStats(students) {
    const total = students.length;
    const present = students.filter(s => s.present_today).length;
    const absent = total - present;
    const avg = total > 0
        ? Math.round(students.reduce((sum, s) => sum + s.attendance_percent, 0) / total)
        : 0;

    animateCounter('total-students-count', total);
    animateCounter('present-today-count', present);
    animateCounter('absent-today-count', absent);
    animateCounter('attendance-percentage', avg, '%');
}

function displayStudents(students) {
    const grid = document.getElementById('students-grid');
    if (!grid) return;

    if (students.length === 0) {
        grid.innerHTML = "<div class='loading-students'><i class='fas fa-users'></i><p>No students found</p></div>";
        return;
    }

    grid.innerHTML = students.map(student => `
        <div class="student-card" data-name="${student.name.toLowerCase()}" data-status="${student.present_today ? 'present' : 'absent'}">
            <div class="student-status ${student.present_today ? 'present' : 'absent'}">
                <i class="fas ${student.present_today ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                ${student.present_today ? 'Present Today' : 'Absent Today'}
            </div>
            <img src="${API_BASE_URL}${student.photo_url}" alt="${student.name}" class="student-photo"
                 onerror="this.src='https://via.placeholder.com/96x96/ccc/fff?text=${student.name.charAt(0)}'">
            <div class="student-info">
                <div class="student-name">${student.name}</div>
                <div class="student-details">
                    <div class="student-detail"><i class="fas fa-id-card"></i><span>ID: ${student.id}</span></div>
                    <div class="student-detail"><i class="fas fa-calendar-check"></i>
                        <span>Last Seen: ${student.last_seen ? student.last_seen : (student.present_today ? 'Today' : 'Never')}</span>
                    </div>
                    <div class="student-detail"><i class="fas fa-chart-line"></i>
                        <span>Attendance: ${student.present_days}/${student.total_days} (${student.attendance_percent}%)</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}
document.addEventListener('DOMContentLoaded', function () {
    if (getCurrentPage() === 'students') {
        loadStudentsData();
    }
});


function filterStudents() {
    const searchTerm = document.getElementById('student-search')?.value.toLowerCase() || '';
    const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const studentCards = document.querySelectorAll('.student-card');

    studentCards.forEach(card => {
        const name = card.dataset.name;
        const status = card.dataset.status;

        const matchesSearch = name.includes(searchTerm);
        const matchesFilter = activeFilter === 'all' || status === activeFilter;

        card.style.display = matchesSearch && matchesFilter ? 'block' : 'none';
    });
}

async function handleAddStudent(e) {
    e.preventDefault();

    const name = document.getElementById('new-student-name')?.value.trim();
    const studentId = document.getElementById('new-student-id')?.value.trim();
    const photoFile = document.getElementById('new-student-photo')?.files[0];

    if (!name || !studentId || !photoFile) {
        showNotification('Please fill all fields', 'error');
        return;
    }

    try {
        showLoading();

        // In a real application, you would upload the photo and add the student to the database
        // For now, we'll just show a success message
        showNotification(`Student ${name} would be added to the system`, 'success');

        // Close modal and reset form
        const modal = document.getElementById('add-student-modal');
        if (modal) modal.style.display = 'none';

        const form = document.getElementById('add-student-form');
        if (form) form.reset();

        hideLoading();

    } catch (error) {
        console.error('Error adding student:', error);
        hideLoading();
        showNotification('Error adding student', 'error');
    }
}

async function exportStudentsList() {
    try {
        showLoading();

        // Create CSV content
        const csvContent = [
            ['Name', 'Status', 'Last Seen'],
            ...allStudents.map(student => {
                const isPresent = todayAttendance.some(record => record.name === student.name);
                return [
                    student.name,
                    isPresent ? 'Present' : 'Absent',
                    isPresent ? 'Today' : 'Not today'
                ];
            })
        ].map(row => row.join(',')).join('\n');

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'students_list.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        hideLoading();
        showNotification('Students list exported successfully!', 'success');

    } catch (error) {
        console.error('Error exporting students list:', error);
        hideLoading();
        showNotification('Error exporting students list', 'error');
    }
}

// Utility Functions
function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'flex';
    }
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'none';
    }
}

async function downloadAttendanceCSV() {
    try {
        const response = await fetch(`${API_BASE_URL}/download/attendance`);

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'attendance_history.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showNotification('Attendance file downloaded successfully!', 'success');
        } else {
            showNotification('Error downloading attendance file', 'error');
        }
    } catch (error) {
        console.error('Error downloading CSV:', error);
        showNotification('Error downloading attendance file', 'error');
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Add notification styles
const notificationStyles = `
.notification {
    position: fixed;
    top: 100px;
    right: 20px;
    background: var(--dark-bg-secondary);
    color: var(--dark-text-primary);
    padding: 1rem 1.5rem;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    z-index: 1000;
    animation: slideInRight 0.3s ease-out;
    border-left: 4px solid;
    max-width: 400px;
}

.notification.success {
    border-left-color: #10b981;
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
}

.notification.error {
    border-left-color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
}

.notification.info {
    border-left-color: #3b82f6;
    background: rgba(59, 130, 246, 0.1);
    color: #2563eb;
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
`;

// Add notification styles to head
if (!document.querySelector('#notification-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'notification-styles';
    styleSheet.textContent = notificationStyles;
    document.head.appendChild(styleSheet);
}// Initialize History Stats
function initializeHistoryStats() {
    // Set the stats values to match the image
    const totalDays = document.getElementById('total-days');
    const totalRecords = document.getElementById('total-records');
    const avgAttendance = document.getElementById('avg-attendance');

    if (totalDays) animateCounter('total-days', 22);
    if (totalRecords) animateCounter('total-records', 72);
    if (avgAttendance) animateCounter('avg-attendance', 81.8, '%');
}

// Setup Table Sorting
function setupTableSorting() {
    const sortableHeaders = document.querySelectorAll('.sortable');

    sortableHeaders.forEach(header => {
        header.addEventListener('click', function () {
            const sortBy = this.dataset.sort;
            const icon = this.querySelector('i');

            // Reset all other icons
            sortableHeaders.forEach(h => {
                if (h !== this) {
                    h.querySelector('i').className = 'fas fa-sort';
                }
            });

            // Toggle sort direction
            if (icon.classList.contains('fa-sort')) {
                icon.className = 'fas fa-sort-up';
                sortTable(sortBy, 'asc');
            } else if (icon.classList.contains('fa-sort-up')) {
                icon.className = 'fas fa-sort-down';
                sortTable(sortBy, 'desc');
            } else {
                icon.className = 'fas fa-sort-up';
                sortTable(sortBy, 'asc');
            }
        });
    });
}

// Sort Table Function
function sortTable(column, direction) {
    // This would sort the filteredHistoryData array
    // For now, just show visual feedback
    showNotification(`Sorting by ${column} (${direction})`, 'info');
}

// Clear History Filters
function clearHistoryFilters() {
    const dateFrom = document.getElementById('date-from');
    const dateTo = document.getElementById('date-to');
    const studentFilter = document.getElementById('student-filter');
    const classFilter = document.getElementById('class-filter');
    const searchInput = document.getElementById('search-records');

    if (dateFrom) dateFrom.value = '';
    if (dateTo) dateTo.value = '';
    if (studentFilter) studentFilter.value = '';
    if (classFilter) classFilter.value = '';
    if (searchInput) searchInput.value = '';

    // Reset to default date range
    if (dateFrom) dateFrom.value = '2025-07-15';
    if (dateTo) dateTo.value = '2025-08-14';

    applyHistoryFilters();
    showNotification('Filters cleared', 'success');
}

// Apply History Filters
function applyHistoryFilters() {
    // Get filter values
    const dateFrom = document.getElementById('date-from')?.value;
    const dateTo = document.getElementById('date-to')?.value;
    const studentName = document.getElementById('student-filter')?.value;
    const className = document.getElementById('class-filter')?.value;
    const searchTerm = document.getElementById('search-records')?.value.toLowerCase();

    // Apply filters to data (placeholder implementation)
    console.log('Applying filters:', { dateFrom, dateTo, studentName, className, searchTerm });

    // Update table display
    displayHistoryTable();

    // Show loading animation
    const tbody = document.getElementById('history-tbody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="loading-row">
                    <i class="fas fa-spinner fa-spin"></i>
                    Filtering records...
                </td>
            </tr>
        `;

        // Simulate loading delay
        setTimeout(() => {
            displaySampleHistoryData();
        }, 500);
    }
}

// Display Sample History Data
function displaySampleHistoryData() {
    const tbody = document.getElementById('history-tbody');
    if (!tbody) return;

    const sampleData = [
        {
            date: '8/13/2025',
            time: '09:59 AM',
            name: 'Krisha Patel',
            id: 'STU001',
            class: 'Grade 10-A',
            status: 'present'
        },
        {
            date: '8/13/2025',
            time: '10:15 AM',
            name: 'Aditya Sharma',
            id: 'STU002',
            class: 'Grade 10-B',
            status: 'present'
        },
        {
            date: '8/13/2025',
            time: '10:30 AM',
            name: 'Sahil Kumar',
            id: 'STU003',
            class: 'Grade 11-A',
            status: 'present'
        },
        {
            date: '8/12/2025',
            time: '09:45 AM',
            name: 'Niti Gupta',
            id: 'STU004',
            class: 'Grade 10-A',
            status: 'present'
        },
        {
            date: '8/12/2025',
            time: '10:00 AM',
            name: 'Vinit Singh',
            id: 'STU005',
            class: 'Grade 11-B',
            status: 'present'
        }
    ];

    const html = sampleData.map((record, index) => `
        <tr style="animation-delay: ${index * 50}ms" class="table-row-animate">
            <td><input type="checkbox"></td>
            <td>${record.date}</td>
            <td>${record.time}</td>
            <td>${record.name}</td>
            <td>${record.id}</td>
            <td>${record.class}</td>
            <td><span class="status-badge ${record.status}"><i class="fas fa-check"></i> PRESENT</span></td>
            <td class="actions-cell">
                <button class="action-icon edit-btn" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-icon delete-btn" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    tbody.innerHTML = html;

    // Add animation class to new rows
    setTimeout(() => {
        const rows = tbody.querySelectorAll('.table-row-animate');
        rows.forEach(row => {
            row.style.opacity = '0';
            row.style.transform = 'translateY(20px)';
            row.style.animation = 'fadeInUp 0.5s ease-out forwards';
        });
    }, 100);

    // Update showing records info
    const showingRecords = document.getElementById('showing-records');
    if (showingRecords) {
        showingRecords.textContent = `Showing 1 to ${sampleData.length} of 72 entries`;
    }
}

// Download Attendance CSV
function downloadAttendanceCSV() {
    showNotification('Preparing CSV export...', 'info');

    // Simulate CSV generation
    setTimeout(() => {
        const csvContent = `Date,Time,Student Name,Student ID,Class,Status
8/13/2025,09:59 AM,Krisha Patel,STU001,Grade 10-A,Present
8/13/2025,10:15 AM,Aditya Sharma,STU002,Grade 10-B,Present
8/13/2025,10:30 AM,Sahil Kumar,STU003,Grade 11-A,Present
8/12/2025,09:45 AM,Niti Gupta,STU004,Grade 10-A,Present
8/12/2025,10:00 AM,Vinit Singh,STU005,Grade 11-B,Present`;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'attendance-history.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        showNotification('CSV exported successfully!', 'success');
    }, 1000);
}

// Initialize sample data on page load
document.addEventListener('DOMContentLoaded', function () {
    if (getCurrentPage() === 'history') {
        setTimeout(() => {
            displaySampleHistoryData();
        }, 1000);
    }
});// Automatic Face Detection Functions
function startAutomaticDetection() {
    if (isDetecting) return;

    isDetecting = true;
    console.log('Starting automatic face detection...');

    // Start detection loop
    detectionInterval = setInterval(() => {
        if (video && video.readyState === 4 && !video.paused) {
            performAutomaticRecognition();
        }
    }, 2000); // Check every 2 seconds

    updateRecognitionIndicator('detecting', 'AI scanning for faces...');
}

function stopAutomaticDetection() {
    if (!isDetecting) return;

    isDetecting = false;

    if (detectionInterval) {
        clearInterval(detectionInterval);
        detectionInterval = null;
    }

    console.log('Stopped automatic face detection');
}

async function performAutomaticRecognition() {
    // Check cooldown period
    const currentTime = Date.now();
    if (currentTime - lastRecognitionTime < recognitionCooldown) {
        return;
    }

    if (!video || !canvas || !stream || !isDetecting) {
        return;
    }

    try {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0);

        // Convert canvas to blob
        canvas.toBlob(async (blob) => {
            try {
                const formData = new FormData();
                formData.append('file', blob, 'auto_capture.jpg');

                console.log('Sending frame to AI model for automatic recognition...');
                updateRecognitionIndicator('processing', 'AI processing face...');

                const response = await fetch(`${API_BASE_URL}/recognize/`, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log('Automatic recognition result:', result);

                if (result.recognized_names && result.recognized_names.length > 0) {
                    // Face detected and recognized!
                    lastRecognitionTime = currentTime;
                    displayAutomaticRecognitionResults(result);

                    if (result.attendance_updated) {
                        loadTodayAttendanceForRecognition();

                        // Show success animation
                        showSuccessAnimation();
                    }
                } else {
                    // No face detected, continue scanning
                    updateRecognitionIndicator('detecting', 'AI scanning for faces...');
                }

            } catch (error) {
                console.error('Error during automatic recognition:', error);
                updateRecognitionIndicator('detecting', 'AI scanning for faces...');
            }
        }, 'image/jpeg', 0.8);

    } catch (error) {
        console.error('Error capturing frame for automatic recognition:', error);
    }
}

function displayAutomaticRecognitionResults(result) {
    const resultsEl = document.getElementById('recognition-results');
    if (!resultsEl) return;

    if (result.recognized_names && result.recognized_names.length > 0) {
        const names = result.recognized_names.join(', ');
        const attendanceStatus = result.attendance_updated ? 'Attendance marked automatically!' : 'Already marked today';

        // Update centralized data if attendance was marked
        if (result.attendance_updated) {
            result.recognized_names.forEach(name => {
                const currentTime = new Date().toTimeString().slice(0, 8);
                markAttendance(name, currentTime);
            });
        }

        // Get full names for display
        const fullNames = result.recognized_names.map(name => {
            const student = STUDENTS_DATA[name];
            return student ? student.fullName : name;
        }).join(', ');

        resultsEl.innerHTML = `
            <div class="recognition-success automatic-success">
                <i class="fas fa-check-circle"></i>
                <h4>Face Detected Automatically!</h4>
                <p><strong>Welcome:</strong> ${fullNames}</p>
                <p class="auto-status">${attendanceStatus}</p>
                <div class="success-animation">
                    <i class="fas fa-sparkles"></i>
                </div>
            </div>
        `;

        updateRecognitionIndicator('success', `Welcome ${fullNames}!`);
        showNotification(`🎉 Welcome ${fullNames}! ${attendanceStatus}`, 'success');

        // Add celebration effect
        createCelebrationEffect();

        // Resume scanning after delay
        setTimeout(() => {
            if (isDetecting && stream) {
                resultsEl.innerHTML = `
                    <div class="no-recognition">
                        <i class="fas fa-eye"></i>
                        <p>AI continues scanning for faces...</p>
                    </div>
                `;
                updateRecognitionIndicator('detecting', 'AI scanning for faces...');
            }
        }, 5000);
    }
}

function showSuccessAnimation() {
    // Create success overlay
    const overlay = document.createElement('div');
    overlay.className = 'success-overlay';
    overlay.innerHTML = `
        <div class="success-content">
            <i class="fas fa-check-circle"></i>
            <h3>Attendance Marked!</h3>
            <p>Face detected automatically</p>
        </div>
    `;

    document.body.appendChild(overlay);

    // Animate in
    setTimeout(() => {
        overlay.classList.add('show');
    }, 100);

    // Remove after animation
    setTimeout(() => {
        overlay.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
        }, 500);
    }, 3000);
}

function createCelebrationEffect() {
    // Create confetti effect
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            createConfetti();
        }, i * 100);
    }
}

function createConfetti() {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.backgroundColor = ['#a855f7', '#22c55e', '#3b82f6', '#f59e0b'][Math.floor(Math.random() * 4)];
    confetti.style.animationDelay = Math.random() * 2 + 's';

    document.body.appendChild(confetti);

    // Remove after animation
    setTimeout(() => {
        if (document.body.contains(confetti)) {
            document.body.removeChild(confetti);
        }
    }, 3000);
}// Enhanced Students Page Functions
function initializeStudents() {
    initializeTheme();

    // Add animation delays to stat cards
    setTimeout(() => {
        const statCards = document.querySelectorAll('.animate-card');
        statCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.animationDelay = `${index * 100}ms`;
                card.classList.add('animate-card');
            }, index * 100);
        });
    }, 300);

    loadStudentsData();
    setupStudentsEventListeners();
    generateSampleStudents();
}

function setupStudentsEventListeners() {
    const searchInput = document.getElementById('student-search');
    const classFilter = document.getElementById('class-filter');
    const sortFilter = document.getElementById('sort-filter');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const viewButtons = document.querySelectorAll('.view-btn');
    const addStudentBtn = document.getElementById('add-student-btn');
    const exportBtn = document.getElementById('export-students-btn');

    if (searchInput) searchInput.addEventListener('input', filterStudents);
    if (classFilter) classFilter.addEventListener('change', filterStudents);
    if (sortFilter) sortFilter.addEventListener('change', sortStudents);

    filterButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterStudentsByStatus(this.dataset.filter);
        });
    });

    viewButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            viewButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            changeView(this.dataset.view);
        });
    });

    if (addStudentBtn) addStudentBtn.addEventListener('click', openAddStudentModal);
    if (exportBtn) exportBtn.addEventListener('click', exportStudentsList);
}

function generateSampleStudents() {
    // Use the centralized function instead
    generateStudentCards();
}

function createStudentCard(student, index) {
    const statusClass = student.isPresent ? 'present' : 'absent';
    const statusIcon = student.isPresent ? 'fa-check' : 'fa-times';
    const statusText = student.isPresent ? 'Present' : 'Absent';
    const isNew = student.name === 'Vinit'; // Vinit is the newest student
    const newBadge = isNew ? '<div class="student-status-badge new"><i class="fas fa-star"></i> New</div>' : '';
    const lastSeenText = student.lastSeen || (student.isPresent ? 'Just now' : 'Not today');

    return `
        <div class="student-card" style="animation-delay: ${index * 100}ms">
            <div class="student-photo-container">
                <img src="${API_BASE_URL}${student.photo}" alt="${student.fullName}" class="student-photo" 
                     onerror="this.src='https://via.placeholder.com/200x200/667eea/ffffff?text=${student.name.charAt(0)}'">
                <div class="student-status-badge ${statusClass}">
                    <i class="fas ${statusIcon}"></i>
                    ${statusText}
                </div>
                ${newBadge}
            </div>
            <div class="student-info">
                <div class="student-header">
                    <div>
                        <div class="student-name">${student.fullName}</div>
                        <div class="student-id">${student.studentId}</div>
                    </div>
                    <div class="student-grade">${student.class}</div>
                </div>
                
                <div class="student-details">
                    <div class="student-detail">
                        <i class="fas fa-envelope"></i>
                        <span>${student.email}</span>
                    </div>
                    <div class="student-detail">
                        <i class="fas fa-phone"></i>
                        <span>${student.phone}</span>
                    </div>
                    <div class="student-detail">
                        <i class="fas fa-clock"></i>
                        <span>Last seen: ${lastSeenText}</span>
                    </div>
                    <div class="student-detail">
                        <i class="fas fa-calendar"></i>
                        <span>Joined: ${student.joinDate}</span>
                    </div>
                </div>
                
                <div class="attendance-stats">
                    <div class="attendance-stat">
                        <div class="number">${student.totalPresent}</div>
                        <div class="label">Present</div>
                    </div>
                    <div class="attendance-stat">
                        <div class="number">${student.totalAbsent}</div>
                        <div class="label">Absent</div>
                    </div>
                    <div class="attendance-stat">
                        <div class="number">${student.attendancePercentage}%</div>
                        <div class="label">Rate</div>
                    </div>
                </div>
                
                <div class="student-actions">
                    <button class="student-action-btn view" onclick="viewStudent('${student.name}')">
                        <i class="fas fa-eye"></i>
                        View
                    </button>
                    <button class="student-action-btn edit" onclick="editStudent('${student.name}')">
                        <i class="fas fa-edit"></i>
                        Edit
                    </button>
                    <button class="student-action-btn delete" onclick="deleteStudent('${student.name}')">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    `;
}

function addStudentCardEvents() {
    // Add hover effects and animations
    const studentCards = document.querySelectorAll('.student-card');
    studentCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

function filterStudents() {
    const searchTerm = document.getElementById('student-search')?.value.toLowerCase() || '';
    const classFilter = document.getElementById('class-filter')?.value || '';

    const cards = document.querySelectorAll('.student-card');
    let visibleCount = 0;

    cards.forEach(card => {
        const name = card.querySelector('.student-name').textContent.toLowerCase();
        const studentId = card.querySelector('.student-id').textContent.toLowerCase();
        const studentClass = card.querySelector('.student-grade').textContent;

        const matchesSearch = name.includes(searchTerm) || studentId.includes(searchTerm);
        const matchesClass = classFilter === '' || studentClass === classFilter;

        if (matchesSearch && matchesClass) {
            card.style.display = 'block';
            card.style.animation = `fadeInUp 0.5s ease-out ${visibleCount * 50}ms forwards`;
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    updateResultsCount(visibleCount);
}

function filterStudentsByStatus(status) {
    const cards = document.querySelectorAll('.student-card');
    let visibleCount = 0;

    cards.forEach(card => {
        const statusBadge = card.querySelector('.student-status-badge');
        const isNew = card.querySelector('.student-status-badge.new');

        let shouldShow = false;

        switch (status) {
            case 'all':
                shouldShow = true;
                break;
            case 'present':
                shouldShow = statusBadge.classList.contains('present');
                break;
            case 'absent':
                shouldShow = statusBadge.classList.contains('absent');
                break;
            case 'new':
                shouldShow = isNew !== null;
                break;
        }

        if (shouldShow) {
            card.style.display = 'block';
            card.style.animation = `fadeInUp 0.5s ease-out ${visibleCount * 50}ms forwards`;
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    updateResultsCount(visibleCount);
}

function sortStudents() {
    const sortBy = document.getElementById('sort-filter')?.value || 'name';
    const grid = document.getElementById('students-grid');
    const cards = Array.from(grid.querySelectorAll('.student-card'));

    cards.sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.querySelector('.student-name').textContent.localeCompare(b.querySelector('.student-name').textContent);
            case 'id':
                return a.querySelector('.student-id').textContent.localeCompare(b.querySelector('.student-id').textContent);
            case 'attendance':
                const aRate = parseInt(a.querySelector('.attendance-stat:last-child .number').textContent);
                const bRate = parseInt(b.querySelector('.attendance-stat:last-child .number').textContent);
                return bRate - aRate;
            case 'recent':
                // For demo, reverse the current order
                return -1;
            default:
                return 0;
        }
    });

    // Re-append sorted cards
    cards.forEach((card, index) => {
        card.style.animation = `fadeInUp 0.5s ease-out ${index * 50}ms forwards`;
        grid.appendChild(card);
    });
}

function changeView(viewType) {
    const grid = document.getElementById('students-grid');

    // Remove existing view classes
    grid.classList.remove('grid-view', 'list-view', 'table-view');

    // Add new view class
    grid.classList.add(`${viewType}-view`);

    showNotification(`Switched to ${viewType} view`, 'info');
}

function updateResultsCount(count) {
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
        resultsCount.textContent = `Showing ${count} of 5 students`;
    }
}

// Student Action Functions
function viewStudent(id) {
    showNotification(`Viewing student details for ID: ${id}`, 'info');
    // Here you would open a detailed view modal
}

function editStudent(id) {
    showNotification(`Editing student with ID: ${id}`, 'info');
    // Here you would open the edit modal
}

function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this student?')) {
        // Add deletion animation
        const card = document.querySelector(`[onclick*="${id}"]`).closest('.student-card');
        card.style.animation = 'fadeOut 0.5s ease-out forwards';

        setTimeout(() => {
            card.remove();
            showNotification('Student deleted successfully!', 'success');
            updateResultsCount(document.querySelectorAll('.student-card').length);
        }, 500);
    }
}

function openAddStudentModal() {
    const modal = document.getElementById('add-student-modal');
    if (modal) {
        modal.style.display = 'block';
        modal.style.animation = 'fadeIn 0.3s ease-out';
    }
}

function exportStudentsList() {
    showNotification('Preparing students list export...', 'info');

    setTimeout(() => {
        const csvContent = `Name,Student ID,Class,Status,Email,Phone,Attendance Rate
Aditya Sharma,STU001,Grade 10-A,Present,aditya@school.com,+91 98765 43210,90%
Krisha Patel,STU002,Grade 10-B,Present,krisha@school.com,+91 98765 43211,95%
Sahil Kumar,STU003,Grade 11-A,Absent,sahil@school.com,+91 98765 43212,75%
Niti Gupta,STU004,Grade 11-B,Present,niti@school.com,+91 98765 43213,85%
Vinit Singh,STU005,Grade 10-A,Absent,vinit@school.com,+91 98765 43214,60%`;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'students-list.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        showNotification('Students list exported successfully!', 'success');
    }, 1000);
}

function loadStudentsData() {
    // Simulate loading data
    setTimeout(() => {
        const loadingElement = document.querySelector('.loading-students');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }, 500);
}

// Initialize students page when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    if (getCurrentPage() === 'students') {
        setTimeout(() => {
            initializeStudents();
        }, 100);
    }
});

// Add fadeOut animation
const fadeOutKeyframes = `
@keyframes fadeOut {
    from {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
    to {
        opacity: 0;
        transform: translateY(-20px) scale(0.9);
    }
}
`;

// Inject the keyframes into the document
if (!document.querySelector('#fadeOutStyles')) {
    const style = document.createElement('style');
    style.id = 'fadeOutStyles';
    style.textContent = fadeOutKeyframes;
    document.head.appendChild(style);
}// Centralized Data Management Functions
async function initializeGlobalData() {
    try {
        // Load today's attendance
        const todayResponse = await fetch(`${API_BASE_URL}/attendance/today`);
        if (todayResponse.ok) {
            globalAttendanceData.todayRecords = await todayResponse.json();
        }

        // Load attendance history
        const historyResponse = await fetch(`${API_BASE_URL}/attendance/history`);
        if (historyResponse.ok) {
            globalAttendanceData.historyRecords = await historyResponse.json();
        }

        // Update student data based on attendance
        updateStudentAttendanceData();
        globalAttendanceData.lastUpdated = new Date();

        console.log('Global data initialized:', globalAttendanceData);
    } catch (error) {
        console.error('Error initializing global data:', error);
    }
}

function updateStudentAttendanceData() {
    const today = new Date().toISOString().split('T')[0];
    
    // Reset today's presence
    Object.values(STUDENTS_DATA).forEach(student => {
        student.isPresent = false;
        student.lastSeen = null;
    });

    // Update based on today's records
    globalAttendanceData.todayRecords.forEach(record => {
        const student = STUDENTS_DATA[record.name];
        if (student) {
            student.isPresent = true;
            student.lastSeen = record.time;
        }
    });

    // Calculate attendance statistics
    Object.values(STUDENTS_DATA).forEach(student => {
        const studentHistory = globalAttendanceData.historyRecords.filter(
            record => record.name === student.name
        );
        
        student.attendanceHistory = studentHistory;
        student.totalPresent = studentHistory.length;
        
        // Calculate total days (for demo, using 30 days)
        const totalDays = 30;
        student.totalAbsent = totalDays - student.totalPresent;
        student.attendancePercentage = Math.round((student.totalPresent / totalDays) * 100);
    });
}

function markAttendance(studentName, time = null) {
    const student = STUDENTS_DATA[studentName];
    if (!student) return false;

    const today = new Date().toISOString().split('T')[0];
    const currentTime = time || new Date().toTimeString().slice(0, 8);

    // Check if already marked today
    const alreadyMarked = globalAttendanceData.todayRecords.some(
        record => record.name === studentName && record.date === today
    );

    if (!alreadyMarked) {
        // Add to today's records
        const newRecord = {
            name: studentName,
            date: today,
            time: currentTime
        };

        globalAttendanceData.todayRecords.push(newRecord);
        globalAttendanceData.historyRecords.push(newRecord);

        // Update student data
        student.isPresent = true;
        student.lastSeen = currentTime;
        student.totalPresent++;
        student.attendancePercentage = Math.round((student.totalPresent / 30) * 100);

        // Update all pages
        updateAllPages();
        
        return true;
    }
    
    return false;
}

function updateAllPages() {
    // Update dashboard stats
    updateDashboardStats();
    
    // Update students page
    updateStudentsPage();
    
    // Update history page
    updateHistoryPage();
    
    // Update any other components
    updateAttendanceComponents();
}

function updateDashboardStats() {
    const totalStudents = Object.keys(STUDENTS_DATA).length;
    const presentToday = Object.values(STUDENTS_DATA).filter(s => s.isPresent).length;
    const attendanceRate = Math.round((presentToday / totalStudents) * 100);

    // Update dashboard elements
    const totalEl = document.getElementById('total-students');
    const todayEl = document.getElementById('today-attendance');
    const rateEl = document.getElementById('attendance-rate');

    if (totalEl) animateCounter('total-students', totalStudents);
    if (todayEl) animateCounter('today-attendance', presentToday);
    if (rateEl) animateCounter('attendance-rate', attendanceRate, '%');

    // Update attendance warning
    updateAttendanceWarning(attendanceRate);
}

function updateStudentsPage() {
    // Regenerate student cards if on students page
    if (getCurrentPage() === 'students') {
        generateStudentCards();
        updateStudentStats();
    }
}

function updateHistoryPage() {
    // Update history table if on history page
    if (getCurrentPage() === 'history') {
        displayHistoryData();
        updateHistoryStats();
    }
}

function updateAttendanceComponents() {
    // Update recent attendance lists
    updateRecentAttendanceLists();
    
    // Update today's attendance for recognition page
    if (getCurrentPage() === 'recognition') {
        loadTodayAttendanceForRecognition();
    }
}

function updateRecentAttendanceLists() {
    const recentLists = document.querySelectorAll('#recent-attendance-list, #today-attendance-list');
    
    recentLists.forEach(listEl => {
        if (globalAttendanceData.todayRecords.length === 0) {
            listEl.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-clipboard-list"></i>
                    <p>No attendance recorded today</p>
                </div>
            `;
        } else {
            const recentRecords = globalAttendanceData.todayRecords.slice(-5).reverse();
            const html = recentRecords.map(record => {
                const student = STUDENTS_DATA[record.name];
                return `
                    <div class="attendance-item">
                        <div class="attendance-info">
                            <span class="attendance-name">${student ? student.fullName : record.name}</span>
                            <span class="attendance-time">${record.time}</span>
                        </div>
                        <div class="attendance-status">
                            <i class="fas fa-check-circle"></i>
                        </div>
                    </div>
                `;
            }).join('');
            listEl.innerHTML = html;
        }
    });

    // Update attendance count
    const countEl = document.getElementById('attendance-count');
    if (countEl) {
        countEl.textContent = `${globalAttendanceData.todayRecords.length} marked`;
    }
}

function generateStudentCards() {
    const studentsGrid = document.getElementById('students-grid');
    if (!studentsGrid) return;

    const studentsArray = Object.values(STUDENTS_DATA);
    const html = studentsArray.map((student, index) => createStudentCard(student, index)).join('');
    studentsGrid.innerHTML = html;

    // Add click events to action buttons
    setTimeout(() => {
        addStudentCardEvents();
    }, 100);
}

function updateStudentStats() {
    const totalStudents = Object.keys(STUDENTS_DATA).length;
    const presentToday = Object.values(STUDENTS_DATA).filter(s => s.isPresent).length;
    const absentToday = totalStudents - presentToday;
    const avgAttendance = Math.round(
        Object.values(STUDENTS_DATA).reduce((sum, s) => sum + s.attendancePercentage, 0) / totalStudents
    );

    // Update student page stats
    animateCounter('total-students-count', totalStudents);
    animateCounter('present-today-count', presentToday);
    animateCounter('absent-today-count', absentToday);
    animateCounter('attendance-percentage', avgAttendance, '%');
}

function displayHistoryData() {
    const tbody = document.getElementById('history-tbody');
    if (!tbody) return;

    if (globalAttendanceData.historyRecords.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="loading-row">
                    <i class="fas fa-search"></i>
                    No attendance records found
                </td>
            </tr>
        `;
        return;
    }

    const recentRecords = globalAttendanceData.historyRecords.slice(-10).reverse();
    const html = recentRecords.map((record, index) => {
        const student = STUDENTS_DATA[record.name];
        return `
            <tr style="animation-delay: ${index * 50}ms" class="table-row-animate">
                <td><input type="checkbox"></td>
                <td>${formatDate(record.date)}</td>
                <td>${record.time}</td>
                <td>${student ? student.fullName : record.name}</td>
                <td>${student ? student.studentId : 'N/A'}</td>
                <td>${student ? student.class : 'N/A'}</td>
                <td><span class="status-badge present"><i class="fas fa-check"></i> PRESENT</span></td>
                <td class="actions-cell">
                    <button class="action-icon edit-btn" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-icon delete-btn" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    tbody.innerHTML = html;

    // Update showing records info
    const showingRecords = document.getElementById('showing-records');
    if (showingRecords) {
        showingRecords.textContent = `Showing 1 to ${Math.min(10, globalAttendanceData.historyRecords.length)} of ${globalAttendanceData.historyRecords.length} entries`;
    }
}

function updateHistoryStats() {
    const totalRecords = globalAttendanceData.historyRecords.length;
    const todayRecords = globalAttendanceData.todayRecords.length;
    
    // Calculate this week's records
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekRecords = globalAttendanceData.historyRecords.filter(
        record => record.date >= weekStartStr
    ).length;

    // Update history page stats
    animateCounter('total-days', 22); // Demo value
    animateCounter('total-records', totalRecords);
    animateCounter('avg-attendance', 85, '%'); // Demo value
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
    });
}

// Initialize global data when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeGlobalData();
});// Student Action Functions
function viewStudent(studentName) {
    const student = STUDENTS_DATA[studentName];
    if (student) {
        showNotification(`Viewing details for ${student.fullName}`, 'info');
        // Here you would open a detailed view modal with student info
        console.log('Student details:', student);
    }
}

function editStudent(studentName) {
    const student = STUDENTS_DATA[studentName];
    if (student) {
        showNotification(`Editing ${student.fullName}`, 'info');
        // Here you would open the edit modal
        console.log('Editing student:', student);
    }
}

function deleteStudent(studentName) {
    const student = STUDENTS_DATA[studentName];
    if (student && confirm(`Are you sure you want to delete ${student.fullName}?`)) {
        // Add deletion animation
        const cards = document.querySelectorAll('.student-card');
        let targetCard = null;
        
        cards.forEach(card => {
            const nameElement = card.querySelector('.student-name');
            if (nameElement && nameElement.textContent === student.fullName) {
                targetCard = card;
            }
        });
        
        if (targetCard) {
            targetCard.style.animation = 'fadeOut 0.5s ease-out forwards';
            
            setTimeout(() => {
                targetCard.remove();
                showNotification(`${student.fullName} deleted successfully!`, 'success');
                updateResultsCount(document.querySelectorAll('.student-card').length);
            }, 500);
        }
    }
}

// Update initialization functions to use centralized data
function initializeDashboard() {
    initializeTheme();
    updateWelcomeMessage();
    updateCurrentDate();
    
    // Initialize global data first
    initializeGlobalData().then(() => {
        // Add animation delays to stat cards
        setTimeout(() => {
            const statCards = document.querySelectorAll('.animate-card');
            statCards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.animationDelay = `${index * 100}ms`;
                    card.classList.add('animate-card');
                }, index * 100);
            });
        }, 300);
        
        // Load and update dashboard with real data
        updateDashboardStats();
        updateRecentAttendanceLists();
        initializeWeeklyChart();
    });

    const downloadBtn = document.getElementById('download-csv');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadAttendanceCSV);
    }
    
    // Add floating animation to controls
    const themeControls = document.querySelector('.theme-controls');
    if (themeControls) {
        themeControls.classList.add('floating');
    }
}

function initializeStudents() {
    initializeTheme();
    
    // Initialize global data first
    initializeGlobalData().then(() => {
        // Add animation delays to stat cards
        setTimeout(() => {
            const statCards = document.querySelectorAll('.animate-card');
            statCards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.animationDelay = `${index * 100}ms`;
                    card.classList.add('animate-card');
                }, index * 100);
            });
        }, 300);
        
        // Generate student cards with real data
        generateStudentCards();
        updateStudentStats();
    });
    
    setupStudentsEventListeners();
}

function initializeHistory() {
    initializeTheme();
    
    // Initialize global data first
    initializeGlobalData().then(() => {
        // Add animation delays to stat cards
        setTimeout(() => {
            const statCards = document.querySelectorAll('.animate-card');
            statCards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.animationDelay = `${index * 100}ms`;
                    card.classList.add('animate-card');
                }, index * 100);
            });
        }, 300);
        
        // Update history page with real data
        displayHistoryData();
        updateHistoryStats();
    });
    
    setupHistoryEventListeners();
    setupTableSorting();
}

function initializeRecognition() {
    console.log('Initializing recognition page...');

    initializeTheme();
    
    // Initialize global data
    initializeGlobalData();

    video = document.getElementById('video');
    canvas = document.getElementById('canvas');

    if (canvas) {
        ctx = canvas.getContext('2d');
    }

    // Button event listeners
    const startBtn = document.getElementById('start-camera');
    const stopBtn = document.getElementById('stop-camera');
    const captureBtn = document.getElementById('capture');
    const manualBtn = document.getElementById('mark-manual-attendance');

    console.log('Found buttons:', { startBtn, stopBtn, captureBtn, manualBtn });

    if (startBtn) {
        startBtn.addEventListener('click', function (e) {
            e.preventDefault();
            console.log('Start camera clicked');
            startCamera();
        });
    }

    if (stopBtn) {
        stopBtn.addEventListener('click', function (e) {
            e.preventDefault();
            console.log('Stop camera clicked');
            stopCamera();
        });
    }

    if (captureBtn) {
        captureBtn.addEventListener('click', function (e) {
            e.preventDefault();
            console.log('Capture clicked');
            captureAndRecognize();
        });
    }

    if (manualBtn) {
        manualBtn.addEventListener('click', function (e) {
            e.preventDefault();
            console.log('Manual attendance clicked');
            markManualAttendance();
        });
    }

    // Set current time for manual entry
    const timeInput = document.getElementById('attendance-time');
    if (timeInput) {
        const now = new Date();
        const timeString = now.toTimeString().slice(0, 5);
        timeInput.value = timeString;
    }

    // Load today's attendance
    updateRecentAttendanceLists();

    console.log('Recognition page initialized successfully');
}

// Update the page initialization to use the correct functions
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = getCurrentPage();
    console.log('Initializing page:', currentPage);

    switch (currentPage) {
        case 'index':
            initializeDashboard();
            break;
        case 'recognition':
            initializeRecognition();
            break;
        case 'history':
            initializeHistory();
            break;
        case 'students':
            initializeStudents();
            break;
    }
});

// Add real-time data sync (check for updates every 30 seconds)
setInterval(() => {
    if (document.visibilityState === 'visible') {
        initializeGlobalData();
    }
}, 30000);

// Listen for page visibility changes to refresh data
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // Refresh data when page becomes visible
        setTimeout(() => {
            initializeGlobalData();
        }, 1000);
    }
});