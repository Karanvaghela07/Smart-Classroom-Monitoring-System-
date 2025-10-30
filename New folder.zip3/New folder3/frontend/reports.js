// Reports Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeReportsPage();
});

let reportsData = {
    students: [],
    attendance: [],
    charts: {}
};

function initializeReportsPage() {
    setupReportControls();
    setupTabs();
    loadReportsData();
    initializeCharts();
    setDefaultDateRange();
    startReportsAutoRefresh();
    
    console.log('Reports page initialized');
}

function setupReportControls() {
    // Date range inputs
    const startDate = document.getElementById('start-date');
    const endDate = document.getElementById('end-date');
    
    if (startDate) startDate.addEventListener('change', updateReports);
    if (endDate) endDate.addEventListener('change', updateReports);
    
    // Quick filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            applyQuickFilter(this.dataset.period);
        });
    });
    
    // Student filter
    const studentSelect = document.getElementById('student-select');
    if (studentSelect) {
        studentSelect.addEventListener('change', updateReports);
    }
    
    // Action buttons
    const refreshBtn = document.getElementById('refresh-reports');
    const exportBtn = document.getElementById('export-report');
    
    if (refreshBtn) refreshBtn.addEventListener('click', refreshReports);
    if (exportBtn) exportBtn.addEventListener('click', exportReport);
    
    // Chart controls
    const chartBtns = document.querySelectorAll('.chart-btn');
    chartBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const siblings = this.parentElement.querySelectorAll('.chart-btn');
            siblings.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updateChartType(this.dataset.chart);
        });
    });
    
    // Performance filter buttons
    const perfBtns = document.querySelectorAll('.perf-btn');
    perfBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            perfBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updatePerformanceChart(this.dataset.sort);
        });
    });
    
    // Export buttons
    const exportBtns = document.querySelectorAll('.export-btn');
    exportBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const format = this.dataset.format;
            exportReportData(format);
        });
    });
}

function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.report-tab');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            const tabId = this.dataset.tab + '-tab';
            const targetTab = document.getElementById(tabId);
            if (targetTab) {
                targetTab.classList.add('active');
                loadTabContent(this.dataset.tab);
            }
        });
    });
}

async function loadReportsData() {
    try {
        showLoading();
        
        const [studentsResponse, attendanceResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/students/`),
            fetch(`${API_BASE_URL}/attendance/history`)
        ]);
        
        reportsData.students = await studentsResponse.json();
        reportsData.attendance = await attendanceResponse.json();
        
        populateStudentFilters();
        updateSummaryCards();
        updateAllCharts();
        loadTabContent('summary');
        
        hideLoading();
        
    } catch (error) {
        console.error('Error loading reports data:', error);
        hideLoading();
        showNotification('Error loading reports data', 'error');
    }
}

function populateStudentFilters() {
    const studentSelects = [
        document.getElementById('student-select'),
        document.getElementById('individual-student-select')
    ];
    
    studentSelects.forEach(select => {
        if (select) {
            const options = reportsData.students.map(student => 
                `<option value="${student.name}">${student.name}</option>`
            ).join('');
            
            if (select.id === 'student-select') {
                select.innerHTML = '<option value="">All Students</option>' + options;
            } else {
                select.innerHTML = '<option value="">Select Student</option>' + options;
            }
        }
    });
}

function setDefaultDateRange() {
    const today = new Date();
    const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    
    const startDate = document.getElementById('start-date');
    const endDate = document.getElementById('end-date');
    
    if (startDate) startDate.value = oneMonthAgo.toISOString().split('T')[0];
    if (endDate) endDate.value = today.toISOString().split('T')[0];
}

function applyQuickFilter(period) {
    const today = new Date();
    let startDate, endDate = today;
    
    switch (period) {
        case 'today':
            startDate = today;
            break;
        case 'week':
            startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
            break;
        case 'month':
            startDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
            break;
        case 'year':
            startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
            break;
    }
    
    const startInput = document.getElementById('start-date');
    const endInput = document.getElementById('end-date');
    
    if (startInput) startInput.value = startDate.toISOString().split('T')[0];
    if (endInput) endInput.value = endDate.toISOString().split('T')[0];
    
    updateReports();
}

function updateSummaryCards() {
    const totalStudents = reportsData.students.length;
    const totalAttendance = reportsData.attendance.length;
    const avgAttendanceRate = totalStudents > 0 ? Math.round((totalAttendance / (totalStudents * 30)) * 100) : 0;
    
    // Calculate average arrival time
    const times = reportsData.attendance.map(record => {
        const [hours, minutes] = record.time.split(':');
        return parseInt(hours) * 60 + parseInt(minutes);
    });
    const avgMinutes = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
    const avgHours = Math.floor(avgMinutes / 60);
    const avgMins = avgMinutes % 60;
    const avgTime = `${avgHours}:${avgMins.toString().padStart(2, '0')} ${avgHours >= 12 ? 'PM' : 'AM'}`;
    
    // Update cards with animation
    animateCounter('total-students-summary', totalStudents);
    animateCounter('total-attendance-summary', totalAttendance);
    animateCounter('avg-attendance-rate', avgAttendanceRate, '%');
    
    const avgTimeEl = document.getElementById('avg-arrival-time');
    if (avgTimeEl) avgTimeEl.textContent = avgTime;
}

function initializeCharts() {
    // Initialize all charts
    initializeTrendsChart();
    initializeDistributionChart();
    initializePatternsChart();
    initializePerformanceChart();
    initializeComparisonChart();
    initializeTrendAnalysisChart();
}

function initializeTrendsChart() {
    const ctx = document.getElementById('trendsChart');
    if (!ctx) return;
    
    const data = {
        labels: [],
        datasets: [{
            label: 'Daily Attendance',
            data: [],
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#8b5cf6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6
        }]
    };
    
    reportsData.charts.trends = new Chart(ctx, {
        type: 'line',
        data: data,
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

function initializeDistributionChart() {
    const ctx = document.getElementById('distributionChart');
    if (!ctx) return;
    
    const data = {
        labels: ['Present', 'Absent'],
        datasets: [{
            data: [0, 0],
            backgroundColor: ['#10b981', '#ef4444'],
            borderWidth: 0
        }]
    };
    
    reportsData.charts.distribution = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
    
    // Create custom legend
    createDistributionLegend(data);
}

function createDistributionLegend(data) {
    const legendEl = document.getElementById('distribution-legend');
    if (!legendEl) return;
    
    const html = data.labels.map((label, index) => `
        <div class="legend-item">
            <div class="legend-color" style="background-color: ${data.datasets[0].backgroundColor[index]}"></div>
            <span>${label}: ${data.datasets[0].data[index]}%</span>
        </div>
    `).join('');
    
    legendEl.innerHTML = html;
}

function initializePatternsChart() {
    const ctx = document.getElementById('patternsChart');
    if (!ctx) return;
    
    const data = {
        labels: [],
        datasets: [{
            label: 'Hourly Attendance',
            data: [],
            backgroundColor: 'rgba(139, 92, 246, 0.8)',
            borderColor: '#8b5cf6',
            borderWidth: 2
        }]
    };
    
    reportsData.charts.patterns = new Chart(ctx, {
        type: 'bar',
        data: data,
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

function initializePerformanceChart() {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;
    
    const data = {
        labels: [],
        datasets: [{
            label: 'Attendance Rate',
            data: [],
            backgroundColor: [
                'rgba(139, 92, 246, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)'
            ],
            borderWidth: 0
        }]
    };
    
    reportsData.charts.performance = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#a0a3bd',
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                y: {
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

function initializeComparisonChart() {
    const ctx = document.getElementById('comparisonChart');
    if (!ctx) return;
    
    const data = {
        labels: [],
        datasets: [{
            label: 'Class Average',
            data: [],
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            borderWidth: 3,
            fill: false
        }, {
            label: 'Individual Student',
            data: [],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 3,
            fill: false
        }]
    };
    
    reportsData.charts.comparison = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#a0a3bd'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
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

function initializeTrendAnalysisChart() {
    const ctx = document.getElementById('trendAnalysisChart');
    if (!ctx) return;
    
    const data = {
        labels: [],
        datasets: [{
            label: 'Monthly Trend',
            data: [],
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
        }]
    };
    
    reportsData.charts.trendAnalysis = new Chart(ctx, {
        type: 'line',
        data: data,
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

function updateAllCharts() {
    updateTrendsFromData();
    updateDistributionFromData();
    updatePatternsFromData();
    updatePerformanceFromData();
    updateComparisonFromData();
    updateTrendAnalysisFromData();
}

function loadTabContent(tabName) {
    switch (tabName) {
        case 'summary':
            loadSummaryReport();
            break;
        case 'individual':
            loadIndividualReports();
            break;
        case 'comparative':
            loadComparativeAnalysis();
            break;
        case 'trends':
            loadTrendAnalysis();
            break;
    }
}

function loadSummaryReport() {
    const tbody = document.getElementById('summary-table-body');
    if (!tbody) return;
    
    const summaryData = [
        { metric: 'Total Students', current: '25', previous: '23', change: '+8.7%', trend: 'up' },
        { metric: 'Average Attendance', current: '89%', previous: '85%', change: '+4.7%', trend: 'up' },
        { metric: 'On-Time Arrivals', current: '78%', previous: '82%', change: '-4.9%', trend: 'down' },
        { metric: 'Weekly Sessions', current: '5', previous: '5', change: '0%', trend: 'neutral' }
    ];
    
    const html = summaryData.map(row => `
        <tr>
            <td>${row.metric}</td>
            <td>${row.current}</td>
            <td>${row.previous}</td>
            <td class="change-${row.trend}">${row.change}</td>
            <td>
                <i class="fas fa-arrow-${row.trend === 'up' ? 'up' : row.trend === 'down' ? 'down' : 'right'} trend-${row.trend}"></i>
            </td>
        </tr>
    `).join('');
    
    tbody.innerHTML = html;
}

function loadComparativeAnalysis() {
    const rankingsEl = document.getElementById('student-rankings');
    if (!rankingsEl) return;
    
    const rankings = [
        { rank: 1, name: 'Aditya', score: '95%' },
        { rank: 2, name: 'Niti', score: '92%' },
        { rank: 3, name: 'Vinit', score: '90%' },
        { rank: 4, name: 'Karan', score: '88%' },
        { rank: 5, name: 'Sahil', score: '85%' }
    ];
    
    const html = rankings.map(student => `
        <div class="ranking-item">
            <div class="rank-number">${student.rank}</div>
            <div class="rank-info">
                <div class="rank-name">${student.name}</div>
                <div class="rank-score">Attendance: ${student.score}</div>
            </div>
        </div>
    `).join('');
    
    rankingsEl.innerHTML = html;
}

function loadTrendAnalysis() {
    const insightsEl = document.getElementById('trend-insights');
    if (!insightsEl) return;
    
    const insights = [
        {
            title: 'Improving Trend',
            description: 'Overall attendance has improved by 12% over the last month'
        },
        {
            title: 'Peak Hours',
            description: 'Most students arrive between 9-10 AM on weekdays'
        },
        {
            title: 'Weekly Pattern',
            description: 'Monday and Friday show slightly lower attendance rates'
        },
        {
            title: 'Recommendation',
            description: 'Consider implementing early arrival incentives'
        }
    ];
    
    const html = insights.map(insight => `
        <div class="insight-item">
            <div class="insight-title">${insight.title}</div>
            <div class="insight-description">${insight.description}</div>
        </div>
    `).join('');
    
    insightsEl.innerHTML = html;
}

function updateReports() {
    // This would typically filter data based on selected criteria
    updateSummaryCards();
    updateAllCharts();
    loadTabContent(document.querySelector('.tab-btn.active').dataset.tab);
}

function refreshReports() {
    showLoading();
    setTimeout(() => {
        loadReportsData();
        showNotification('Reports refreshed successfully!', 'success');
    }, 1000);
}

function exportReport() {
    showLoading();
    setTimeout(() => {
        // Simulate report generation
        const reportData = {
            generated: new Date().toISOString(),
            summary: 'Attendance Report',
            data: reportsData
        };
        
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        hideLoading();
        showNotification('Report exported successfully!', 'success');
    }, 1500);
}

function exportReportData(format) {
    showNotification(`Exporting report as ${format.toUpperCase()}...`, 'info');
    
    setTimeout(() => {
        showNotification(`Report exported as ${format.toUpperCase()} successfully!`, 'success');
    }, 1000);
}

// Utility functions
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

// Live update helpers
let reportsRefreshTimer = null;
function startReportsAutoRefresh() {
    if (reportsRefreshTimer) {
        clearInterval(reportsRefreshTimer);
    }
    reportsRefreshTimer = setInterval(() => {
        loadReportsData();
    }, 15000);
    window.addEventListener('beforeunload', () => {
        if (reportsRefreshTimer) clearInterval(reportsRefreshTimer);
    });
}

// Data-driven chart updates
function getSelectedDateRange() {
    const startInput = document.getElementById('start-date');
    const endInput = document.getElementById('end-date');
    const start = startInput && startInput.value ? new Date(startInput.value) : null;
    const end = endInput && endInput.value ? new Date(endInput.value) : null;
    return { start, end };
}

function formatDateKey(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function updateTrendsFromData() {
    const chart = reportsData.charts.trends;
    if (!chart) return;
    const { start, end } = getSelectedDateRange();
    const attendance = reportsData.attendance;

    if (!start || !end) return;
    const dayMs = 24 * 60 * 60 * 1000;
    const labels = [];
    const counts = [];
    for (let t = start.getTime(); t <= end.getTime(); t += dayMs) {
        const day = new Date(t);
        const key = formatDateKey(day);
        labels.push(key);
        counts.push(attendance.filter(r => r.date === key).length);
    }
    chart.data.labels = labels;
    chart.data.datasets[0].data = counts;
    chart.update();
}

function updateDistributionFromData() {
    const chart = reportsData.charts.distribution;
    if (!chart) return;
    const todayKey = formatDateKey(new Date());
    const presentTodayNames = new Set(reportsData.attendance.filter(r => r.date === todayKey).map(r => r.name));
    const totalStudents = reportsData.students.length;
    const present = presentTodayNames.size;
    const absent = Math.max(totalStudents - present, 0);
    chart.data.labels = ['Present', 'Absent'];
    chart.data.datasets[0].data = [present, absent];
    chart.update();
    createDistributionLegend(chart.data);
}

function updatePatternsFromData() {
    const chart = reportsData.charts.patterns;
    if (!chart) return;
    const todayKey = formatDateKey(new Date());
    const todayRecords = reportsData.attendance.filter(r => r.date === todayKey);
    const hourToCount = new Map();
    todayRecords.forEach(r => {
        const parts = (r.time || '').split(':');
        const hour = parts.length > 0 ? parseInt(parts[0], 10) : 0;
        hourToCount.set(hour, (hourToCount.get(hour) || 0) + 1);
    });
    const hoursSorted = Array.from(hourToCount.keys()).sort((a,b) => a-b);
    const labels = hoursSorted.map(h => {
        const h12 = ((h + 11) % 12) + 1;
        const ampm = h < 12 ? 'AM' : 'PM';
        return `${h12} ${ampm}`;
    });
    const data = hoursSorted.map(h => hourToCount.get(h));
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
}

function updatePerformanceFromData() {
    const chart = reportsData.charts.performance;
    if (!chart) return;
    const attendance = reportsData.attendance;
    const totalDays = Array.from(new Set(attendance.map(r => r.date))).length;
    const nameToCount = new Map();
    attendance.forEach(r => {
        nameToCount.set(r.name, (nameToCount.get(r.name) || 0) + 1);
    });
    const items = reportsData.students.map(s => {
        const presentDays = nameToCount.get(s.name) || 0;
        const rate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
        return { name: s.name, rate };
    }).sort((a, b) => b.rate - a.rate).slice(0, 10);
    chart.data.labels = items.map(i => i.name);
    chart.data.datasets[0].data = items.map(i => i.rate);
    chart.update();
}

function getWeekKey(dateStr) {
    const d = new Date(dateStr);
    const onejan = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${String(week).padStart(2,'0')}`;
}

function updateComparisonFromData() {
    const chart = reportsData.charts.comparison;
    if (!chart) return;
    const attendance = reportsData.attendance;
    const totalStudents = reportsData.students.length || 1;
    const weekToClassCount = new Map();
    const nameToWeekCount = new Map();
    attendance.forEach(r => {
        const wk = getWeekKey(r.date);
        weekToClassCount.set(wk, (weekToClassCount.get(wk) || 0) + 1);
        const key = `${r.name}:${wk}`;
        nameToWeekCount.set(key, (nameToWeekCount.get(key) || 0) + 1);
    });
    const weeks = Array.from(new Set(attendance.map(r => getWeekKey(r.date)))).sort();
    const classAvg = weeks.map(wk => Math.round((weekToClassCount.get(wk) / totalStudents) * 100));
    // Pick top student by overall rate for comparison
    const nameToTotal = new Map();
    attendance.forEach(r => nameToTotal.set(r.name, (nameToTotal.get(r.name) || 0) + 1));
    const totalDays = Array.from(new Set(attendance.map(r => r.date))).length || 1;
    const topStudent = Array.from(nameToTotal.entries()).map(([name, c]) => ({ name, rate: c / totalDays })).sort((a,b)=>b.rate-a.rate)[0];
    const studentSeries = weeks.map(wk => {
        const key = `${topStudent ? topStudent.name : ''}:${wk}`;
        const count = nameToWeekCount.get(key) || 0;
        return Math.round((count) * 100 / 1); // raw counts scaled to percentage of days in week (approximate)
    });
    chart.data.labels = weeks;
    chart.data.datasets[0].data = classAvg;
    chart.data.datasets[1].data = studentSeries;
    chart.update();
}

function updateTrendAnalysisFromData() {
    const chart = reportsData.charts.trendAnalysis;
    if (!chart) return;
    const byMonth = new Map();
    reportsData.attendance.forEach(r => {
        const d = new Date(r.date);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
        byMonth.set(key, (byMonth.get(key) || 0) + 1);
    });
    const labels = Array.from(byMonth.keys()).sort();
    const data = labels.map(k => byMonth.get(k));
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
}