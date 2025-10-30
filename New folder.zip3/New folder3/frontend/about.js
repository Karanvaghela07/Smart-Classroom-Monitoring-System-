// About Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeAboutPage();
});

function initializeAboutPage() {
    animateStatsOnScroll();
    setupInteractiveElements();
    
    console.log('About page initialized');
}

function animateStatsOnScroll() {
    const statNumbers = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStatNumber(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => {
        observer.observe(stat);
    });
}

function animateStatNumber(element) {
    const text = element.textContent;
    const isPercentage = text.includes('%');
    const hasLessThan = text.includes('<');
    const hasPlus = text.includes('+');
    
    let targetValue;
    let suffix = '';
    
    if (isPercentage) {
        targetValue = parseFloat(text.replace('%', ''));
        suffix = '%';
    } else if (hasLessThan) {
        targetValue = parseFloat(text.replace('<', '').replace('s', ''));
        suffix = 's';
        element.textContent = '<' + targetValue + suffix;
        return; // Don't animate this one
    } else if (hasPlus) {
        targetValue = parseFloat(text.replace('+', ''));
        suffix = '+';
    } else if (text.includes('/')) {
        element.textContent = text; // Don't animate fractions
        return;
    } else {
        targetValue = parseFloat(text);
    }
    
    if (isNaN(targetValue)) return;
    
    let currentValue = 0;
    const increment = targetValue / 50; // 50 steps
    const duration = 2000; // 2 seconds
    const stepTime = duration / 50;
    
    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(timer);
        }
        
        if (isPercentage) {
            element.textContent = currentValue.toFixed(1) + suffix;
        } else if (hasPlus) {
            element.textContent = Math.floor(currentValue) + suffix;
        } else {
            element.textContent = Math.floor(currentValue) + suffix;
        }
    }, stepTime);
}

function setupInteractiveElements() {
    // Add hover effects to feature items
    const featureItems = document.querySelectorAll('.feature-item');
    featureItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add click effects to team members
    const teamMembers = document.querySelectorAll('.team-member');
    teamMembers.forEach(member => {
        member.addEventListener('click', function() {
            // Add a pulse effect
            this.style.animation = 'pulse 0.6s ease-in-out';
            setTimeout(() => {
                this.style.animation = '';
            }, 600);
        });
    });
    
    // Add interactive effects to contact items
    const contactItems = document.querySelectorAll('.contact-item');
    contactItems.forEach(item => {
        const link = item.querySelector('.contact-link');
        if (link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                showNotification('Feature coming soon!', 'info');
            });
        }
    });
    
    // Add version info click handler
    const versionBadge = document.querySelector('.version-badge');
    if (versionBadge) {
        versionBadge.addEventListener('click', function() {
            showVersionInfo();
        });
    }
}

function showVersionInfo() {
    const versionInfo = {
        version: '2.0.0',
        releaseDate: '2024-08-14',
        features: [
            'Enhanced AI recognition accuracy',
            'Real-time attendance tracking',
            'Advanced analytics dashboard',
            'Mobile responsive design',
            'Cloud deployment ready'
        ],
        bugFixes: [
            'Improved camera initialization',
            'Fixed attendance duplicate entries',
            'Enhanced error handling',
            'Performance optimizations'
        ]
    };
    
    showModal('Version Information', createVersionInfoHTML(versionInfo));
}

function createVersionInfoHTML(info) {
    return `
        <div class="version-info">
            <div class="version-header">
                <h3>Version ${info.version}</h3>
                <p>Released: ${new Date(info.releaseDate).toLocaleDateString()}</p>
            </div>
            
            <div class="version-section">
                <h4><i class="fas fa-star"></i> New Features</h4>
                <ul>
                    ${info.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            </div>
            
            <div class="version-section">
                <h4><i class="fas fa-bug"></i> Bug Fixes</h4>
                <ul>
                    ${info.bugFixes.map(fix => `<li>${fix}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
}

function showModal(title, content) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal version-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Show modal
    setTimeout(() => {
        modal.style.display = 'flex';
    }, 10);
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

    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add CSS for version modal
const modalStyles = `
.version-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.version-modal .modal-content {
    background: var(--dark-bg-secondary);
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    border: 1px solid var(--dark-border-color);
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
}

.version-modal .modal-header {
    padding: 2rem 2rem 1rem;
    border-bottom: 1px solid var(--dark-border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.version-modal .modal-header h3 {
    color: var(--dark-text-primary);
    margin: 0;
}

.version-modal .modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: var(--dark-text-secondary);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 5px;
    transition: all 0.3s ease;
}

.version-modal .modal-close:hover {
    background: var(--dark-bg-tertiary);
    color: var(--dark-text-primary);
}

.version-modal .modal-body {
    padding: 2rem;
}

.version-info .version-header {
    text-align: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--dark-border-color);
}

.version-info .version-header h3 {
    color: #8b5cf6;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
}

.version-info .version-header p {
    color: var(--dark-text-secondary);
    margin: 0;
}

.version-section {
    margin-bottom: 2rem;
}

.version-section h4 {
    color: var(--dark-text-primary);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.version-section h4 i {
    color: #8b5cf6;
}

.version-section ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.version-section li {
    color: var(--dark-text-secondary);
    padding: 0.5rem 0;
    padding-left: 1.5rem;
    position: relative;
}

.version-section li::before {
    content: '•';
    color: #8b5cf6;
    position: absolute;
    left: 0;
    font-weight: bold;
}
`;

// Add styles to head
if (!document.querySelector('#version-modal-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'version-modal-styles';
    styleSheet.textContent = modalStyles;
    document.head.appendChild(styleSheet);
}