CREATE TABLE organizer_applications (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    motivation TEXT,
    experience TEXT,
    event_idea TEXT,
    status VARCHAR(30) NOT NULL,
    rejection_reason VARCHAR(500),
    reviewed_at DATETIME(6),
    student_id BIGINT NOT NULL,
    reviewed_by BIGINT,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE organizer_application_documents (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    stored_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(150),
    file_size BIGINT NOT NULL,
    application_id BIGINT NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

ALTER TABLE organizer_applications
    ADD CONSTRAINT uk_organizer_application_pending UNIQUE (student_id, status);

ALTER TABLE organizer_applications
    ADD CONSTRAINT fk_organizer_applications_student FOREIGN KEY (student_id) REFERENCES users (id),
    ADD CONSTRAINT fk_organizer_applications_reviewer FOREIGN KEY (reviewed_by) REFERENCES users (id);

ALTER TABLE organizer_application_documents
    ADD CONSTRAINT fk_organizer_application_documents_application FOREIGN KEY (application_id) REFERENCES organizer_applications (id) ON DELETE CASCADE;
