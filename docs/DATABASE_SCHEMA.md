# Database Schema Notes

The schema is normalized to third normal form:

- Schools and programs are separate entities; programs belong to one school.
- Users reference school and program instead of duplicating academic metadata.
- Events reference organizer, club, category, venue, and optional target school.
- Program targeting uses the join table `event_program_targets`.
- Registrations are unique by student and event.
- Attendance is one-to-one with registration.
- Notifications belong to users and may optionally reference an event.
- Favorites are unique by student and event.

## Frequently Queried Columns

Indexes are included for:

- Event search by title, category, venue, target school, status, date, and created time.
- User lookup by role, status, school, and program.
- Registration lookup by student, event, and status.
- Notification history by user, read state, type, and sent time.

## Business Rules Enforced In Services

- Students cannot register twice for the same event.
- Registration closes after the configured deadline.
- Capacity cannot exceed event or venue limits.
- Event end time must be after start time.
- Events require administrator approval before publication.
- Organizers can only modify their own events.
- Attendance can only be recorded for registered students.
- Venue conflicts are detected with interval-overlap checks.
