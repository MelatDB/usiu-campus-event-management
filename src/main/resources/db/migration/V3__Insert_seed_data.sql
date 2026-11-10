INSERT INTO schools (id, created_at, updated_at, school_name, abbreviation, description) VALUES
(1, NOW(6), NOW(6), 'School of Science and Technology', 'SST', 'Technology, computing, and applied sciences.'),
(2, NOW(6), NOW(6), 'Chandaria School of Business', 'CSB', 'Business, finance, marketing, and management programs.'),
(3, NOW(6), NOW(6), 'School of Humanities and Social Sciences', 'SHSS', 'Humanities, social sciences, and justice programs.'),
(4, NOW(6), NOW(6), 'School of Pharmacy and Health Sciences', 'SPHS', 'Health sciences, public health, and pharmacy programs.'),
(5, NOW(6), NOW(6), 'School of Communication, Cinematic and Creative Arts', 'SCCCA', 'Media, film, animation, and communication programs.');

INSERT INTO programs (id, created_at, updated_at, program_name, description, school_id) VALUES
(1, NOW(6), NOW(6), 'Software Engineering', 'Software design, architecture, testing, and delivery.', 1),
(2, NOW(6), NOW(6), 'Computer Science', 'Computing theory, algorithms, systems, and software.', 1),
(3, NOW(6), NOW(6), 'Information Systems and Technology', 'Enterprise information systems and IT management.', 1),
(4, NOW(6), NOW(6), 'Applied Computer Technology', 'Applied computing and technology practice.', 1),
(5, NOW(6), NOW(6), 'Data Science', 'Data analytics, machine learning, and statistical computing.', 1),
(6, NOW(6), NOW(6), 'Cybersecurity', 'Cyber defense, risk, and secure systems.', 1),
(7, NOW(6), NOW(6), 'Accounting', 'Accounting, audit, and reporting.', 2),
(8, NOW(6), NOW(6), 'Finance', 'Finance, investment, and banking.', 2),
(9, NOW(6), NOW(6), 'Marketing', 'Marketing strategy, consumer behavior, and brand management.', 2),
(10, NOW(6), NOW(6), 'International Business Administration', 'International business leadership and operations.', 2),
(11, NOW(6), NOW(6), 'Procurement and Supply Chain Management', 'Procurement, logistics, and supply networks.', 2),
(12, NOW(6), NOW(6), 'International Relations', 'Diplomacy, policy, and international affairs.', 3),
(13, NOW(6), NOW(6), 'Psychology', 'Behavioral science and mental health foundations.', 3),
(14, NOW(6), NOW(6), 'Sociology', 'Social structures, institutions, and culture.', 3),
(15, NOW(6), NOW(6), 'Criminal Justice', 'Justice systems, security, and criminology.', 3),
(16, NOW(6), NOW(6), 'Pharmacy', 'Pharmaceutical science and clinical pharmacy.', 4),
(17, NOW(6), NOW(6), 'Public Health', 'Population health and health promotion.', 4),
(18, NOW(6), NOW(6), 'Epidemiology', 'Disease patterns, surveillance, and public health research.', 4),
(19, NOW(6), NOW(6), 'Journalism', 'News gathering, reporting, and media production.', 5),
(20, NOW(6), NOW(6), 'Film Production', 'Film production, directing, and editing.', 5),
(21, NOW(6), NOW(6), 'Animation', '2D and 3D animation production.', 5),
(22, NOW(6), NOW(6), 'Communication Studies', 'Communication theory, public relations, and media studies.', 5);

INSERT INTO users (id, created_at, updated_at, first_name, last_name, registration_number, employee_number, email, password, phone_number, role, status, profile_photo, year_of_study, school_id, program_id) VALUES
(1, NOW(6), NOW(6), 'System', 'Administrator', NULL, 'EMP-ADMIN-001', 'admin@usiu.ac.ke', '{noop}Admin@12345', '+254700000001', 'ADMINISTRATOR', 'ACTIVE', NULL, NULL, NULL, NULL),
(2, NOW(6), NOW(6), 'Amina', 'Otieno', NULL, 'EMP-ORG-001', 'amina.organizer@usiu.ac.ke', '{noop}Organizer@12345', '+254700000002', 'CLUB_ORGANIZER', 'ACTIVE', NULL, NULL, 1, NULL),
(3, NOW(6), NOW(6), 'Brian', 'Mwangi', NULL, 'EMP-ORG-002', 'brian.organizer@usiu.ac.ke', '{noop}Organizer@12345', '+254700000003', 'CLUB_ORGANIZER', 'ACTIVE', NULL, NULL, 2, NULL),
(4, NOW(6), NOW(6), 'Melat', 'Desta', 'SST-2026-001', NULL, 'melat.desta@student.usiu.ac.ke', '{noop}Student@12345', '+254700000004', 'STUDENT', 'ACTIVE', NULL, 2, 1, 1),
(5, NOW(6), NOW(6), 'Kevin', 'Njoroge', 'SST-2026-002', NULL, 'kevin.njoroge@student.usiu.ac.ke', '{noop}Student@12345', '+254700000005', 'STUDENT', 'ACTIVE', NULL, 3, 1, 6),
(6, NOW(6), NOW(6), 'Grace', 'Wambui', 'CSB-2026-001', NULL, 'grace.wambui@student.usiu.ac.ke', '{noop}Student@12345', '+254700000006', 'STUDENT', 'ACTIVE', NULL, 2, 2, 8),
(7, NOW(6), NOW(6), 'David', 'Mutiso', 'SHSS-2026-001', NULL, 'david.mutiso@student.usiu.ac.ke', '{noop}Student@12345', '+254700000007', 'STUDENT', 'ACTIVE', NULL, 4, 3, 12),
(8, NOW(6), NOW(6), 'Sarah', 'Kimani', 'SPHS-2026-001', NULL, 'sarah.kimani@student.usiu.ac.ke', '{noop}Student@12345', '+254700000008', 'STUDENT', 'ACTIVE', NULL, 1, 4, 17);

INSERT INTO student_clubs (id, created_at, updated_at, club_name, description, advisor_name, logo, created_date, status) VALUES
(1, NOW(6), NOW(6), 'USIU Tech Club', 'Student community for technology, software, cybersecurity, and innovation.', 'Dr. Alice Muthoni', NULL, '2017-02-01', 'ACTIVE'),
(2, NOW(6), NOW(6), 'Business Leadership Club', 'Business networking, leadership, and entrepreneurship club.', 'Mr. Peter Kamau', NULL, '2015-09-10', 'ACTIVE'),
(3, NOW(6), NOW(6), 'Career Services Club', 'Career readiness, employer engagement, and mentorship.', 'Ms. Jane Akinyi', NULL, '2014-04-15', 'ACTIVE'),
(4, NOW(6), NOW(6), 'Cultural Diversity Club', 'Cultural events and student community celebrations.', 'Ms. Miriam Hassan', NULL, '2018-07-20', 'ACTIVE');

INSERT INTO event_categories (id, created_at, updated_at, category_name, description) VALUES
(1, NOW(6), NOW(6), 'Technology', 'Technology showcases, talks, and meetups.'),
(2, NOW(6), NOW(6), 'Sports', 'Sports events and tournaments.'),
(3, NOW(6), NOW(6), 'Workshop', 'Hands-on learning sessions.'),
(4, NOW(6), NOW(6), 'Seminar', 'Academic and professional seminars.'),
(5, NOW(6), NOW(6), 'Career Fair', 'Career and employer engagement events.'),
(6, NOW(6), NOW(6), 'Cultural', 'Cultural experiences and celebrations.'),
(7, NOW(6), NOW(6), 'Health', 'Health and wellness events.'),
(8, NOW(6), NOW(6), 'Entertainment', 'Entertainment and student-life events.'),
(9, NOW(6), NOW(6), 'Community Service', 'Service and outreach events.'),
(10, NOW(6), NOW(6), 'Competition', 'Competitions and student challenges.');

INSERT INTO venues (id, created_at, updated_at, venue_name, building, room_number, capacity, availability_status) VALUES
(1, NOW(6), NOW(6), 'Innovation Lab', 'Science Center', 'LAB-01', 90, 'AVAILABLE'),
(2, NOW(6), NOW(6), 'Auditorium', 'Freida Brown Student Center', 'AUD-01', 500, 'AVAILABLE'),
(3, NOW(6), NOW(6), 'Chandaria Hall', 'Chandaria School of Business', 'HALL-02', 300, 'AVAILABLE'),
(4, NOW(6), NOW(6), 'Health Sciences Lecture Theatre', 'Pharmacy Block', 'LT-01', 160, 'AVAILABLE'),
(5, NOW(6), NOW(6), 'Creative Studio', 'SCCCA Building', 'ST-03', 80, 'AVAILABLE');

INSERT INTO events (id, created_at, updated_at, title, description, event_image, start_date_time, end_date_time, registration_deadline, maximum_capacity, current_participants, event_status, approval_status, open_to_all_students, target_year_of_study, deadline_reminder_sent, one_day_reminder_sent, one_hour_reminder_sent, version, club_id, organizer_id, category_id, venue_id, target_school_id) VALUES
(1, NOW(6), NOW(6), 'AI and Cybersecurity Workshop', 'Hands-on workshop on secure AI systems, threat modeling, and responsible deployment.', NULL, DATE_ADD(NOW(6), INTERVAL 14 DAY), DATE_ADD(DATE_ADD(NOW(6), INTERVAL 14 DAY), INTERVAL 3 HOUR), DATE_ADD(NOW(6), INTERVAL 10 DAY), 80, 2, 'PUBLISHED', 'APPROVED', b'0', 2, b'0', b'0', b'0', 0, 1, 2, 3, 1, 1),
(2, NOW(6), NOW(6), 'USIU-Africa Career Fair', 'University-wide employer networking, internships, and graduate opportunities.', NULL, DATE_ADD(NOW(6), INTERVAL 21 DAY), DATE_ADD(DATE_ADD(NOW(6), INTERVAL 21 DAY), INTERVAL 6 HOUR), DATE_ADD(NOW(6), INTERVAL 18 DAY), 500, 1, 'PUBLISHED', 'APPROVED', b'1', NULL, b'0', b'0', b'0', 0, 3, 3, 5, 2, NULL),
(3, NOW(6), NOW(6), 'Public Health Awareness Seminar', 'A seminar on student wellness, epidemiology, and preventive public health.', NULL, DATE_ADD(NOW(6), INTERVAL 18 DAY), DATE_ADD(DATE_ADD(NOW(6), INTERVAL 18 DAY), INTERVAL 2 HOUR), DATE_ADD(NOW(6), INTERVAL 15 DAY), 120, 0, 'DRAFT', 'PENDING', b'0', NULL, b'0', b'0', b'0', 0, 1, 2, 7, 4, 4),
(4, NOW(6), NOW(6), 'Cultural Night', 'A university-wide evening celebrating food, music, performance, and student culture.', NULL, DATE_ADD(NOW(6), INTERVAL 30 DAY), DATE_ADD(DATE_ADD(NOW(6), INTERVAL 30 DAY), INTERVAL 4 HOUR), DATE_ADD(NOW(6), INTERVAL 25 DAY), 300, 0, 'PUBLISHED', 'APPROVED', b'1', NULL, b'0', b'0', b'0', 0, 4, 3, 6, 3, NULL);

INSERT INTO event_program_targets (event_id, program_id) VALUES
(1, 1),
(1, 6),
(3, 16),
(3, 17),
(3, 18);

INSERT INTO registrations (id, created_at, updated_at, registration_date, registration_status, attendance_status, student_id, event_id) VALUES
(1, NOW(6), NOW(6), NOW(6), 'REGISTERED', 'NOT_MARKED', 4, 1),
(2, NOW(6), NOW(6), NOW(6), 'REGISTERED', 'NOT_MARKED', 5, 1),
(3, NOW(6), NOW(6), NOW(6), 'REGISTERED', 'NOT_MARKED', 6, 2);

INSERT INTO favorite_events (id, created_at, updated_at, student_id, event_id) VALUES
(1, NOW(6), NOW(6), 4, 1),
(2, NOW(6), NOW(6), 6, 2);

INSERT INTO announcements (id, created_at, updated_at, title, message, posted_date, event_id) VALUES
(1, NOW(6), NOW(6), 'Bring your laptop', 'Participants should bring a laptop with Java and Python installed.', NOW(6), 1);

INSERT INTO notifications (id, created_at, updated_at, title, message, notification_type, is_read, sent_at, read_at, user_id, event_id) VALUES
(1, NOW(6), NOW(6), 'Recommended event: AI and Cybersecurity Workshop', 'A campus event matching your profile is open for registration.', 'EVENT_RECOMMENDATION', b'0', NOW(6), NULL, 4, 1),
(2, NOW(6), NOW(6), 'Registration successful', 'You are registered for AI and Cybersecurity Workshop.', 'REGISTRATION_SUCCESS', b'0', NOW(6), NULL, 4, 1);

ALTER TABLE schools AUTO_INCREMENT = 100;
ALTER TABLE programs AUTO_INCREMENT = 100;
ALTER TABLE users AUTO_INCREMENT = 100;
ALTER TABLE student_clubs AUTO_INCREMENT = 100;
ALTER TABLE event_categories AUTO_INCREMENT = 100;
ALTER TABLE venues AUTO_INCREMENT = 100;
ALTER TABLE events AUTO_INCREMENT = 100;
ALTER TABLE registrations AUTO_INCREMENT = 100;
ALTER TABLE favorite_events AUTO_INCREMENT = 100;
ALTER TABLE announcements AUTO_INCREMENT = 100;
ALTER TABLE notifications AUTO_INCREMENT = 100;
