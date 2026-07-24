package com.placement.portal.controller;

import com.placement.portal.dto.JobApplicationDTO;
import com.placement.portal.dto.JobPostingDTO;
import com.placement.portal.model.JobApplication;
import com.placement.portal.model.JobPosting;
import com.placement.portal.model.StudentProfile;
import com.placement.portal.repository.JobApplicationRepository;
import com.placement.portal.repository.JobPostingRepository;
import com.placement.portal.repository.StudentProfileRepository;
import com.placement.portal.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    @Autowired
    private JobPostingRepository jobPostingRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @GetMapping
    public ResponseEntity<?> getEligibleJobs(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String salary) {
        
        StudentProfile profile = studentProfileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        List<JobPosting> jobs = jobPostingRepository.findByStatusAndMinCgpaLessThanEqual("ACTIVE", profile.getCgpa());
        
        // Filter jobs
        List<JobPostingDTO> jobDTOs = jobs.stream()
            .filter(j -> {
                if (search != null && !search.trim().isEmpty()) {
                    String s = search.toLowerCase();
                    boolean match = (j.getJobTitle() != null && j.getJobTitle().toLowerCase().contains(s)) ||
                                    (j.getCompanyName() != null && j.getCompanyName().toLowerCase().contains(s)) ||
                                    (j.getRequiredSkills() != null && j.getRequiredSkills().toLowerCase().contains(s));
                    if (!match) return false;
                }
                if (location != null && !location.trim().isEmpty()) {
                    if (j.getLocation() == null || !j.getLocation().toLowerCase().contains(location.toLowerCase())) {
                        return false;
                    }
                }
                if (salary != null && !salary.trim().isEmpty()) {
                    if (j.getSalaryPackage() == null || !j.getSalaryPackage().toLowerCase().contains(salary.toLowerCase())) {
                        return false;
                    }
                }
                return true;
            })
            .map(job -> new JobPostingDTO(
                job.getId(), job.getCompanyName(), job.getJobTitle(),
                job.getDescription(), job.getMinCgpa(), job.getStatus(),
                job.getLocation(), job.getSalaryPackage(), job.getRequiredSkills(),
                job.getEligibilityCriteria(), job.getLastDateToApply()
            )).collect(Collectors.toList());

        return ResponseEntity.ok(jobDTOs);
    }
    
    @GetMapping("/{jobId}")
    public ResponseEntity<?> getJobDetails(@AuthenticationPrincipal CustomUserDetails currentUser, @PathVariable Long jobId) {
        JobPosting job = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
                
        JobPostingDTO dto = new JobPostingDTO(
                job.getId(), job.getCompanyName(), job.getJobTitle(),
                job.getDescription(), job.getMinCgpa(), job.getStatus(),
                job.getLocation(), job.getSalaryPackage(), job.getRequiredSkills(),
                job.getEligibilityCriteria(), job.getLastDateToApply()
        );
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/{jobId}/apply")
    public ResponseEntity<?> applyForJob(@AuthenticationPrincipal CustomUserDetails currentUser, 
                                         @PathVariable Long jobId) {
        StudentProfile profile = studentProfileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        JobPosting job = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getStatus().equals("ACTIVE")) {
            return ResponseEntity.badRequest().body("Job is no longer active");
        }

        if (profile.getCgpa() < job.getMinCgpa()) {
            return ResponseEntity.badRequest().body("Not eligible for this job based on CGPA criteria");
        }

        if (jobApplicationRepository.existsByStudentProfileIdAndJobPostingId(profile.getId(), jobId)) {
            return ResponseEntity.badRequest().body("Already applied for this job");
        }

        JobApplication application = new JobApplication();
        application.setStudentProfile(profile);
        application.setJobPosting(job);
        
        jobApplicationRepository.save(application);
        
        return ResponseEntity.ok("Successfully applied for the job");
    }

    @GetMapping("/applications")
    public ResponseEntity<?> getMyApplications(@AuthenticationPrincipal CustomUserDetails currentUser) {
        StudentProfile profile = studentProfileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        List<JobApplication> applications = jobApplicationRepository.findByStudentProfileId(profile.getId());
        
        List<JobApplicationDTO> applicationDTOs = applications.stream().map(app -> {
            JobPosting job = app.getJobPosting();
            JobPostingDTO jobDTO = new JobPostingDTO(
                    job.getId(), job.getCompanyName(), job.getJobTitle(),
                    job.getDescription(), job.getMinCgpa(), job.getStatus(),
                    job.getLocation(), job.getSalaryPackage(), job.getRequiredSkills(),
                    job.getEligibilityCriteria(), job.getLastDateToApply()
            );
            return new JobApplicationDTO(app.getId(), jobDTO, null, app.getStatus(), app.getApplicationDate());
        }).collect(Collectors.toList());

        return ResponseEntity.ok(applicationDTOs);
    }
}
