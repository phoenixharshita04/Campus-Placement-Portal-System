const API_URL = 'http://localhost:8080/api';

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    loadMetrics();
    loadStudents();
    loadCompanies();
    loadJobs();
    loadApplications();
    loadReports();
});

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };
    
    const response = await fetch(`${API_URL}${url}`, { ...options, headers });
    
    if (response.status === 401 || response.status === 403) {
        logout();
        throw new Error('Authentication failed');
    }
    
    return response;
}

async function loadMetrics() {
    try {
        const res = await fetchWithAuth('/admin/metrics');
        if (res.ok) {
            const metrics = await res.json();
            document.getElementById('metricStudents').textContent = metrics.totalStudents || 0;
            document.getElementById('metricCompanies').textContent = metrics.totalCompanies || 0;
            document.getElementById('metricJobs').textContent = metrics.totalJobs || 0;
            document.getElementById('metricApplications').textContent = metrics.totalApplications || 0;
            document.getElementById('metricPlaced').textContent = metrics.totalPlacedStudents || 0;
        }
    } catch (err) {
        console.error("Failed to load metrics", err);
    }
}

async function loadStudents() {
    try {
        const res = await fetchWithAuth('/admin/students');
        if (res.ok) {
            const students = await res.json();
            const tbody = document.getElementById('studentsTableBody');
            tbody.innerHTML = '';
            
            if (students.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No students registered</td></tr>';
                return;
            }
            
            students.forEach(s => {
                tbody.innerHTML += `
                    <tr>
                        <td>#${s.id}</td>
                        <td>${s.name}</td>
                        <td>${s.rollNo}</td>
                        <td>${s.branch}</td>
                        <td>${s.cgpa}</td>
                        <td>${s.graduationYear}</td>
                        <td>
                            <button class="btn-delete" onclick="deleteStudent(${s.id})">Delete</button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (err) {
        console.error("Failed to load students", err);
    }
}

async function loadCompanies() {
    try {
        const res = await fetchWithAuth('/admin/companies');
        if (res.ok) {
            const companies = await res.json();
            const tbody = document.getElementById('companiesTableBody');
            tbody.innerHTML = '';
            
            if (companies.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No companies registered</td></tr>';
                return;
            }
            
            companies.forEach(c => {
                tbody.innerHTML += `
                    <tr>
                        <td>#${c.id}</td>
                        <td>${c.companyName}</td>
                        <td>${c.industry || '-'}</td>
                        <td>
                            ${c.website ? `<a href="${c.website}" target="_blank">Link</a>` : '-'}
                        </td>
                        <td>
                            <button class="btn-delete" onclick="deleteCompany(${c.id})">Delete</button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (err) {
        console.error("Failed to load companies", err);
    }
}

async function loadJobs() {
    try {
        const res = await fetchWithAuth('/admin/jobs');
        if (res.ok) {
            const jobs = await res.json();
            const tbody = document.getElementById('jobsTableBody');
            tbody.innerHTML = '';
            
            if (jobs.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No job drives available</td></tr>';
                return;
            }
            
            jobs.forEach(j => {
                tbody.innerHTML += `
                    <tr>
                        <td>#${j.id}</td>
                        <td>${j.jobTitle}</td>
                        <td>${j.companyName}</td>
                        <td>${j.minCgpa}</td>
                        <td><span class="badge" style="background:#e0e7ff;color:#4f46e5">${j.status}</span></td>
                        <td>
                            <button class="btn-delete" onclick="deleteJob(${j.id})">Delete</button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (err) {
        console.error("Failed to load jobs", err);
    }
}

async function loadApplications() {
    try {
        const res = await fetchWithAuth('/admin/applications');
        if (res.ok) {
            const apps = await res.json();
            const tbody = document.getElementById('applicationsTableBody');
            tbody.innerHTML = '';
            
            if (apps.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No applications submitted</td></tr>';
                return;
            }
            
            apps.forEach(a => {
                const date = new Date(a.applied_date).toLocaleDateString();
                const studentName = a.studentProfile ? a.studentProfile.name : 'Unknown';
                const companyName = a.jobPosting ? a.jobPosting.companyName : 'Unknown';
                const jobTitle = a.jobPosting ? a.jobPosting.jobTitle : 'Unknown';
                
                tbody.innerHTML += `
                    <tr>
                        <td>#${a.application_id}</td>
                        <td>${studentName}</td>
                        <td>${companyName}</td>
                        <td>${jobTitle}</td>
                        <td><span class="badge" style="background:${getStatusColor(a.status)}">${a.status}</span></td>
                        <td>${date}</td>
                    </tr>
                `;
            });
        }
    } catch (err) {
        console.error("Failed to load applications", err);
    }
}

function getStatusColor(status) {
    switch(status) {
        case 'APPLIED': return '#e0e7ff';
        case 'UNDER_REVIEW': return '#f3e8ff';
        case 'SHORTLISTED': return '#fef08a';
        case 'INTERVIEW_SCHEDULED': return '#fed7aa';
        case 'SELECTED': return '#a7f3d0';
        case 'REJECTED': return '#fecaca';
        default: return '#e0e7ff';
    }
}

function formatStatus(status) {
    if (!status) return '';
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}

async function loadReports() {
    try {
        const res = await fetchWithAuth('/admin/reports');
        if (res.ok) {
            const reports = await res.json();
            document.getElementById('reportPlaced').textContent = reports.totalPlacedStudents;
            document.getElementById('reportUnplaced').textContent = reports.totalUnplacedStudents;
            
            const distContainer = document.getElementById('statusDistributionContainer');
            distContainer.innerHTML = '';
            
            if (reports.statusDistribution) {
                for (const [status, count] of Object.entries(reports.statusDistribution)) {
                    const color = getStatusColor(status);
                    distContainer.innerHTML += `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #e2e8f0;">
                            <span class="badge" style="background:${color}">${formatStatus(status)}</span>
                            <span style="font-weight: bold; color: var(--text-main);">${count}</span>
                        </div>
                    `;
                }
            }
        }
    } catch (err) {
        console.error("Failed to load reports", err);
    }
}

async function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this student and their applications?')) {
        try {
            const res = await fetchWithAuth(`/admin/students/${id}`, { method: 'DELETE' });
            if (res.ok) {
                loadStudents();
                loadApplications();
                loadMetrics();
            }
        } catch (err) { alert('Failed to delete student'); }
    }
}

async function deleteCompany(id) {
    if (confirm('Are you sure you want to delete this company, their jobs, and applications?')) {
        try {
            const res = await fetchWithAuth(`/admin/companies/${id}`, { method: 'DELETE' });
            if (res.ok) {
                loadCompanies();
                loadJobs();
                loadApplications();
                loadMetrics();
            }
        } catch (err) { alert('Failed to delete company'); }
    }
}

async function deleteJob(id) {
    if (confirm('Are you sure you want to delete this job and its applications?')) {
        try {
            const res = await fetchWithAuth(`/admin/jobs/${id}`, { method: 'DELETE' });
            if (res.ok) {
                loadJobs();
                loadApplications();
                loadMetrics();
            }
        } catch (err) { alert('Failed to delete job'); }
    }
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Hide all sections including dashboard
    const sections = ['dashboardSection', 'studentsSection', 'companiesSection', 'jobsSection', 'applicationsSection', 'reportsSection'];
    sections.forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });

    // Show selected section
    document.getElementById(tabId + 'Section').classList.remove('hidden');
}
