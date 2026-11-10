-- Organizer account expiry
ALTER TABLE users
    ADD COLUMN expires_at DATETIME(6) NULL AFTER year_of_study;

-- Default 1-year expiry for existing organizers
UPDATE users
SET expires_at = DATE_ADD(COALESCE(created_at, NOW()), INTERVAL 1 YEAR)
WHERE role = 'CLUB_ORGANIZER' AND expires_at IS NULL;

-- Track whether attendees were asked for feedback when an event completes
ALTER TABLE events
    ADD COLUMN completion_notified BIT(1) NOT NULL DEFAULT 0 AFTER one_hour_reminder_sent;

-- Event feedback from students who attended an event
CREATE TABLE event_feedback (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    student_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE event_feedback_tags (
    feedback_id BIGINT NOT NULL,
    tag VARCHAR(60) NOT NULL,
    PRIMARY KEY (feedback_id, tag)
) ENGINE=InnoDB;

ALTER TABLE event_feedback
    ADD CONSTRAINT uk_event_feedback_student_event UNIQUE (student_id, event_id),
    ADD CONSTRAINT fk_event_feedback_student FOREIGN KEY (student_id) REFERENCES users (id),
    ADD CONSTRAINT fk_event_feedback_event FOREIGN KEY (event_id) REFERENCES events (id);

ALTER TABLE event_feedback_tags
    ADD CONSTRAINT fk_event_feedback_tags_feedback FOREIGN KEY (feedback_id) REFERENCES event_feedback (id) ON DELETE CASCADE;
