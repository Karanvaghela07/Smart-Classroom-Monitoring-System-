// Settings Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeSettings();
});

function initializeSettings() {
    setupSettingsNavigation();
    setupSettingsControls();
    loadSettingsFromStorage();
    
    console.log('Settings page initialized');
}

function setupSettingsNavigation() {
    const navLinks = document.querySelectorAll('.settings-nav-link');
    const sections = document.querySelectorAll('.settings-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and sections
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding section
            const sectionId = this.dataset.section + '-section';
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

function setupSettingsControls() {
    // Confidence threshold slider
    const confidenceSlider = document.getElementById('confidence-threshold');
    const confidenceValue = confidenceSlider?.nextElementSibling;
    
    if (confidenceSlider && confidenceValue) {
        confidenceSlider.addEventListener('input', function() {
            confidenceValue.textContent = this.value;
        });
    }
    
    // Theme selector
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            themeOptions.forEach(o => o.classList.remove('active'));
            this.classList.add('active');
            
            const theme = this.dataset.theme;
            applyTheme(theme);
        });
    });
    
    // Color selector
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            colorOptions.forEach(o => o.classList.remove('active'));
            this.classList.add('active');
            
            const color = this.dataset.color;
            applyAccentColor(color);
        });
    });
    
    // Save settings button
    const saveBtn = document.getElementById('save-settings');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveSettings);
    }
    
    // Reset settings button
    const resetBtn = document.getElementById('reset-settings');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetSettings);
    }
    
    // Backup buttons
    const createBackupBtn = document.getElementById('create-backup');
    const restoreBackupBtn = document.getElementById('restore-backup');
    
    if (createBackupBtn) {
        createBackupBtn.addEventListener('click', createBackup);
    }
    
    if (restoreBackupBtn) {
        restoreBackupBtn.addEventListener('click', restoreBackup);
    }
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
    
    localStorage.setItem('theme', theme);
    showNotification(`${theme.charAt(0).toUpperCase() + theme.slice(1)} theme applied`, 'success');
}

function applyAccentColor(color) {
    // In a real application, you would update CSS custom properties
    const colorMap = {
        purple: '#8b5cf6',
        blue: '#3b82f6',
        green: '#10b981',
        orange: '#f59e0b',
        red: '#ef4444'
    };
    
    document.documentElement.style.setProperty('--accent-color', colorMap[color]);
    localStorage.setItem('accentColor', color);
    showNotification(`${color.charAt(0).toUpperCase() + color.slice(1)} accent color applied`, 'success');
}

function saveSettings() {
    showLoading();
    
    // Collect all settings
    const settings = {
        general: {
            systemName: document.getElementById('system-name')?.value,
            orgName: document.getElementById('org-name')?.value,
            timezone: document.getElementById('timezone')?.value,
            dateFormat: document.getElementById('date-format')?.value,
            autoBackup: document.getElementById('auto-backup')?.checked
        },
        recognition: {
            confidenceThreshold: document.getElementById('confidence-threshold')?.value,
            autoInterval: document.getElementById('auto-interval')?.value,
            saveCaptures: document.getElementById('save-captures')?.checked,
            multipleFaces: document.getElementById('multiple-faces')?.checked
        },
        notifications: {
            successNotifications: document.getElementById('success-notifications')?.checked,
            errorNotifications: document.getElementById('error-notifications')?.checked,
            soundAlerts: document.getElementById('sound-alerts')?.checked,
            notificationDuration: document.getElementById('notification-duration')?.value
        },
        security: {
            adminMode: document.getElementById('admin-mode')?.checked,
            sessionTimeout: document.getElementById('session-timeout')?.value,
            auditLog: document.getElementById('audit-log')?.checked
        },
        backup: {
            frequency: document.getElementById('backup-frequency')?.value,
            retention: document.getElementById('backup-retention')?.value
        },
        appearance: {
            theme: document.querySelector('.theme-option.active')?.dataset.theme,
            accentColor: document.querySelector('.color-option.active')?.dataset.color,
            animations: document.getElementById('animations')?.checked
        }
    };
    
    // Save to localStorage (in a real app, this would be sent to the server)
    localStorage.setItem('attendanceSystemSettings', JSON.stringify(settings));
    
    setTimeout(() => {
        hideLoading();
        showNotification('Settings saved successfully!', 'success');
    }, 1000);
}

function loadSettingsFromStorage() {
    const savedSettings = localStorage.getItem('attendanceSystemSettings');
    if (!savedSettings) return;
    
    try {
        const settings = JSON.parse(savedSettings);
        
        // Apply general settings
        if (settings.general) {
            const systemName = document.getElementById('system-name');
            const orgName = document.getElementById('org-name');
            const timezone = document.getElementById('timezone');
            const dateFormat = document.getElementById('date-format');
            const autoBackup = document.getElementById('auto-backup');
            
            if (systemName) systemName.value = settings.general.systemName || '';
            if (orgName) orgName.value = settings.general.orgName || '';
            if (timezone) timezone.value = settings.general.timezone || 'EST';
            if (dateFormat) dateFormat.value = settings.general.dateFormat || 'MM/DD/YYYY';
            if (autoBackup) autoBackup.checked = settings.general.autoBackup !== false;
        }
        
        // Apply recognition settings
        if (settings.recognition) {
            const confidenceThreshold = document.getElementById('confidence-threshold');
            const autoInterval = document.getElementById('auto-interval');
            const saveCaptures = document.getElementById('save-captures');
            const multipleFaces = document.getElementById('multiple-faces');
            
            if (confidenceThreshold) {
                confidenceThreshold.value = settings.recognition.confidenceThreshold || '0.6';
                const valueDisplay = confidenceThreshold.nextElementSibling;
                if (valueDisplay) valueDisplay.textContent = confidenceThreshold.value;
            }
            if (autoInterval) autoInterval.value = settings.recognition.autoInterval || '3';
            if (saveCaptures) saveCaptures.checked = settings.recognition.saveCaptures !== false;
            if (multipleFaces) multipleFaces.checked = settings.recognition.multipleFaces || false;
        }
        
        // Apply notification settings
        if (settings.notifications) {
            const successNotifications = document.getElementById('success-notifications');
            const errorNotifications = document.getElementById('error-notifications');
            const soundAlerts = document.getElementById('sound-alerts');
            const notificationDuration = document.getElementById('notification-duration');
            
            if (successNotifications) successNotifications.checked = settings.notifications.successNotifications !== false;
            if (errorNotifications) errorNotifications.checked = settings.notifications.errorNotifications !== false;
            if (soundAlerts) soundAlerts.checked = settings.notifications.soundAlerts || false;
            if (notificationDuration) notificationDuration.value = settings.notifications.notificationDuration || '5';
        }
        
        // Apply appearance settings
        if (settings.appearance) {
            // Theme
            const themeOptions = document.querySelectorAll('.theme-option');
            themeOptions.forEach(option => {
                option.classList.remove('active');
                if (option.dataset.theme === settings.appearance.theme) {
                    option.classList.add('active');
                }
            });
            
            // Accent color
            const colorOptions = document.querySelectorAll('.color-option');
            colorOptions.forEach(option => {
                option.classList.remove('active');
                if (option.dataset.color === settings.appearance.accentColor) {
                    option.classList.add('active');
                }
            });
            
            // Animations
            const animations = document.getElementById('animations');
            if (animations) animations.checked = settings.appearance.animations !== false;
        }
        
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
        localStorage.removeItem('attendanceSystemSettings');
        location.reload();
    }
}

function createBackup() {
    showLoading();
    
    // Simulate backup creation
    setTimeout(() => {
        // In a real application, this would create an actual backup
        const backupData = {
            timestamp: new Date().toISOString(),
            settings: JSON.parse(localStorage.getItem('attendanceSystemSettings') || '{}'),
            version: '1.0.0'
        };
        
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-system-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        hideLoading();
        showNotification('Backup created and downloaded successfully!', 'success');
    }, 1500);
}

function restoreBackup() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const backupData = JSON.parse(e.target.result);
                
                if (backupData.settings) {
                    localStorage.setItem('attendanceSystemSettings', JSON.stringify(backupData.settings));
                    showNotification('Backup restored successfully! Reloading page...', 'success');
                    setTimeout(() => location.reload(), 2000);
                } else {
                    showNotification('Invalid backup file format', 'error');
                }
            } catch (error) {
                showNotification('Error reading backup file', 'error');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

// Utility functions
function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'flex';
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';
}

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