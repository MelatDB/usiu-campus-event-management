CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_status ON users (status);
CREATE INDEX idx_users_school ON users (school_id);
CREATE INDEX idx_users_program ON users (program_id);

CREATE INDEX idx_programs_school ON programs (school_id);

CREATE INDEX idx_events_title ON events (title);
CREATE INDEX idx_events_start_date_time ON events (start_date_time);
CREATE INDEX idx_events_registration_deadline ON events (registration_deadline);
CREATE INDEX idx_events_status_approval ON events (event_status, approval_status);
CREATE INDEX idx_events_category ON events (category_id);
CREATE INDEX idx_events_venue ON events (venue_id);
CREATE INDEX idx_events_target_school ON events (target_school_id);
CREATE INDEX idx_events_open_to_all ON events (open_to_all_students);
CREATE INDEX idx_events_organizer ON events (organizer_id);
CREATE INDEX idx_events_created_at ON events (created_at);

CREATE INDEX idx_event_program_targets_program ON event_program_targets (program_id);

CREATE INDEX idx_registrations_student ON registrations (student_id);
CREATE INDEX idx_registrations_event ON registrations (event_id);
CREATE INDEX idx_registrations_status ON registrations (registration_status);

CREATE INDEX idx_announcements_event ON announcements (event_id);

CREATE INDEX idx_notifications_user_read ON notifications (user_id, is_read);
CREATE INDEX idx_notifications_user_type ON notifications (user_id, notification_type);
CREATE INDEX idx_notifications_sent_at ON notifications (sent_at);

CREATE INDEX idx_favorite_events_student ON favorite_events (student_id);
CREATE INDEX idx_favorite_events_event ON favorite_events (event_id);
