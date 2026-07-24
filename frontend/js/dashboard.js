document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    if (!getToken()) {
        window.location.href = 'login.html';
        return;
    }

    // Elements
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const sections = document.querySelectorAll('.section');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Form Elements
    const profileForm = document.getElementById('profileForm');
    const profMessage = document.getElementById('profMessage');
    const userNameDisplay = document.getElementById('userNameDisplay');

    // Navigation Logic
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            // Update active sidebar item
            sidebarItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Show target section
            const targetId = item.getAttribute('data-target');
            sections.forEach(sec => sec.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');

            // Load data based on section
            if (targetId === 'jobsSection') {
                loadJobs();
            } else if (targetId === 'applicationsSection') {
                loadApplications();
            }
        });
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        removeToken();
        window.location.href = 'login.html';
    });

    // Load Initial Data (Profile)
    try {
        const profile = await apiCall('/student/profile', 'GET');
        
        document.getElementById('profName').value = profile.name;
        document.getElementById('profEmail').value = profile.email || '';
        document.getElementById('profMobile').value = profile.phone || '';
        document.getElementById('profRollNo').value = profile.rollNo;
        document.getElementById('profDept').value = profile.branch;
        document.getElementById('profCgpa').value = profile.cgpa;
        document.getElementById('profYear').value = profile.graduationYear;
        document.getElementById('profSkills').value = profile.skills || '';
        document.getElementById('profResume').value = profile.resume || '';
        
        const viewBtn = document.getElementById('resumeViewBtn');
        if (profile.resume) {
            viewBtn.href = profile.resume;
            viewBtn.style.display = 'inline-block';
        } else {
            viewBtn.style.display = 'none';
        }
        
        userNameDisplay.textContent = `Welcome, ${profile.name}`;
    } catch (error) {
        console.error('Error loading profile:', error);
        alert('Session expired or error loading profile.');
        removeToken();
        window.location.href = 'login.html';
    }

    // Profile Update Submission
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        profMessage.textContent = 'Updating...';
        profMessage.style.color = 'var(--text-secondary)';

        const payload = {
            name: document.getElementById('profName').value,
            rollNo: document.getElementById('profRollNo').value,
            branch: document.getElementById('profDept').value,
            cgpa: parseFloat(document.getElementById('profCgpa').value),
            graduationYear: parseInt(document.getElementById('profYear').value),
            resume: document.getElementById('profResume').value,
            phone: document.getElementById('profMobile').value,
            skills: document.getElementById('profSkills').value
        };

        try {
            await apiCall('/student/profile', 'PUT', payload);
            profMessage.textContent = 'Profile updated successfully!';
            profMessage.style.color = 'var(--success-color)';
            userNameDisplay.textContent = `Welcome, ${payload.name}`;
        } catch (error) {
            profMessage.textContent = 'Error updating profile.';
            profMessage.style.color = 'var(--danger-color)';
        }
    });

    // Resume Upload Logic
    document.getElementById('uploadResumeBtn').addEventListener('click', async () => {
        const fileInput = document.getElementById('resumeFile');
        const uploadMsg = document.getElementById('uploadMessage');
        const file = fileInput.files[0];

        if (!file) {
            uploadMsg.textContent = 'Please select a PDF file first.';
            uploadMsg.style.color = 'var(--danger-color)';
            return;
        }
        
        if (file.type !== 'application/pdf') {
            uploadMsg.textContent = 'Only PDF files are allowed.';
            uploadMsg.style.color = 'var(--danger-color)';
            return;
        }

        uploadMsg.textContent = 'Uploading...';
        uploadMsg.style.color = 'var(--text-secondary)';
        
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const token = getToken();
            const response = await fetch('http://localhost:8080/api/student/profile/resume', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const fileUrl = await response.text();
            
            uploadMsg.textContent = 'Resume uploaded successfully!';
            uploadMsg.style.color = 'var(--success-color)';
            
            // Update input and view button
            document.getElementById('profResume').value = fileUrl;
            const viewBtn = document.getElementById('resumeViewBtn');
            viewBtn.href = fileUrl;
            viewBtn.style.display = 'inline-block';
            
        } catch (error) {
            uploadMsg.textContent = 'Error uploading resume.';
            uploadMsg.style.color = 'var(--danger-color)';
        }
    });

    // Load Jobs
    async function loadJobs() {
        const jobsList = document.getElementById('jobsList');
        jobsList.innerHTML = '<div class="text-center">Loading jobs...</div>';
        
        const search = document.getElementById('jobSearchInput').value || '';
        const location = document.getElementById('locationFilterInput').value || '';
        const salary = document.getElementById('salaryFilterInput').value || '';
        
        let url = '/jobs';
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (location) params.append('location', location);
        if (salary) params.append('salary', salary);
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        try {
            const jobs = await apiCall(url, 'GET');
            
            if (jobs.length === 0) {
                jobsList.innerHTML = '<div class="text-center" style="color: var(--text-secondary);">No eligible jobs found at the moment.</div>';
                return;
            }

            jobsList.innerHTML = jobs.map(job => `
                <div class="card">
                    <div class="d-flex justify-between align-center">
                        <h3 class="job-title">${job.jobTitle}</h3>
                        <span class="badge" style="background: rgba(59, 130, 246, 0.2); color: var(--primary-color);">Deadline: ${job.lastDateToApply || 'N/A'}</span>
                    </div>
                    <div class="company-name">${job.companyName}</div>
                    <div class="job-details" style="display:flex; gap: 15px; margin-bottom: 10px;">
                        <span><strong>📍</strong> ${job.location || 'Not specified'}</span>
                        <span><strong>💰</strong> ${job.salaryPackage || 'Not specified'}</span>
                    </div>
                    <div class="job-details">${job.description ? job.description.substring(0, 100) + '...' : ''}</div>
                    <button class="btn btn-primary mt-4 view-job-btn" data-job-id="${job.id}">View Details & Apply</button>
                </div>
            `).join('');

            // Attach event listeners to view buttons
            document.querySelectorAll('.view-job-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const jobId = e.target.getAttribute('data-job-id');
                    openJobDetailsModal(jobId);
                });
            });

        } catch (error) {
            jobsList.innerHTML = `<div class="text-center" style="color: var(--danger-color);">Error loading jobs: ${error.message}</div>`;
        }
    }

    // Search button listener
    document.getElementById('jobSearchBtn').addEventListener('click', loadJobs);
    
    // Global variable for currently viewed job
    let currentViewJobId = null;

    // Open Job Details Modal
    window.openJobDetailsModal = async function(jobId) {
        currentViewJobId = jobId;
        const msg = document.getElementById('modalApplyMessage');
        msg.textContent = '';
        const applyBtn = document.getElementById('modalApplyBtn');
        applyBtn.textContent = 'Apply Now';
        applyBtn.disabled = false;
        applyBtn.classList.remove('btn-success');
        applyBtn.classList.add('btn-primary');
        
        try {
            const job = await apiCall(`/jobs/${jobId}`, 'GET');
            
            document.getElementById('modalJobTitle').textContent = job.jobTitle;
            document.getElementById('modalCompanyName').textContent = job.companyName;
            document.getElementById('modalLocation').textContent = job.location || 'Not specified';
            document.getElementById('modalSalary').textContent = job.salaryPackage || 'Not specified';
            document.getElementById('modalMinCgpa').textContent = job.minCgpa;
            document.getElementById('modalLastDate').textContent = job.lastDateToApply || 'Not specified';
            document.getElementById('modalSkills').textContent = job.requiredSkills || 'Not specified';
            document.getElementById('modalEligibility').textContent = job.eligibilityCriteria || 'Not specified';
            document.getElementById('modalDescription').textContent = job.description || 'No description provided.';
            
            document.getElementById('jobDetailsModal').style.display = 'flex';
        } catch(error) {
            alert('Failed to load job details');
        }
    };
    
    window.closeJobDetailsModal = function() {
        document.getElementById('jobDetailsModal').style.display = 'none';
    };
    
    // Apply from Modal
    document.getElementById('modalApplyBtn').addEventListener('click', async (e) => {
        if (!currentViewJobId) return;
        const applyBtn = e.target;
        const msg = document.getElementById('modalApplyMessage');
        
        try {
            applyBtn.textContent = 'Applying...';
            applyBtn.disabled = true;
            await apiCall(`/jobs/${currentViewJobId}/apply`, 'POST');
            applyBtn.textContent = 'Applied Successfully';
            applyBtn.classList.replace('btn-primary', 'btn-success');
            msg.textContent = 'Application submitted!';
            msg.style.color = 'var(--success-color)';
        } catch (error) {
            applyBtn.textContent = 'Apply Now';
            applyBtn.disabled = false;
            msg.textContent = error.message;
            msg.style.color = 'var(--danger-color)';
        }
    });

    // Load Applications
    async function loadApplications() {
        const applicationsList = document.getElementById('applicationsList');
        applicationsList.innerHTML = '<div class="text-center">Loading applications...</div>';
        
        try {
            const apps = await apiCall('/jobs/applications', 'GET');
            
            if (apps.length === 0) {
                applicationsList.innerHTML = '<div class="text-center" style="color: var(--text-secondary);">You have not applied to any jobs yet.</div>';
                return;
            }

            applicationsList.innerHTML = apps.map(app => {
                const job = app.jobPosting;
                
                return `
                <div class="card d-flex justify-between align-center">
                    <div>
                        <h3 class="job-title" style="margin-bottom: 4px; font-size: 1.1rem;">${job.jobTitle}</h3>
                        <div class="company-name" style="margin-bottom: 4px; font-size: 0.9rem;">${job.companyName}</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">Applied on: ${new Date(app.applied_date).toLocaleDateString()}</div>
                    </div>
                    <div>
                        <span class="badge" style="background:${getStudentStatusColor(app.status)}">${formatStudentStatus(app.status)}</span>
                    </div>
                </div>
                `;
            }).join('');
            
            loadDashboardMetrics(applications);
        } catch (error) {
            applicationsList.innerHTML = `<div class="text-center" style="color: var(--danger-color);">Error loading applications: ${error.message}</div>`;
        }
    }
    
    function loadDashboardMetrics(applications) {
        document.getElementById('dashTotalApplied').textContent = applications.length;
        const selected = applications.filter(a => a.status === 'SELECTED').length;
        const underReview = applications.filter(a => ['UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED'].includes(a.status)).length;
        document.getElementById('dashSelected').textContent = selected;
        document.getElementById('dashUnderReview').textContent = underReview;
    }
    
    function getStudentStatusColor(status) {
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

    function formatStudentStatus(status) {
        if (!status) return '';
        return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    }
});
