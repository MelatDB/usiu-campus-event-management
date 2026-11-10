ALTER TABLE organizer_applications
    ADD INDEX idx_organizer_applications_student (student_id);

ALTER TABLE organizer_applications DROP INDEX uk_organizer_application_pending;

ALTER TABLE organizer_applications
    ADD COLUMN pending_key BIGINT GENERATED ALWAYS AS (CASE WHEN status = 'PENDING' THEN student_id ELSE NULL END) STORED,
    ADD UNIQUE INDEX uk_organizer_application_pending (pending_key);
