// Recognition Page Enhanced Animations and Interactions
class RecognitionPageManager {
    constructor() {
        this.isRecognizing = false;
        this.attendanceCount = 0;
        this.init();
    }

    init() {
        this.initAnimations();
        this.setupEventListeners();
        this.initializeElements();
    }

    initAnimations() {
        // Initialize page load animations
        this.animatePageLoad();
        
        // Set up intersection observer for scroll animations
        this.setupScrollAnimations();
    }

    animatePageLoad() {
        // Animate elements with data-delay attributes
        const animatedElements = document.querySelectorAll('[data-delay]');
        animatedElements.forEach(element => {
            const delay = element.getAttribute('data-delay');
            element.style.animationDelay = `${delay}ms`;
        });

        // Add staggered animation to instruction items
        const instructionItems = document.querySelectorAll('.instruction-item');
        instructionItems.forEach((item, index) => {
            item.style.animationDelay = `${800 + (index * 100)}ms`;
        });
    }

    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in-view');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe all animated elements
        const elementsToObserve = document.querySelectorAll('.animate-card, .animate-slide-up, .animate-slide-left');
        elementsToObserve.forEach(el => observer.observe(el));
    }

    setupEventListeners() {
        // Start Camera Button
        const startCameraBtn = document.getElementById('start-camera');
        if (startCameraBtn) {
            startCameraBtn.addEventListener('click', () => {
                this.animateButtonClick(startCameraBtn);
                this.startCamera();
            });
        }

        // Stop Camera Button
        const stopCameraBtn = document.getElementById('stop-camera');
        if (stopCameraBtn) {
            stopCameraBtn.addEventListener('click', () => {
                this.animateButtonClick(stopCameraBtn);
                this.stopCamera();
            });
        }

        // Capture Button
        const captureBtn = document.getElementById('capture');
        if (captureBtn) {
            captureBtn.addEventListener('click', () => {
                this.animateButtonClick(captureBtn);
                this.captureAndRecognize();
            });
        }

        // Upload Photo Button
        const uploadBtn = document.getElementById('upload-photo');
        const fileInput = document.getElementById('photo-upload');
        
        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', () => {
                this.animateButtonClick(uploadBtn);
                fileInput.click();
            });

            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handlePhotoUpload(e.target.files[0]);
                }
            });
        }

        // Manual Attendance Button
        const manualBtn = document.getElementById('mark-manual-attendance');
        if (manualBtn) {
            manualBtn.addEventListener('click', () => {
                this.animateButtonClick(manualBtn);
                this.markManualAttendance();
            });
        }

        // Input Focus Animations
        const inputs = document.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('input-focused');
            });

            input.addEventListener('blur', () => {
                input.parentElement.classList.remove('input-focused');
            });
        });
    }

    initializeElements() {
        // Set current time in manual entry
        const timeInput = document.getElementById('attendance-time');
        if (timeInput) {
            const now = new Date();
            const timeString = now.toTimeString().slice(0, 5);
            timeInput.value = timeString;
        }

        // Initialize recognition indicator
        this.updateRecognitionIndicator('ready', 'Face recognition system ready');
    }

    animateButtonClick(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);

        // Add ripple effect
        this.createRippleEffect(button);
    }

    createRippleEffect(element) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (rect.width / 2 - size / 2) + 'px';
        ripple.style.top = (rect.height / 2 - size / 2) + 'px';
        
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    async startCamera() {
        try {
            this.showLoading('Starting camera...');
            
            // Simulate camera initialization
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Update UI
            this.toggleCameraButtons(true);
            this.updateRecognitionIndicator('active', 'Camera active - Looking for faces');
            
            // Add camera glow effect
            const cameraContainer = document.querySelector('.camera-container');
            if (cameraContainer) {
                cameraContainer.classList.add('active');
            }

            // Start scanning animation
            this.startScanningAnimation();
            
            this.hideLoading();
            this.showNotification('Camera started successfully!', 'success');
            
        } catch (error) {
            this.hideLoading();
            this.showNotification('Failed to start camera', 'error');
        }
    }

    stopCamera() {
        // Update UI
        this.toggleCameraButtons(false);
        this.updateRecognitionIndicator('ready', 'Face recognition system ready');
        
        // Remove camera glow effect
        const cameraContainer = document.querySelector('.camera-container');
        if (cameraContainer) {
            cameraContainer.classList.remove('active');
        }

        // Stop scanning animation
        this.stopScanningAnimation();
        
        this.showNotification('Camera stopped', 'info');
    }

    async captureAndRecognize() {
        try {
            this.showLoading('Processing recognition...');
            this.updateRecognitionIndicator('processing', 'Analyzing face...');
            
            // Simulate recognition process
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Simulate recognition result (random student)
            const students = ['Vinit', 'Sahil', 'Niti', 'Karan', 'Aditya'];
            const recognizedStudent = students[Math.floor(Math.random() * students.length)];
            const confidence = (Math.random() * 10 + 90).toFixed(1); // 90-100%
            
            this.hideLoading();
            this.showRecognitionSuccess(recognizedStudent, confidence);
            this.addAttendanceRecord(recognizedStudent);
            
        } catch (error) {
            this.hideLoading();
            this.updateRecognitionIndicator('error', 'Recognition failed');
            this.showNotification('Recognition failed. Please try again.', 'error');
        }
    }

    async handlePhotoUpload(file) {
        try {
            this.showLoading('Processing uploaded photo...');
            
            // Simulate photo processing
            await new Promise(resolve => setTimeout(resolve, 2500));
            
            // Simulate recognition result
            const students = ['Vinit', 'Sahil', 'Niti', 'Karan', 'Aditya'];
            const recognizedStudent = students[Math.floor(Math.random() * students.length)];
            const confidence = (Math.random() * 15 + 85).toFixed(1); // 85-100%
            
            this.hideLoading();
            this.showRecognitionSuccess(recognizedStudent, confidence);
            this.addAttendanceRecord(recognizedStudent);
            
        } catch (error) {
            this.hideLoading();
            this.showNotification('Failed to process uploaded photo', 'error');
        }
    }

    markManualAttendance() {
        const nameInput = document.getElementById('student-name');
        const idInput = document.getElementById('student-id');
        const timeInput = document.getElementById('attendance-time');

        if (!nameInput.value || !idInput.value || !timeInput.value) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        // Add manual attendance record
        this.addAttendanceRecord(nameInput.value, 'Manual Entry', timeInput.value);
        
        // Clear form with animation
        this.clearFormWithAnimation([nameInput, idInput]);
        
        this.showNotification('Manual attendance marked successfully!', 'success');
    }

    clearFormWithAnimation(inputs) {
        inputs.forEach((input, index) => {
            setTimeout(() => {
                input.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    input.value = '';
                    input.style.transform = '';
                }, 150);
            }, index * 100);
        });
    }

    toggleCameraButtons(cameraActive) {
        const startBtn = document.getElementById('start-camera');
        const stopBtn = document.getElementById('stop-camera');
        const captureBtn = document.getElementById('capture');

        if (cameraActive) {
            startBtn.style.display = 'none';
            stopBtn.style.display = 'flex';
            captureBtn.style.display = 'flex';
        } else {
            startBtn.style.display = 'flex';
            stopBtn.style.display = 'none';
            captureBtn.style.display = 'none';
        }
    }

    updateRecognitionIndicator(status, message) {
        const indicator = document.getElementById('recognition-indicator');
        if (!indicator) return;

        // Remove existing status classes
        indicator.classList.remove('processing', 'success', 'error', 'active');
        
        // Add new status class
        indicator.classList.add(status);

        // Update content based on status
        let icon, text;
        switch (status) {
            case 'ready':
                icon = 'fas fa-user-slash';
                text = message || 'No face detected';
                break;
            case 'active':
                icon = 'fas fa-camera';
                text = message || 'Camera active';
                break;
            case 'processing':
                icon = 'fas fa-spinner fa-spin';
                text = message || 'Processing...';
                break;
            case 'success':
                icon = 'fas fa-check-circle';
                text = message || 'Recognition successful';
                break;
            case 'error':
                icon = 'fas fa-exclamation-triangle';
                text = message || 'Recognition failed';
                break;
        }

        indicator.innerHTML = `<i class="${icon}"></i><span>${text}</span>`;
    }

    startScanningAnimation() {
        const scanningLine = document.getElementById('scanning-line');
        if (scanningLine) {
            scanningLine.style.display = 'block';
        }
    }

    stopScanningAnimation() {
        const scanningLine = document.getElementById('scanning-line');
        if (scanningLine) {
            scanningLine.style.display = 'none';
        }
    }

    showRecognitionSuccess(studentName, confidence) {
        this.updateRecognitionIndicator('success', `${studentName} recognized (${confidence}%)`);
        
        // Create success animation
        const resultsContainer = document.getElementById('recognition-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="recognition-success animate-success">
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="success-details">
                        <h4>${studentName}</h4>
                        <p>Confidence: ${confidence}%</p>
                        <p>Time: ${new Date().toLocaleTimeString()}</p>
                    </div>
                </div>
            `;
        }

        // Reset after 5 seconds
        setTimeout(() => {
            this.updateRecognitionIndicator('active', 'Camera active - Looking for faces');
            if (resultsContainer) {
                resultsContainer.innerHTML = `
                    <div class="no-recognition animate-float">
                        <i class="fas fa-camera"></i>
                        <p>Looking for faces...</p>
                    </div>
                `;
            }
        }, 5000);
    }

    addAttendanceRecord(studentName, type = 'Face Recognition', time = null) {
        const attendanceList = document.getElementById('today-attendance-list');
        const attendanceCount = document.getElementById('attendance-count');
        
        if (!attendanceList || !attendanceCount) return;

        // Remove no-data message if it exists
        const noData = attendanceList.querySelector('.no-data');
        if (noData) {
            noData.remove();
        }

        // Create new attendance item
        const attendanceItem = document.createElement('div');
        attendanceItem.className = 'attendance-item';
        attendanceItem.innerHTML = `
            <div class="attendance-info">
                <strong>${studentName}</strong>
                <small>${type}</small>
            </div>
            <div class="attendance-time">
                ${time || new Date().toLocaleTimeString()}
            </div>
            <div class="attendance-status present">
                <i class="fas fa-check"></i>
                Present
            </div>
        `;

        // Add to list with animation
        attendanceList.insertBefore(attendanceItem, attendanceList.firstChild);
        
        // Update count with animation
        this.attendanceCount++;
        attendanceCount.textContent = `${this.attendanceCount} marked`;
        attendanceCount.classList.add('animate-counter');
        
        setTimeout(() => {
            attendanceCount.classList.remove('animate-counter');
        }, 500);
    }

    showLoading(message = 'Processing...') {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.querySelector('p').textContent = message;
            loading.style.display = 'flex';
        }
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = type === 'success' ? 'check-circle' : 
                    type === 'error' ? 'exclamation-circle' : 'info-circle';
        
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            ${message}
        `;

        document.body.appendChild(notification);

        // Auto remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 4000);
    }
}

// Initialize recognition page manager when page loads
let recognitionManager;
document.addEventListener('DOMContentLoaded', () => {
    console.log('Recognition page loaded successfully!');
    recognitionManager = new RecognitionPageManager();
});

