const API_URL = 'http://localhost:8080/api';

// Check Authentication
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    // Check if Company Role
    // Simple check: we just load company profile. If it fails due to 403, we redirect to login
    
    loadCompanyProfile();
    loadMyJobs();
    
    // Sidebar Navigation Logic
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
            const target = this.getAttribute('data-target');
            document.getElementById(target).classList.add('active');
        });
    });

    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
    document.getElementById('jobForm').addEventListener('submit', handleJobPost);
    document.getElementById('editJobForm').addEventListener('submit', handleJobEdit);
});

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
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

async function loadCompanyProfile() {
    try {
        const res = await fetchWithAuth('/companies/profile');
        if (res.ok) {
            const profile = await res.json();
            document.getElementById('userNameDisplay').textContent = profile.company_name || 'Company User';
            document.getElementById('companyName').value = profile.company_name || '';
            document.getElementById('companyEmail').value = profile.email || '';
            document.getElementById('contactNumber').value = profile.contactNumber || '';
            document.getElementById('website').value = profile.website || '';
            document.getElementById('industry').value = profile.industry || '';
            document.getElementById('description').value = profile.description || '';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    const profileData = {
        company_name: document.getElementById('companyName').value,
        contactNumber: document.getElementById('contactNumber').value,
        website: document.getElementById('website').value,
        industry: document.getElementById('industry').value,
        description: document.getElementById('description').value
    };

    try {
        const res = await fetchWithAuth('/companies/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
        
        if (res.ok) {
            alert('Profile updated successfully!');
            loadCompanyProfile();
        }
    } catch (error) {
        alert('Failed to update profile');
    }
}

async function handleJobPost(e) {
    e.preventDefault();
    const jobData = {
        jobTitle: document.getElementById('jobTitle').value,
        description: document.getElementById('jobDescription').value,
        minCgpa: parseFloat(document.getElementById('minCgpa').value),
        location: document.getElementById('jobLocation').value,
        salaryPackage: document.getElementById('jobSalary').value,
        requiredSkills: document.getElementById('jobSkills').value,
        eligibilityCriteria: document.getElementById('jobEligibility').value,
        lastDateToApply: document.getElementById('jobLastDate').value
    };

    try {
        const res = await fetchWithAuth('/companies/jobs', {
            method: 'POST',
            body: JSON.stringify(jobData)
        });
        
        if (res.ok) {
            alert('Job posted successfully!');
            document.getElementById('jobForm').reset();
            loadMyJobs();
        }
    } catch (error) {
        alert('Failed to post job');
    }
}

let currentJobs = [];

async function loadMyJobs() {
    try {
        const res = await fetchWithAuth('/companies/jobs');
        if (res.ok) {
            currentJobs = await res.json();
            const jobsListElement = document.getElementById('jobsList');
            jobsListElement.innerHTML = '';
            
            if (currentJobs.length === 0) {
                jobsListElement.innerHTML = '<p>No jobs posted yet.</p>';
                return;
            }
            
            currentJobs.forEach(job => {
                const card = document.createElement('div');
                card.className = 'job-card';
                card.innerHTML = `
                    <div class="job-header">
                        <div class="job-title">${job.jobTitle}</div>
                        <span class="badge">${job.status}</span>
                    </div>
                    <p style="margin: 0.5rem 0; font-size: 0.9rem;">Min CGPA: ${job.minCgpa}</p>
                    <div style="display: flex; gap: 10px; margin-top: 1rem;">
                        <button class="btn btn-outline" style="font-size: 0.8rem; padding: 0.25rem 0.5rem;" onclick="viewApplicants(${job.id}, '${job.jobTitle}')">View Applicants</button>
                        <button class="btn btn-outline" style="font-size: 0.8rem; padding: 0.25rem 0.5rem;" onclick="openEditJobModal(${job.id})">
                            Edit
                        </button>
                        <button class="btn btn-outline" style="font-size: 0.85rem; color: var(--danger-color); border-color: var(--danger-color);" onclick="deleteJob(${job.id})">
                            Delete
                        </button>
                    </div>
                `;
                jobsListElement.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error loading jobs:', error);
    }
}

function openEditJobModal(jobId) {
    const job = currentJobs.find(j => j.id === jobId);
    if (!job) return;
    
    document.getElementById('editJobId').value = job.id;
    document.getElementById('editJobTitle').value = job.jobTitle;
    document.getElementById('editJobDescription').value = job.description;
    document.getElementById('editMinCgpa').value = job.minCgpa;
    document.getElementById('editJobLocation').value = job.location || '';
    document.getElementById('editJobSalary').value = job.salaryPackage || '';
    document.getElementById('editJobSkills').value = job.requiredSkills || '';
    document.getElementById('editJobEligibility').value = job.eligibilityCriteria || '';
    document.getElementById('editJobLastDate').value = job.lastDateToApply || '';
    
    document.getElementById('editJobModal').style.display = 'flex';
}

function closeEditJobModal() {
    document.getElementById('editJobModal').style.display = 'none';
}

async function handleJobEdit(e) {
    e.preventDefault();
    const jobId = document.getElementById('editJobId').value;
    const jobData = {
        jobTitle: document.getElementById('editJobTitle').value,
        description: document.getElementById('editJobDescription').value,
        minCgpa: parseFloat(document.getElementById('editMinCgpa').value),
        location: document.getElementById('editJobLocation').value,
        salaryPackage: document.getElementById('editJobSalary').value,
        requiredSkills: document.getElementById('editJobSkills').value,
        eligibilityCriteria: document.getElementById('editJobEligibility').value,
        lastDateToApply: document.getElementById('editJobLastDate').value
    };

    try {
        const res = await fetchWithAuth(`/companies/jobs/${jobId}`, {
            method: 'PUT',
            body: JSON.stringify(jobData)
        });
        
        if (res.ok) {
            alert('Job updated successfully!');
            closeEditJobModal();
            loadMyJobs();
        } else {
            alert('Failed to update job');
        }
    } catch (error) {
        alert('Error updating job');
    }
}

async function deleteJob(jobId) {
    if (!confirm('Are you sure you want to delete this job posting? This will also remove all associated applications.')) {
        return;
    }
    
    try {
        const res = await fetchWithAuth(`/companies/jobs/${jobId}`, {
            method: 'DELETE'
        });
        
        if (res.ok) {
            alert('Job deleted successfully!');
            loadMyJobs();
        } else {
            alert('Failed to delete job');
        }
    } catch (error) {
        alert('Error deleting job');
    }
}

let currentJobId = null;

async function viewApplicants(jobId, jobTitle) {
    currentJobId = jobId;
    document.getElementById('applicantsJobTitle').textContent = `Applicants for: ${jobTitle}`;
    
    // Navigate to applicants section
    document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
    document.querySelector('[data-target="applicantsSection"]').classList.add('active');
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById('applicantsSection').classList.add('active');

    try {
        const res = await fetchWithAuth(`/companies/jobs/${jobId}/applications`);
        if (res.ok) {
            const applications = await res.json();
            const tbody = document.getElementById('applicationsTableBody');
            tbody.innerHTML = '';
            
            if (applications.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No applications yet</td></tr>';
                return;
            }
            
            applications.forEach(app => {
                const date = new Date(app.applied_date).toLocaleDateString();
                const student = app.studentProfile;
                
                tbody.innerHTML += `
                    <tr>
                        <td>${student.name}</td>
                        <td>${student.rollNo}</td>
                        <td>${student.branch}</td>
                        <td>${student.cgpa}</td>
                        <td>${date}</td>
                        <td>
                            <span class="badge" style="background:${getStatusColor(app.status)}">${formatStatus(app.status)}</span>
                        </td>
                        <td>
                            <select class="status-select" onchange="updateStatus(${app.application_id}, this.value)">
                                <option value="" disabled selected>Update Status</option>
                                <option value="UNDER_REVIEW">Under Review</option>
                                <option value="SHORTLISTED">Shortlist</option>
                                <option value="INTERVIEW_SCHEDULED">Schedule Interview</option>
                                <option value="SELECTED">Select</option>
                                <option value="REJECTED">Reject</option>
                            </select>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (error) {
        console.error(error);
        alert('Failed to load applications');
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

async function updateStatus(appId, newStatus) {
    if (!newStatus) return;
    
    try {
        const res = await fetchWithAuth(`/companies/applications/${appId}/status`, {
            method: 'PUT',
            body: JSON.stringify(newStatus)
        });
        
        if (res.ok) {
            // Refresh list
            viewApplications(currentJobId);
        }
    } catch(err) {
        alert("Failed to update status");
    }
}

function closeModal() {
    document.getElementById('applicationsModal').style.display = 'none';
}
