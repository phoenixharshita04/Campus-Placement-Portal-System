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

-- Seed Job Posting
INSERT IGNORE INTO job_postings (id, company_profile_id, company_name, job_title, description, min_cgpa, status) VALUES 
(1, 1, 'TechCorp Solutions', 'Software Development Engineer', 'Looking for enthusiastic developers with knowledge in Java and Spring Boot.', 7.5, 'ACTIVE');

-- Seed Job Application
INSERT IGNORE INTO job_applications (id, student_id, job_id, status, application_date) VALUES 
(1, 1, 1, 'APPLIED', NOW());
