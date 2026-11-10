ALTER TABLE schools
    ADD CONSTRAINT uk_schools_school_name UNIQUE (school_name),
    ADD CONSTRAINT uk_schools_abbreviation UNIQUE (abbreviation);

ALTER TABLE programs
    ADD CONSTRAINT uk_program_school UNIQUE (program_name, school_id),
    ADD CONSTRAINT fk_program_school FOREIGN KEY (school_id) REFERENCES schools (id);

ALTER TABLE users
    ADD CONSTRAINT uk_users_email UNIQUE (email),
    ADD CONSTRAINT uk_users_registration_number UNIQUE (registration_number),
    ADD CONSTRAINT uk_users_employee_number UNIQUE (employee_number),
    ADD CONSTRAINT fk_users_school FOREIGN KEY (school_id) REFERENCES schools (id),
    ADD CONSTRAINT fk_users_program FOREIGN KEY (program_id) REFERENCES programs (id);

ALTER TABLE student_clubs
    ADD CONSTRAINT uk_student_clubs_club_name UNIQUE (club_name);

ALTER TABLE event_categories
    ADD CONSTRAINT uk_event_categories_category_name UNIQUE (category_name);

ALTER TABLE venues
    ADD CONSTRAINT uk_venue_location UNIQUE (building, room_number);

ALTER TABLE events
    ADD CONSTRAINT fk_events_club FOREIGN KEY (club_id) REFERENCES student_clubs (id),
    ADD CONSTRAINT fk_events_organizer FOREIGN KEY (organizer_id) REFERENCES users (id),
    ADD CONSTRAINT fk_events_category FOREIGN KEY (category_id) REFERENCES event_categories (id),
    ADD CONSTRAINT fk_events_venue FOREIGN KEY (venue_id) REFERENCES venues (id),
    ADD CONSTRAINT fk_events_target_school FOREIGN KEY (target_school_id) REFERENCES schools (id);

ALTER TABLE event_program_targets
    ADD CONSTRAINT pk_event_program_targets PRIMARY KEY (event_id, program_id),
    ADD CONSTRAINT fk_event_program_targets_event FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_event_program_targets_program FOREIGN KEY (program_id) REFERENCES programs (id) ON DELETE CASCADE;

ALTER TABLE registrations
    ADD CONSTRAINT uk_registration_student_event UNIQUE (student_id, event_id),
    ADD CONSTRAINT fk_registrations_student FOREIGN KEY (student_id) REFERENCES users (id),
    ADD CONSTRAINT fk_registrations_event FOREIGN KEY (event_id) REFERENCES events (id);

ALTER TABLE attendance
    ADD CONSTRAINT uk_attendance_registration UNIQUE (registration_id),
    ADD CONSTRAINT fk_attendance_registration FOREIGN KEY (registration_id) REFERENCES registrations (id);

ALTER TABLE announcements
    ADD CONSTRAINT fk_announcements_event FOREIGN KEY (event_id) REFERENCES events (id);

ALTER TABLE notifications
    ADD CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id),
    ADD CONSTRAINT fk_notifications_event FOREIGN KEY (event_id) REFERENCES events (id);

ALTER TABLE favorite_events
    ADD CONSTRAINT uk_favorite_student_event UNIQUE (student_id, event_id),
    ADD CONSTRAINT fk_favorite_events_student FOREIGN KEY (student_id) REFERENCES users (id),
    ADD CONSTRAINT fk_favorite_events_event FOREIGN KEY (event_id) REFERENCES events (id);
