# USIU-Africa Campus Event Management System

A full-stack campus event management platform for USIU-Africa. Students discover and register for events, club organizers create and manage them, and administrators approve events, manage campus reference data, and track engagement.

![Event ticket preview](ticket-preview.png)

## Features

### Students
- Browse and search approved events with filters
- Personalized dashboard: recommended, upcoming, trending, university-wide, and recently added events
- Register for events, with capacity, deadline, and duplicate-registration checks
- Save favorites and manage a personal watchlist
- Download/view an event ticket after registering
- Track registrations and attendance
- Submit feedback after attending
- Receive in-app (WebSocket) and optional email notifications

### Club Organizers
- Create and edit event drafts
- Submit events for administrator approval
- View registrations for their events
- Record and bulk-record attendance
- Post announcements for their events
- Apply to become an organizer and upload supporting documents

### Administrators
- Approve, reject, and cancel events
- Review organizer applications and documents
- Manage schools, programs, venues, categories, clubs, and users
- Publish campus-wide announcements
- View analytics and engagement summaries

## Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | Java 21, Spring Boot 4.1.0, Spring MVC |
| Persistence | Spring Data JPA / Hibernate, MySQL 8+ |
| Migrations | Flyway |
| Security | Spring Security, JWT (jjwt) |
| Real-time | Spring WebSocket (STOMP) |
| Email | Spring Mail |
| API docs | Springdoc OpenAPI / Swagger UI |
| Frontend | React 19, TypeScript, Vite, React Router, Axios, STOMP/SockJS |
| Legacy frontend | Vanilla HTML, CSS, JavaScript |

## Project Structure

```text
.
├── src
│   ├── main
│   │   ├── java/com/usiu/campusevents
│   │   │   ├── config          # OpenAPI and demo seeding configuration
│   │   │   ├── controller      # REST endpoints
│   │   │   ├── dto             # Request/response models
│   │   │   ├── entity          # JPA entities and enums
│   │   │   ├── exception       # Custom exceptions and global handler
│   │   │   ├── mapper          # Entity-to-DTO mapping
│   │   │   ├── repository      # Spring Data repositories
│   │   │   ├── security        # JWT filter, security config, principals
│   │   │   ├── service         # Business logic (interfaces + implementations)
│   │   │   ├── util            # Ticket generation and security helpers
│   │   │   ├── validation      # Custom event schedule validation
│   │   │   └── websocket       # STOMP notification publishing
│   │   └── resources
│   │       ├── application.properties
│   │       └── db/migration    # Flyway SQL migrations
│   └── test                    # Backend tests
├── frontend-react              # Current React + TypeScript SPA
├── frontend                    # Legacy vanilla JS frontend
├── docs                        # ERD, UML, API examples, database schema
├── images                      # Branding assets
└── pom.xml
```

## Getting Started

### Prerequisites

- JDK 21
- Maven 3.9+
- MySQL 8+
- Node.js 20+ (for the React frontend)

### 1. Database

```sql
CREATE DATABASE IF NOT EXISTS usiu_events
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Flyway creates the schema and seed data automatically on first startup.

### 2. Environment variables

The application reads configuration from environment variables (defaults are in `src/main/resources/application.properties`):

```bash
DB_URL=jdbc:mysql://localhost:3306/usiu_events?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Africa/Nairobi
DB_USERNAME=root
DB_PASSWORD=your-password
JWT_SECRET=<base64-encoded-256-bit-or-larger-secret>
EMAIL_NOTIFICATIONS_ENABLED=false
```

### 3. Backend

```bash
mvn spring-boot:run
```

- API base URL: `http://localhost:8080/api/v1`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

### 4. React frontend

```bash
cd frontend-react
npm install
npm start
```

The app runs at `http://localhost:3000`.

### 5. Legacy frontend (optional)

```bash
cd frontend
python -m http.server 3000
```

## Demo Accounts

| Role | Email | Password |
| --- | --- | --- |
| Administrator | `admin@usiu.ac.ke` | `Admin@12345` |
| Club Organizer | `amina.organizer@usiu.ac.ke` | `Organizer@12345` |
| Club Organizer | `brian.organizer@usiu.ac.ke` | `Organizer@12345` |
| Student | `melat.desta@student.usiu.ac.ke` | `Student@12345` |
| Student | `kevin.njoroge@student.usiu.ac.ke` | `Student@12345` |

> Demo passwords are stored with a `{noop}` prefix in the seed migration and upgraded to BCrypt on first startup. Change them before deploying to production.

## API and Real-time Notifications

- REST endpoints are documented in Swagger UI and in [`docs/API_EXAMPLES.md`](docs/API_EXAMPLES.md).
- WebSocket STOMP endpoint: `/ws/notifications`
- Per-user notification topic: `/topic/users/{userId}/notifications`

## Database Migrations

Migrations live in `src/main/resources/db/migration`:

- `V1__Create_tables.sql`
- `V2__Create_constraints.sql`
- `V3__Insert_seed_data.sql`
- `V4__Create_indexes.sql`
- `V5__Create_organizer_applications.sql`
- `V6__Fix_organizer_applications_unique.sql`
- `V7__Add_organizer_expiry_and_event_feedback.sql`

Hibernate runs with `spring.jpa.hibernate.ddl-auto=validate`, so schema changes must be made through new Flyway migrations.

## Documentation

- [Entity relationship diagram](docs/ERD.md)
- [UML class diagram](docs/UML.md)
- [API examples](docs/API_EXAMPLES.md)
- [Database schema](docs/DATABASE_SCHEMA.md)

Additional setup and development notes are available in `SETUP_GUIDE.md`, `LAUNCH_GUIDE.md`, `QUICK_START.md`, and `CONTINUE_DEVELOPMENT.md`.

## Project Status

The backend is feature-complete for the workflows above. The React frontend implements the student, organizer, and administrator pages, with additional polish tracked in `CONTINUE_DEVELOPMENT.md` and `REACT_PROGRESS.md`.

## License

This project is licensed under the [MIT License](LICENSE).
