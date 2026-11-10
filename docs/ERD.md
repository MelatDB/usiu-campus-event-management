# Entity Relationship Diagram

```mermaid
erDiagram
    SCHOOLS ||--o{ PROGRAMS : has
    SCHOOLS ||--o{ USERS : contains_students
    SCHOOLS ||--o{ EVENTS : targets
    PROGRAMS ||--o{ USERS : contains_students
    PROGRAMS }o--o{ EVENTS : targeted_by
    STUDENT_CLUBS ||--o{ EVENTS : organizes
    USERS ||--o{ EVENTS : organizes
    EVENT_CATEGORIES ||--o{ EVENTS : categorizes
    VENUES ||--o{ EVENTS : hosts
    USERS ||--o{ REGISTRATIONS : registers
    EVENTS ||--o{ REGISTRATIONS : receives
    REGISTRATIONS ||--o| ATTENDANCE : records
    EVENTS ||--o{ ANNOUNCEMENTS : has
    USERS ||--o{ NOTIFICATIONS : receives
    EVENTS ||--o{ NOTIFICATIONS : triggers
    USERS ||--o{ FAVORITE_EVENTS : saves
    EVENTS ||--o{ FAVORITE_EVENTS : saved_as

    SCHOOLS {
        bigint id PK
        varchar school_name UK
        varchar abbreviation UK
        text description
        datetime created_at
        datetime updated_at
    }

    PROGRAMS {
        bigint id PK
        varchar program_name
        text description
        bigint school_id FK
        datetime created_at
        datetime updated_at
    }

    USERS {
        bigint id PK
        varchar first_name
        varchar last_name
        varchar registration_number UK
        varchar employee_number UK
        varchar email UK
        varchar password
        varchar phone_number
        varchar role
        varchar status
        varchar profile_photo
        int year_of_study
        bigint school_id FK
        bigint program_id FK
        datetime created_at
        datetime updated_at
    }

    EVENTS {
        bigint id PK
        varchar title
        text description
        varchar event_image
        datetime start_date_time
        datetime end_date_time
        datetime registration_deadline
        int maximum_capacity
        int current_participants
        varchar event_status
        varchar approval_status
        boolean open_to_all_students
        int target_year_of_study
        bigint club_id FK
        bigint organizer_id FK
        bigint category_id FK
        bigint venue_id FK
        bigint target_school_id FK
        datetime created_at
        datetime updated_at
    }

    REGISTRATIONS {
        bigint id PK
        datetime registration_date
        varchar registration_status
        varchar attendance_status
        bigint student_id FK
        bigint event_id FK
    }
```

Key constraints:

- `program_name + school_id` is unique.
- `student_id + event_id` is unique in registrations.
- `student_id + event_id` is unique in favorites.
- `event_id + program_id` is the composite key for event program targets.
- Venue conflicts are enforced in service logic using overlapping event windows.
