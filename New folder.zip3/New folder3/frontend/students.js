// Enhanced Students Page JavaScript with Animations
class StudentsManager {
    constructor() {
        console.log('StudentsManager initialized');
        this.students = [];
        this.filteredStudents = [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.refreshTimer = null;
        this.init();
    }

    init() {
        this.initAnimations();
        this.loadStudents();
        this.setupEventListeners();
        this.updateStats();
        this.startAutoRefresh();
    }

    initAnimations() {
        // Initialize page animations
        this.animatePageLoad();
    }

    animatePageLoad() {
        // Animate elements with data-delay attributes
        const animatedElements = document.querySelectorAll('[data-delay]');
        animatedElements.forEach(element => {
            const delay = element.getAttribute('data-delay');
            element.style.animationDelay = `${delay}ms`;
        });
    }

    setupEventListeners() {
        // Search functionality with debounce
        const searchInput = document.getElementById('student-search');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchTerm = e.target.value.toLowerCase();
                    this.filterStudents();
                    this.animateSearchResults();
                }, 300);
            });

            // Add focus animations
            searchInput.addEventListener('focus', () => {
                searchInput.parentElement.style.transform = 'scale(1.02)';
            });

            searchInput.addEventListener('blur', () => {
                searchInput.parentElement.style.transform = 'scale(1)';
            });
        }

        // Filter buttons with enhanced animations
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Animate button press
                e.currentTarget.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    e.currentTarget.style.transform = '';
                }, 150);

                // Remove active class from all buttons with animation
                filterButtons.forEach(b => {
                    b.classList.remove('active');
                    b.style.transform = 'scale(1)';
                });

                // Add active class to clicked button with animation
                e.currentTarget.classList.add('active');

                this.currentFilter = e.currentTarget.dataset.filter;
                this.filterStudents();
                this.animateFilterResults();
            });

            // Add hover sound effect (visual feedback)
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-2px) scale(1.05)';
            });

            btn.addEventListener('mouseleave', () => {
                if (!btn.classList.contains('active')) {
                    btn.style.transform = '';
                }
            });
        });

        // Add student button with enhanced animation
        const addStudentBtn = document.getElementById('add-student-btn');
        if (addStudentBtn) {
            addStudentBtn.addEventListener('click', () => {
                this.animateButtonClick(addStudentBtn);
                setTimeout(() => {
                    this.showAddStudentModal();
                }, 200);
            });
        }

        // Export students button
        const exportBtn = document.getElementById('export-students-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.animateButtonClick(exportBtn);
                setTimeout(() => {
                    this.exportStudents();
                }, 200);
            });
        }

        // Modal event listeners
        this.setupModalEventListeners();

        // Theme toggle functionality
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.animateThemeToggle();
            });
        }
    }

    setupModalEventListeners() {
        const closeModal = document.getElementById('close-modal');
        const cancelAdd = document.getElementById('cancel-add');
        const modal = document.getElementById('add-student-modal');
        const addStudentForm = document.getElementById('add-student-form');

        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.hideAddStudentModal();
            });
        }

        if (cancelAdd) {
            cancelAdd.addEventListener('click', () => {
                this.hideAddStudentModal();
            });
        }

        // Click outside modal to close
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal || e.target.classList.contains('modal-backdrop')) {
                    this.hideAddStudentModal();
                }
            });
        }

        // Form submission
        if (addStudentForm) {
            addStudentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addStudent();
            });
        }

        // File input enhancement
        const fileInput = document.getElementById('new-student-photo');
        const fileDisplay = document.querySelector('.file-input-display');

        if (fileInput && fileDisplay) {
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    const fileName = e.target.files[0].name;
                    fileDisplay.innerHTML = `
                        <i class="fas fa-check-circle"></i>
                        <span>Selected: ${fileName}</span>
                    `;
                    fileDisplay.style.color = 'var(--green)';
                }
            });

            // Drag and drop functionality
            const wrapper = document.querySelector('.file-input-wrapper');
            if (wrapper) {
                wrapper.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    wrapper.style.borderColor = 'var(--pink)';
                    wrapper.style.background = 'rgba(236, 72, 153, 0.1)';
                });

                wrapper.addEventListener('dragleave', () => {
                    wrapper.style.borderColor = 'var(--border-color)';
                    wrapper.style.background = '';
                });

                wrapper.addEventListener('drop', (e) => {
                    e.preventDefault();
                    wrapper.style.borderColor = 'var(--border-color)';
                    wrapper.style.background = '';

                    if (e.dataTransfer.files.length > 0) {
                        fileInput.files = e.dataTransfer.files;
                        const fileName = e.dataTransfer.files[0].name;
                        fileDisplay.innerHTML = `
                            <i class="fas fa-check-circle"></i>
                            <span>Selected: ${fileName}</span>
                        `;
                        fileDisplay.style.color = 'var(--green)';
                    }
                });
            }
        }
    }

    animateButtonClick(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }

    animateThemeToggle() {
        const body = document.body;
        body.style.transition = 'all 0.5s ease';
        body.classList.toggle('light-theme');
        body.classList.toggle('dark-theme');
    }

    animateSearchResults() {
        const cards = document.querySelectorAll('.student-card');
        cards.forEach((card, index) => {
            card.style.animation = 'none';
            setTimeout(() => {
                card.style.animation = `cardSlideIn 0.4s ease-out forwards`;
                card.style.animationDelay = `${index * 0.1}s`;
            }, 10);
        });
    }

    animateFilterResults() {
        const grid = document.getElementById('students-grid');
        if (grid) {
            grid.style.opacity = '0.5';
            grid.style.transform = 'scale(0.98)';

            setTimeout(() => {
                grid.style.transition = 'all 0.3s ease';
                grid.style.opacity = '1';
                grid.style.transform = 'scale(1)';
            }, 200);
        }
    }

    async loadStudents() {
        try {
            this.showLoading();

            const response = await fetch(`${API_BASE_URL}/students_with_attendance_stats`);
            if (!response.ok) throw new Error('Failed to fetch students data');
            const data = await response.json();

            // Map backend data to UI model
            this.students = data.map(s => ({
                id: s.id,
                name: s.name,
                photo: s.photo_url ? `${API_BASE_URL}${s.photo_url}` : null,
                presentDays: typeof s.present_days === 'number' ? s.present_days : 0,
                lastSeen: s.last_seen && s.last_seen.length > 0 ? s.last_seen : 'Never',
                email: s.email || '',
                class: s.class || '',
                phone: s.phone || '',
                fullName: s.name
            }));

            this.filteredStudents = [...this.students];
            this.renderStudents();
            this.updateStats();
            this.animateStatsCards();
        } catch (error) {
            console.error('Error loading students:', error);
            this.showError('Failed to load students');
        }
    }

    startAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        // Refresh every 15 seconds for live data
        this.refreshTimer = setInterval(() => {
            this.loadStudents();
        }, 15000);
        window.addEventListener('beforeunload', () => {
            if (this.refreshTimer) clearInterval(this.refreshTimer);
        });
    }

    animateStatsCards() {
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animate-card');
            }, index * 100);
        });
    }

    filterStudents() {
        this.filteredStudents = this.students.filter(student => {
            const matchesSearch = student.name.toLowerCase().includes(this.searchTerm) ||
                student.id.toLowerCase().includes(this.searchTerm) ||
                student.email.toLowerCase().includes(this.searchTerm);

            let matchesFilter = true;
            if (this.currentFilter !== 'all') {
                matchesFilter = student.status === this.currentFilter;
            }

            return matchesSearch && matchesFilter;
        });

        this.renderStudents();
    }

    renderStudents() {
        const studentsGrid = document.getElementById('students-grid');
        if (!studentsGrid) return;

        if (this.filteredStudents.length === 0) {
            studentsGrid.innerHTML = `
                <div class="empty-students">
                    <i class="fas fa-users"></i>
                    <h3>No Students Found</h3>
                    <p>No students match your current search and filter criteria.</p>
                    <button class="action-btn primary pulse-btn" onclick="studentsManager.showAddStudentModal()">
                        <i class="fas fa-plus"></i>
                        Add First Student
                    </button>
                </div>
            `;
            return;
        }

        studentsGrid.innerHTML = this.filteredStudents.map((student, index) => `
            <div class="student-card" data-student-id="${student.id}" style="animation-delay: ${index * 0.1}s">
                <div class="student-photo">
                    ${student.photo ?
                `<img src="${student.photo}" alt="${student.name}">` :
                `<i class="fas fa-user placeholder-icon"></i>`
            }
                    <div class="student-status-badge ${student.status}">
                        ${this.getStatusText(student.status)}
                    </div>
                </div>
                <div class="student-info">
                    <h3 class="student-name">${student.name}</h3>
                    <p class="student-id">ID: ${student.id}</p>
                    
                    <div class="student-stats">
                        <div class="student-stat">
                            <div class="student-stat-value">${student.attendanceRate}%</div>
                            <div class="student-stat-label">Attendance</div>
                        </div>
                        <div class="student-stat">
                            <div class="student-stat-value">${student.presentDays}/${student.totalClasses}</div>
                            <div class="student-stat-label">Present</div>
                        </div>
                    </div>
                    
                    <div class="student-actions">
                        <button class="student-action-btn view" onclick="studentsManager.viewStudent('${student.id}')">
                            <i class="fas fa-eye"></i>
                            View
                        </button>
                        <button class="student-action-btn edit" onclick="studentsManager.editStudent('${student.id}')">
                            <i class="fas fa-edit"></i>
                            Edit
                        </button>
                        <button class="student-action-btn delete" onclick="studentsManager.deleteStudent('${student.id}')">
                            <i class="fas fa-trash"></i>
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add click animations to cards
        this.addCardAnimations();
    }

    addCardAnimations() {
        const cards = document.querySelectorAll('.student-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    getStatusText(status) {
        const statusMap = {
            'present': '✓ Present',
            'absent': '✗ Absent',
            'unknown': '? Unknown'
        };
        return statusMap[status] || 'Unknown';
    }

    updateStats() {
        const totalStudents = this.students.length;
        const presentToday = this.students.filter(s => s.status === 'present').length;
        const absentToday = this.students.filter(s => s.status === 'absent').length;
        const attendancePercentage = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0;

        // Animate number changes
        this.animateNumber('total-students-count', totalStudents);
        this.animateNumber('present-today-count', presentToday);
        this.animateNumber('absent-today-count', absentToday);
        this.animateNumber('attendance-percentage', attendancePercentage, '%');
    }

    animateNumber(elementId, targetValue, suffix = '') {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startValue = parseInt(element.textContent) || 0;
        const duration = 1000;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.round(startValue + (targetValue - startValue) * easeOutCubic);

            element.textContent = currentValue + suffix;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    showLoading() {
        const studentsGrid = document.getElementById('students-grid');
        if (studentsGrid) {
            studentsGrid.innerHTML = `
                <div class="loading-students">
                    <div class="loading-animation">
                        <div class="loading-dots">
                            <div class="dot"></div>
                            <div class="dot"></div>
                            <div class="dot"></div>
                        </div>
                    </div>
                    <p>Loading students...</p>
                </div>
            `;
        }
    }

    showError(message) {
        const studentsGrid = document.getElementById('students-grid');
        if (studentsGrid) {
            studentsGrid.innerHTML = `
                <div class="empty-students">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error</h3>
                    <p>${message}</p>
                    <button class="action-btn primary" onclick="studentsManager.loadStudents()">
                        <i class="fas fa-refresh"></i>
                        Retry
                    </button>
                </div>
            `;
        }
    }

    showAddStudentModal() {
        const modal = document.getElementById('add-student-modal');
        if (modal) {
            modal.style.display = 'flex';
            // Trigger reflow
            modal.offsetHeight;
            modal.classList.add('show');

            // Focus first input
            setTimeout(() => {
                const firstInput = modal.querySelector('input[type="text"]');
                if (firstInput) firstInput.focus();
            }, 300);
        }
    }

    hideAddStudentModal() {
        const modal = document.getElementById('add-student-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }

        // Reset form with animation
        const form = document.getElementById('add-student-form');
        if (form) {
            form.reset();
            // Reset file display
            const fileDisplay = document.querySelector('.file-input-display');
            if (fileDisplay) {
                fileDisplay.innerHTML = `
                    <i class="fas fa-cloud-upload-alt"></i>
                    <span>Choose photo or drag & drop</span>
                `;
                fileDisplay.style.color = '';
            }
        }
    }

    async addStudent() {
        const nameInput = document.getElementById('new-student-name');
        const idInput = document.getElementById('new-student-id');
        const photoInput = document.getElementById('new-student-photo');

        if (!nameInput.value || !idInput.value || !photoInput.files[0]) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        // Check for duplicate ID
        if (this.students.find(s => s.id === idInput.value)) {
            this.showNotification('Student ID already exists', 'error');
            return;
        }

        try {
            const submitBtn = document.querySelector('.btn-submit');
            const originalText = submitBtn.innerHTML;

            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';

            const formData = new FormData();
            formData.append('name', nameInput.value);
            formData.append('student_id', idInput.value);
            formData.append('photo', photoInput.files[0]);

            const response = await fetch(`${API_BASE_URL}/students/`, {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Failed to add student');
            const result = await response.json();

            this.hideAddStudentModal();
            this.showNotification('Student added successfully!', 'success');
            await this.loadStudents();

            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';

        } catch (error) {
            console.error('Error adding student:', error);
            this.showNotification('Failed to add student. Please try again.', 'error');
        }
    }

    viewStudent(studentId) {
        const student = this.students.find(s => s.id === studentId);
        if (student) {
            // Create detailed view modal (simplified for demo)
            const details = `
                Name: ${student.name}
                ID: ${student.id}
                Email: ${student.email}
                Status: ${this.getStatusText(student.status)}
                Attendance Rate: ${student.attendanceRate}%
                Present Days: ${student.presentDays}/${student.totalClasses}
                Last Seen: ${student.lastSeen}
            `;
            alert(details);
        }
    }

    editStudent(studentId) {
        const student = this.students.find(s => s.id === studentId);
        if (student) {
            // In a real app, this would open an edit modal
            this.showNotification(`Edit functionality for ${student.name} would open here`, 'info');
        }
    }

    deleteStudent(studentId) {
        const student = this.students.find(s => s.id === studentId);
        if (student && confirm(`Are you sure you want to delete ${student.name}?`)) {
            // Animate card removal
            const card = document.querySelector(`[data-student-id="${studentId}"]`);
            if (card) {
                card.style.transform = 'scale(0.8)';
                card.style.opacity = '0';

                setTimeout(() => {
                    this.students = this.students.filter(s => s.id !== studentId);
                    this.filteredStudents = this.filteredStudents.filter(s => s.id !== studentId);
                    this.renderStudents();
                    this.updateStats();
                }, 300);
            }

            this.showNotification('Student deleted successfully!', 'success');
        }
    }

    exportStudents() {
        const headers = ['ID', 'Name', 'Email', 'Status', 'Attendance Rate', 'Present Days', 'Total Classes', 'Last Seen'];
        const csvContent = [
            headers.join(','),
            ...this.filteredStudents.map(student => [
                student.id,
                `"${student.name}"`,
                student.email,
                student.status,
                `${student.attendanceRate}%`,
                student.presentDays,
                student.totalClasses,
                `"${student.lastSeen}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.showNotification('Students list exported successfully!', 'success');
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

    // Method to get all attendance history for history page
    getAllAttendanceHistory() {
        const allHistory = [];
        this.students.forEach(student => {
            if (student.attendanceHistory) {
                student.attendanceHistory.forEach(record => {
                    allHistory.push({
                        ...record,
                        studentName: student.name,
                        studentId: student.id
                    });
                });
            }
        });

        // Sort by date (newest first)
        return allHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // Method to get students data for other pages
    getStudentsData() {
        return this.students;
    }
}

// Initialize students manager when page loads
let studentsManager;
document.addEventListener('DOMContentLoaded', () => {
    console.log('Students page loaded successfully!');
    studentsManager = new StudentsManager();
});