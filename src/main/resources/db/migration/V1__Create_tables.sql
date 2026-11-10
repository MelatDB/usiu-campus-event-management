CREATE TABLE schools (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    school_name VARCHAR(150) NOT NULL,
    abbreviation VARCHAR(20) NOT NULL,
    description TEXT,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE programs (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    program_name VARCHAR(150) NOT NULL,
    description TEXT,
    school_id BIGINT NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    first_name VARCHAR(80) NOT NULL,
    last_name VARCHAR(80) NOT NULL,
    registration_number VARCHAR(50),
    employee_number VARCHAR(50),
    email VARCHAR(150) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(30),
    role VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL,
    profile_photo VARCHAR(255),
    year_of_study INT,
    school_id BIGINT,
    program_id BIGINT,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE student_clubs (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    club_name VARCHAR(150) NOT NULL,
    description TEXT,
    advisor_name VARCHAR(150),
    logo VARCHAR(255),
    created_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE event_categories (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE venues (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    venue_name VARCHAR(150) NOT NULL,
    building VARCHAR(100) NOT NULL,
    room_number VARCHAR(50),
    capacity INT NOT NULL,
    availability_status VARCHAR(40) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE events (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    event_image VARCHAR(255),
    start_date_time DATETIME(6) NOT NULL,
    end_date_time DATETIME(6) NOT NULL,
    registration_deadline DATETIME(6) NOT NULL,
    maximum_capacity INT NOT NULL,
    current_participants INT NOT NULL,
    event_status VARCHAR(30) NOT NULL,
    approval_status VARCHAR(30) NOT NULL,
    open_to_all_students BIT(1) NOT NULL,
    target_year_of_study INT,
    deadline_reminder_sent BIT(1) NOT NULL,
    one_day_reminder_sent BIT(1) NOT NULL,
    one_hour_reminder_sent BIT(1) NOT NULL,
    version BIGINT,
    club_id BIGINT NOT NULL,
    organizer_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    venue_id BIGINT NOT NULL,
    target_school_id BIGINT,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE event_program_targets (
    event_id BIGINT NOT NULL,
    program_id BIGINT NOT NULL
) ENGINE=InnoDB;

CREATE TABLE registrations (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    registration_date DATETIME(6) NOT NULL,
    registration_status VARCHAR(30) NOT NULL,
    attendance_status VARCHAR(30) NOT NULL,
    student_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE attendance (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    check_in_time DATETIME(6) NOT NULL,
    attendance_status VARCHAR(30) NOT NULL,
    registration_id BIGINT NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE announcements (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    posted_date DATETIME(6) NOT NULL,
    event_id BIGINT NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE notifications (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    is_read BIT(1) NOT NULL,
    sent_at DATETIME(6) NOT NULL,
    read_at DATETIME(6),
    user_id BIGINT NOT NULL,
    event_id BIGINT,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE favorite_events (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    student_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB;
