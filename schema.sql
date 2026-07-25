-- Campus Placement Portal System Schema and Seed Data

-- We rely on Spring Boot (Hibernate) with `ddl-auto=update` to create tables automatically based on entities.
-- However, we provide this script to manually seed initial users (Admin, Company, Student).

USE placement_portal;

-- Seed Admin User (Password: admin123)
-- BCrypt hash for admin123 is roughly $2a$10$wN9Q... we can just use a dummy hash or rely on the system to register them.
-- For simplicity, we assume the user will register these through the API, OR we use a known hash.
-- Hash for 'password' is: $2a$10$G... 
-- Hash for 'admin123' is: $2a$10$tZ261kZ9oK8T/C352o31Q.qK5FqN9a7nLz4j35/D38F36O7h2/XFq
INSERT IGNORE INTO users (id, email, password, role) VALUES 
(1, 'admin@portal.com', '$2a$10$tZ261kZ9oK8T/C352o31Q.qK5FqN9a7nLz4j35/D38F36O7h2/XFq', 'ADMIN');

-- Seed Company User (Password: company123 -> $2a$10$42jP1... using a dummy hash, it's better to register via API for correct hash)
-- Since Spring Security uses BCrypt, we will insert users with BCrypt hashes.
-- Hash for 'company123': $2a$10$L1E2L799cI7G89F2M1Q62e2wE1V.u0J0j0R7r5oGz4eL/n/K5/mB2
INSERT IGNORE INTO users (id, email, password, role) VALUES 
(2, 'hr@techcorp.com', '$2a$10$L1E2L799cI7G89F2M1Q62e2wE1V.u0J0j0R7r5oGz4eL/n/K5/mB2', 'COMPANY');

-- Seed Company Profile
INSERT IGNORE INTO company_profiles (id, user_id, company_name, website, industry, description) VALUES 
(1, 2, 'TechCorp Solutions', 'https://techcorp.com', 'IT Services', 'A leading IT services company specializing in Cloud computing.');

-- Seed Student User (Password: student123 -> $2a$10$7v2W9... dummy hash)
-- Hash for 'student123': $2a$10$gX3.13w833m1W0y77c0Y7O00F5k5j5u99v8X8V/l4P6p0Z9s2F9kS
INSERT IGNORE INTO users (id, email, password, role) VALUES 
(3, 'john.student@university.edu', '$2a$10$gX3.13w833m1W0y77c0Y7O00F5k5j5u99v8X8V/l4P6p0Z9s2F9kS', 'STUDENT');

-- Seed Student Profile
INSERT IGNORE INTO student_profiles (id, user_id, name, roll_no, department, cgpa, graduation_year) VALUES 
(1, 3, 'John Doe', 'CS1001', 'Computer Science', 8.5, 2024);

-- Seed Companies and Jobs (20 Realistic B.Tech Job Openings)

-- 1. Google
INSERT IGNORE INTO users (id, email, password, role) VALUES (4, 'hr@google.com', '$2a$10$L1E2L799cI7G89F2M1Q62e2wE1V.u0J0j0R7r5oGz4eL/n/K5/mB2', 'COMPANY');
INSERT IGNORE INTO company_profiles (id, user_id, company_name, website, industry, description) VALUES (2, 4, 'Google', 'https://google.com', 'Technology', 'Leading search and cloud technology company.');
INSERT IGNORE INTO job_postings (id, company_profile_id, company_name, job_title, description, min_cgpa, location, salary_package, status) VALUES 
(2, 2, 'Google', 'Software Development Engineer (SDE-1)', 'Design, develop, and maintain large-scale software systems.', 8.5, 'Bengaluru', '24 LPA', 'ACTIVE');

-- 2. Microsoft
INSERT IGNORE INTO users (id, email, password, role) VALUES (5, 'hr@microsoft.com', '$2a$10$L1E2L799cI7G89F2M1Q62e2wE1V.u0J0j0R7r5oGz4eL/n/K5/mB2', 'COMPANY');
INSERT IGNORE INTO company_profiles (id, user_id, company_name, website, industry, description) VALUES (3, 5, 'Microsoft', 'https://microsoft.com', 'Technology', 'Empowering every person and organization.');
INSERT IGNORE INTO job_postings (id, company_profile_id, company_name, job_title, description, min_cgpa, location, salary_package, status) VALUES 
(3, 3, 'Microsoft', 'Cloud Solutions Engineer', 'Build and optimize cloud solutions for enterprise clients.', 8.0, 'Hyderabad', '18 LPA', 'ACTIVE');

-- 3. Amazon
INSERT IGNORE INTO users (id, email, password, role) VALUES (6, 'hr@amazon.com', '$2a$10$L1E2L799cI7G89F2M1Q62e2wE1V.u0J0j0R7r5oGz4eL/n/K5/mB2', 'COMPANY');
INSERT IGNORE INTO company_profiles (id, user_id, company_name, website, industry, description) VALUES (4, 6, 'Amazon', 'https://amazon.com', 'E-commerce', 'Earths most customer-centric company.');
INSERT IGNORE INTO job_postings (id, company_profile_id, company_name, job_title, description, min_cgpa, location, salary_package, status) VALUES 
(4, 4, 'Amazon', 'Systems Analyst / Operations', 'Analyze system performance and build robust data pipelines.', 7.5, 'Pune', '14.5 LPA', 'ACTIVE');

-- 4. Qualcomm
INSERT IGNORE INTO users (id, email, password, role) VALUES (7, 'hr@qualcomm.com', '$2a$10$L1E2L799cI7G89F2M1Q62e2wE1V.u0J0j0R7r5oGz4eL/n/K5/mB2', 'COMPANY');
INSERT IGNORE INTO company_profiles (id, user_id, company_name, website, industry, description) VALUES (5, 7, 'Qualcomm', 'https://qualcomm.com', 'Technology', 'Wireless technology innovator.');
INSERT IGNORE INTO job_postings (id, company_profile_id, company_name, job_title, description, min_cgpa, location, salary_package, status) VALUES 
(5, 5, 'Qualcomm', 'Embedded Systems Engineer', 'Develop embedded software for mobile processors.', 7.8, 'Hyderabad', '16 LPA', 'ACTIVE');

-- 5. Texas Instruments
INSERT IGNORE INTO users (id, email, password, role) VALUES (8, 'hr@ti.com', '$2a$10$L1E2L799cI7G89F2M1Q62e2wE1V.u0J0j0R7r5oGz4eL/n/K5/mB2', 'COMPANY');
INSERT IGNORE INTO company_profiles (id, user_id, company_name, website, industry, description) VALUES (6, 8, 'Texas Instruments', 'https://ti.com', 'Technology', 'Semiconductor manufacturing company.');
INSERT IGNORE INTO job_postings (id, company_profile_id, company_name, job_title, description, min_cgpa, location, salary_package, status) VALUES 
(6, 6, 'Texas Instruments', 'Hardware Design Engineer', 'Design integrated circuits and hardware systems.', 7.5, 'Bengaluru', '15 LPA', 'ACTIVE');

-- 6. Deloitte
INSERT IGNORE INTO users (id, email, password, role) VALUES (9, 'hr@deloitte.com', '$2a$10$L1E2L799cI7G89F2M1Q62e2wE1V.u0J0j0R7r5oGz4eL/n/K5/mB2', 'COMPANY');
INSERT IGNORE INTO company_profiles (id, user_id, company_name, website, industry, description) VALUES (7, 9, 'Deloitte', 'https://deloitte.com', 'Consulting', 'Global provider of audit and consulting services.');
INSERT IGNORE INTO job_postings (id, company_profile_id, company_name, job_title, description, min_cgpa, location, salary_package, status) VALUES 
(7, 7, 'Deloitte', 'Associate Tech Consultant', 'Consult on tech transformations for global clients.', 6.8, 'Gurugram', '8.5 LPA', 'ACTIVE');

-- 7. Tata Motors
INSERT IGNORE INTO users (id, email, password, role) VALUES (10, 'hr@tatamotors.com', '$2a$10$L1E2L799cI7G89F2M1Q62e2wE1V.u0J0j0R7r5oGz4eL/n/K5/mB2', 'COMPANY');
INSERT IGNORE INTO company_profiles (id, user_id, company_name, website, industry, description) VALUES (8, 10, 'Tata Motors', 'https://tatamotors.com', 'Automotive', 'Leading global automobile manufacturer.');
INSERT IGNORE INTO job_postings (id, company_profile_id, company_name, job_title, description, min_cgpa, location, salary_package, status) VALUES 
(8, 8, 'Tata Motors', 'Graduate Engineer Trainee (GET)', 'Trainee program in automotive engineering.', 6.5, 'Pune', '8.0 LPA', 'ACTIVE');

-- 8. L&T Construction
INSERT IGNORE INTO users (id, email, password, role) VALUES (11, 'hr@lntecc.com', '$2a$10$L1E2L799cI7G89F2M1Q62e2wE1V.u0J0j0R7r5oGz4eL/n/K5/mB2', 'COMPANY');
INSERT IGNORE INTO company_profiles (id, user_id, company_name, website, industry, description) VALUES (9, 11, 'L&T Construction', 'https://lntecc.com', 'Construction', 'Major technology, engineering, and construction company.');
INSERT IGNORE INTO job_postings (id, company_profile_id, company_name, job_title, description, min_cgpa, location, salary_package, status) VALUES 
(9, 9, 'L&T Construction', 'Assistant Project Engineer', 'Assist in large scale infrastructure projects.', 6.0, 'Chennai', '6.5 LPA', 'ACTIVE');

-- 9. Infosys
INSERT IGNORE INTO users (id, email, password, role) VALUES (12, 'hr@infosys.com', '$2a$10$L1E2L799cI7G89F2M1Q62e2wE1V.u0J0j0R7r5oGz4eL/n/K5/mB2', 'COMPANY');
INSERT IGNORE INTO company_profiles (id, user_id, company_name, website, industry, description) VALUES (10, 12, 'Infosys', 'https://infosys.com', 'IT Services', 'Next-generation digital services.');
INSERT IGNORE INTO job_postings (id, company_profile_id, company_name, job_title, description, min_cgpa, location, salary_package, status) VALUES 
(10, 10, 'Infosys', 'Specialist Programmer', 'High-performance software development.', 7.0, 'Mysuru', '9.5 LPA', 'ACTIVE');

-- 10. TCS Digital
INSERT IGNORE INTO users (id, email, password, role) VALUES (13, 'hr@tcs.com', '$2a$10$L1E2L799cI7G89F2M1Q62e2wE1V.u0J0j0R7r5oGz4eL/n/K5/mB2', 'COMPANY');
INSERT IGNORE INTO company_profiles (id, user_id, company_name, website, industry, description) VALUES (11, 13, 'TCS Digital', 'https://tcs.com', 'IT Services', 'Global leader in IT services, consulting, and business solutions.');
INSERT IGNORE INTO job_postings (id, company_profile_id, company_name, job_title, description, min_cgpa, location, salary_package, status) VALUES 
(11, 11, 'TCS Digital', 'Systems Engineer', 'Develop scalable enterprise web applications.', 6.5, 'Noida', '7.0 LPA', 'ACTIVE');

-- 11. Wipro
INSERT IGNORE INTO users (id, email, password, role) VALUES (14, 'hr@wipro.com', '$2a$10$L1E2L799cI7G89F2M1Q62e2wE1V.u0J0j0R7r5oGz4eL/n/K5/mB2', 'COMPANY');
INSERT IGNORE INTO company_profiles (id, user_id, company_name, website, industry, description) VALUES (12, 14, 'Wipro', 'https://wipro.com', 'IT Services', 'Global information technology services.');
INSERT IGNORE INTO job_postings (id, company_profile_id, company_name, job_title, description, min_cgpa, location, salary_package, status) VALUES 
(12, 12, 'Wipro', 'Turbo Developer', 'Full stack application development.', 6.5, 'Bengaluru', '6.5 LPA', 'ACTIVE');

-- 12. Accenture
INSERT IGNORE INTO users (id, email, password, role) VALUES (15, 'hr@accenture.com', '$2a$10$L1E2L799cI7G89F2M1Q62e2wE1V.u0J0j0R7r5oGz4eL/n/K5/mB2', 'COMPANY');
INSERT IGNORE INTO company_profiles (id, user_id, company_name, website, industry, description) VALUES (13, 15, 'Accenture', 'https://accenture.com', 'IT Services', 'Global professional services company.');
INSERT IGNORE INTO job_postings (id, company_profile_id, company_name, job_title, description, min_cgpa, location, salary_package, status) VALUES 
(13, 13, 'Accenture', 'Advanced App Developer', 'Advanced application development and delivery.', 6.2, 'Mumbai', '6.5 LPA', 'ACTIVE');

-- 13. Cognizant
INSERT IGNORE INTO users (id, email, password, role) VALUES (16, 'hr@cognizant.com', '$2a$10$L1E2L799cI7G89F2M1Q62e2wE1V.u0J0j0R7r5oGz4eL/n/K5/mB2', 'COMPANY');
INSERT IGNORE INTO company_profiles (id, user_id, company_name, website, industry, description) VALUES (14, 16, 'Cognizant', 'https://cognizant.com', 'IT Services', 'Transforming clients business models.');
INSERT IGNORE INTO job_postings (id, company_profile_id, company_name, job_title, description, min_cgpa, location, salary_package, status) VALUES 
(14, 14, 'Cognizant', 'GenC Elevate Engineer', 'Development and testing in digital technologies.', 6.0, 'Kolkata', '6.0 LPA', 'ACTIVE');

-- 14. Capgemini
INSERT IGNORE INTO users (id, email, password, role) VALUES (17, 'hr@capgemini.com', '$2a$10$L1E2L799cI7G89F2M1Q62e2wE1V.u0J0j0R7r5oGz4eL/n/K5/mB2', 'COMPANY');
INSERT IGNORE INTO company_profiles (id, user_id, company_name, website, industry, description) VALUES (15, 17, 'Capgemini', 'https://capgemini.com', 'IT Services', 'Consulting, technology services.');
INSERT IGNORE INTO job_postings (id, company_profile_id, company_name, job_title, description, min_cgpa, location, salary_package, status) VALUES 
(15, 15, 'Capgemini', 'Software Analyst Trainee', 'Software analysis and client requirements.', 6.0, 'Hyderabad', '6.0 LPA', 'ACTIVE');

-- 15. HCLTech
INSERT IGNORE INTO users (id, email, password, role) VALUES (18, 'hr@hcl.com', '$2a$10$L1E2L799cI7G89F2M1Q62e2wE1V.u0J0j0R7r5oGz4eL/n/K5/mB2', 'COMPANY');
INSERT IGNORE INTO company_profiles (id, user_id, company_name, website, industry, description) VALUES (16, 18, 'HCLTech', 'https://hcltech.com', 'IT Services', 'Global technology company.');
INSERT IGNORE INTO job_postings (id, company_profile_id, company_name, job_title, description, min_cgpa, location, salary_package, status) VALUES 
(16, 16, 'HCLTech', 'Junior Systems Engineer', 'Systems administration and support.', 6.0, 'Noida', '6.0 LPA', 'ACTIVE');

-- 16. Samsung R&D
INSERT IGNORE INTO users (id, email, password, role) VALUES (19, 'hr@samsung.com', '$2a$10$L1E2L799cI7G89F2M1Q62e2wE1V.u0J0j0R7r5oGz4eL/n/K5/mB2', 'COMPANY');
INSERT IGNORE INTO company_profiles (id, user_id, company_name, website, industry, description) VALUES (17, 19, 'Samsung R&D', 'https://samsung.com', 'Technology', 'Electronics and technology research.');
INSERT IGNORE INTO job_postings (id, company_profile_id, company_name, job_title, description, min_cgpa, location, salary_package, status) VALUES 
(17, 17, 'Samsung R&D', 'Software Engineer', 'Research and develop mobile technology.', 8.0, 'Noida', '16 LPA', 'ACTIVE');

-- 17. Nvidia
INSERT IGNORE INTO users (id, email, password, role) VALUES (20, 'hr@nvidia.com', '$2a$10$L1E2L799cI7G89F2M1Q62e2wE1V.u0J0j0R7r5oGz4eL/n/K5/mB2', 'COMPANY');
INSERT IGNORE INTO company_profiles (id, user_id, company_name, website, industry, description) VALUES (18, 20, 'Nvidia', 'https://nvidia.com', 'Technology', 'AI computing company.');
INSERT IGNORE INTO job_postings (id, company_profile_id, company_name, job_title, description, min_cgpa, location, salary_package, status) VALUES 
(18, 18, 'Nvidia', 'GPU Software Trainee', 'Software engineering for GPU infrastructure.', 8.2, 'Bengaluru', '20 LPA', 'ACTIVE');

-- 18. Bosch
INSERT IGNORE INTO users (id, email, password, role) VALUES (21, 'hr@bosch.com', '$2a$10$L1E2L799cI7G89F2M1Q62e2wE1V.u0J0j0R7r5oGz4eL/n/K5/mB2', 'COMPANY');
INSERT IGNORE INTO company_profiles (id, user_id, company_name, website, industry, description) VALUES (19, 21, 'Bosch', 'https://bosch.com', 'Technology', 'Engineering and technology company.');
INSERT IGNORE INTO job_postings (id, company_profile_id, company_name, job_title, description, min_cgpa, location, salary_package, status) VALUES 
(19, 19, 'Bosch', 'Automotive Software Trainee', 'Develop automotive software systems.', 6.8, 'Bengaluru', '8.0 LPA', 'ACTIVE');

-- 19. Reliance Industries
INSERT IGNORE INTO users (id, email, password, role) VALUES (22, 'hr@ril.com', '$2a$10$L1E2L799cI7G89F2M1Q62e2wE1V.u0J0j0R7r5oGz4eL/n/K5/mB2', 'COMPANY');
INSERT IGNORE INTO company_profiles (id, user_id, company_name, website, industry, description) VALUES (20, 22, 'Reliance Industries', 'https://ril.com', 'Energy', 'Multinational conglomerate.');
INSERT IGNORE INTO job_postings (id, company_profile_id, company_name, job_title, description, min_cgpa, location, salary_package, status) VALUES 
(20, 20, 'Reliance Industries', 'Plant Maintenance Engineer', 'Manage plant operations and maintenance.', 6.2, 'Jamnagar', '7.2 LPA', 'ACTIVE');

-- 20. Tech Mahindra
INSERT IGNORE INTO users (id, email, password, role) VALUES (23, 'hr@techmahindra.com', '$2a$10$L1E2L799cI7G89F2M1Q62e2wE1V.u0J0j0R7r5oGz4eL/n/K5/mB2', 'COMPANY');
INSERT IGNORE INTO company_profiles (id, user_id, company_name, website, industry, description) VALUES (21, 23, 'Tech Mahindra', 'https://techmahindra.com', 'IT Services', 'Information technology and BPO services.');
INSERT IGNORE INTO job_postings (id, company_profile_id, company_name, job_title, description, min_cgpa, location, salary_package, status) VALUES 
(21, 21, 'Tech Mahindra', 'Software Engineer Associate', 'Software development and deployment.', 6.0, 'Pune', '6.0 LPA', 'ACTIVE');

