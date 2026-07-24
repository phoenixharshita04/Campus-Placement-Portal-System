package com.placement.portal.controller;

import com.placement.portal.dto.CompanyProfileDTO;
import com.placement.portal.dto.JobPostingDTO;
import com.placement.portal.dto.JobApplicationDTO;
import com.placement.portal.dto.StudentProfileDTO;
import com.placement.portal.model.*;
import com.placement.portal.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    @Autowired
    private CompanyProfileRepository companyProfileRepository;

    @Autowired
    private JobPostingRepository jobPostingRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @Autowired
    private UserRepository userRepository;

    private CompanyProfile getProfile(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        return companyProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    CompanyProfile newProfile = new CompanyProfile();
                    newProfile.setUser(user);
                    newProfile.setCompanyName("New Company");
                    return companyProfileRepository.save(newProfile);
                });
    }

    @GetMapping("/profile")
    public ResponseEntity<CompanyProfileDTO> getCompanyProfile(Authentication auth) {
        CompanyProfile profile = getProfile(auth);
        CompanyProfileDTO dto = new CompanyProfileDTO();
        dto.setId(profile.getId());
        dto.setCompanyName(profile.getCompanyName());
        dto.setWebsite(profile.getWebsite());
        dto.setIndustry(profile.getIndustry());
        dto.setDescription(profile.getDescription());
        dto.setContactNumber(profile.getContactNumber());
        dto.setEmail(profile.getUser() != null ? profile.getUser().getEmail() : "");
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateCompanyProfile(Authentication auth, @RequestBody CompanyProfileDTO req) {
        CompanyProfile profile = getProfile(auth);
        profile.setCompanyName(req.getCompanyName());
        profile.setWebsite(req.getWebsite());
        profile.setIndustry(req.getIndustry());
        profile.setDescription(req.getDescription());
        profile.setContactNumber(req.getContactNumber());
        companyProfileRepository.save(profile);
        return ResponseEntity.ok("Profile updated successfully");
    }

    @PostMapping("/jobs")
    public ResponseEntity<?> postJob(Authentication auth, @RequestBody JobPosting req) {
        CompanyProfile profile = getProfile(auth);
        JobPosting job = new JobPosting();
        job.setCompanyProfile(profile);
        job.setCompanyName(profile.getCompanyName());
        job.setJobTitle(req.getJobTitle());
        job.setDescription(req.getDescription());
        job.setMinCgpa(req.getMinCgpa());
        job.setLocation(req.getLocation());
        job.setSalaryPackage(req.getSalaryPackage());
        job.setRequiredSkills(req.getRequiredSkills());
        job.setEligibilityCriteria(req.getEligibilityCriteria());
        job.setLastDateToApply(req.getLastDateToApply());
        job.setStatus("ACTIVE");
        return ResponseEntity.ok(jobPostingRepository.save(job));
    }

    @GetMapping("/jobs")
    public ResponseEntity<List<JobPosting>> getMyJobs(Authentication auth) {
        CompanyProfile profile = getProfile(auth);
        List<JobPosting> jobs = jobPostingRepository.findAll().stream()
                .filter(j -> j.getCompanyProfile() != null && j.getCompanyProfile().getId().equals(profile.getId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(jobs);
    }

    @PutMapping("/jobs/{jobId}")
    public ResponseEntity<?> updateJob(Authentication auth, @PathVariable Long jobId, @RequestBody JobPosting req) {
        CompanyProfile profile = getProfile(auth);
        JobPosting job = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (job.getCompanyProfile() == null || !job.getCompanyProfile().getId().equals(profile.getId())) {
            return ResponseEntity.status(403).body("Unauthorized");
        }

        job.setJobTitle(req.getJobTitle());
        job.setDescription(req.getDescription());
        job.setMinCgpa(req.getMinCgpa());
        job.setLocation(req.getLocation());
        job.setSalaryPackage(req.getSalaryPackage());
        job.setRequiredSkills(req.getRequiredSkills());
        job.setEligibilityCriteria(req.getEligibilityCriteria());
        job.setLastDateToApply(req.getLastDateToApply());
        // Status can also be updated if required, keeping it active by default
        jobPostingRepository.save(job);
        
        return ResponseEntity.ok("Job updated successfully");
    }

    @DeleteMapping("/jobs/{jobId}")
    public ResponseEntity<?> deleteJob(Authentication auth, @PathVariable Long jobId) {
        CompanyProfile profile = getProfile(auth);
        JobPosting job = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (job.getCompanyProfile() == null || !job.getCompanyProfile().getId().equals(profile.getId())) {
            return ResponseEntity.status(403).body("Unauthorized");
        }

        // JobApplicationRepository has deleteByJobPostingId thanks to Admin implementation
        jobApplicationRepository.deleteByJobPostingId(jobId);
        jobPostingRepository.delete(job);
        
        return ResponseEntity.ok("Job deleted successfully");
    }

    @GetMapping("/jobs/{jobId}/applications")
    public ResponseEntity<List<JobApplicationDTO>> getJobApplications(Authentication auth, @PathVariable Long jobId) {
        CompanyProfile profile = getProfile(auth);
        JobPosting job = jobPostingRepository.findById(jobId).orElseThrow();
        if (job.getCompanyProfile() == null || !job.getCompanyProfile().getId().equals(profile.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        List<JobApplication> apps = jobApplicationRepository.findAll().stream()
                .filter(a -> a.getJobPosting().getId().equals(jobId))
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(apps.stream().map(a -> {
            StudentProfile s = a.getStudentProfile();
            StudentProfileDTO sdto = new StudentProfileDTO(s.getId(), s.getName(), s.getRollNo(), s.getDepartment(), s.getCgpa(), s.getGraduationYear());
            return new JobApplicationDTO(a.getId(), null, sdto, a.getStatus(), a.getApplicationDate());
        }).collect(Collectors.toList()));
    }
    
    @PutMapping("/applications/{appId}/status")
    public ResponseEntity<?> updateApplicationStatus(Authentication auth, @PathVariable Long appId, @RequestBody String status) {
        CompanyProfile profile = getProfile(auth);
        JobApplication app = jobApplicationRepository.findById(appId).orElseThrow();
        
        if (app.getJobPosting().getCompanyProfile() == null || !app.getJobPosting().getCompanyProfile().getId().equals(profile.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        status = status.replace("\"", "");
        app.setStatus(ApplicationStatus.valueOf(status));
        return ResponseEntity.ok(jobApplicationRepository.save(app));
    }
}
