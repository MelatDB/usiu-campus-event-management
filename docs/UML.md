# UML Class Diagram

```mermaid
classDiagram
    class AuditableEntity {
        Long id
        LocalDateTime createdAt
        LocalDateTime updatedAt
    }

    class User {
        String firstName
        String lastName
        String registrationNumber
        String employeeNumber
        String email
        String password
        Role role
        UserStatus status
        Integer yearOfStudy
    }

    class School {
        String schoolName
        String abbreviation
        String description
    }

    class Program {
        String programName
        String description
    }

    class StudentClub {
        String clubName
        String advisorName
        ClubStatus status
    }

    class Event {
        String title
        LocalDateTime startDateTime
        LocalDateTime endDateTime
        Integer maximumCapacity
        Integer currentParticipants
        EventStatus eventStatus
        ApprovalStatus approvalStatus
        Boolean openToAllStudents
        Integer targetYearOfStudy
    }

    class Registration {
        LocalDateTime registrationDate
        RegistrationStatus registrationStatus
        AttendanceStatus attendanceStatus
    }

    class Attendance {
        LocalDateTime checkInTime
        AttendanceStatus attendanceStatus
    }

    class Notification {
        String title
        String message
        NotificationType notificationType
        Boolean read
    }

    AuditableEntity <|-- User
    AuditableEntity <|-- School
    AuditableEntity <|-- Program
    AuditableEntity <|-- StudentClub
    AuditableEntity <|-- Event
    AuditableEntity <|-- Registration
    AuditableEntity <|-- Attendance
    AuditableEntity <|-- Notification

    School "1" --> "*" Program
    School "1" --> "*" User
    Program "1" --> "*" User
    User "1" --> "*" Event : organizer
    StudentClub "1" --> "*" Event
    Event "1" --> "*" Registration
    User "1" --> "*" Registration : student
    Registration "1" --> "1" Attendance
    Event "*" --> "*" Program : targets
    User "1" --> "*" Notification
```

Service layer contracts:

- `AuthService`
- `UserManagementService`
- `CatalogService`
- `EventService`
- `RegistrationService`
- `AttendanceService`
- `AnnouncementService`
- `NotificationService`
- `FavoriteService`
- `AnalyticsService`
