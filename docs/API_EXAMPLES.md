# API Examples

Base URL:

```text
http://localhost:8080/api/v1
```

## Student Registration

```http
POST /api/v1/auth/register
Content-Type: application/json
```

```json
{
  "firstName": "Melat",
  "lastName": "Desta",
  "registrationNumber": "SST-2026-099",
  "email": "melat99@student.usiu.ac.ke",
  "password": "Student@12345",
  "phoneNumber": "+254700000099",
  "schoolId": 1,
  "programId": 1,
  "yearOfStudy": 2,
  "profilePhoto": null
}
```

## Login

```http
POST /api/v1/auth/login
Content-Type: application/json
```

```json
{
  "email": "admin@usiu.ac.ke",
  "password": "Admin@12345"
}
```

Use the returned token as:

```text
Authorization: Bearer <accessToken>
```

## Create Event

```http
POST /api/v1/events
Authorization: Bearer <organizer-token>
Content-Type: application/json
```

```json
{
  "title": "Cloud Native Workshop",
  "description": "Hands-on Kubernetes and Spring Boot deployment workshop.",
  "eventImage": null,
  "startDateTime": "2026-09-12T09:00:00",
  "endDateTime": "2026-09-12T12:00:00",
  "registrationDeadline": "2026-09-10T17:00:00",
  "maximumCapacity": 70,
  "clubId": 1,
  "categoryId": 3,
  "venueId": 1,
  "targetSchoolId": 1,
  "targetProgramIds": [1, 2, 6],
  "openToAllStudents": false,
  "targetYearOfStudy": 2
}
```

## Approve Event

```http
POST /api/v1/events/100/approve
Authorization: Bearer <admin-token>
Content-Type: application/json
```

```json
{
  "reason": "Approved for publication."
}
```

## Search Events

```http
GET /api/v1/events?title=workshop&categoryId=3&schoolId=1&page=0&size=10&sort=startDateTime,asc
```

## Student Dashboard

```http
GET /api/v1/events/dashboard
Authorization: Bearer <student-token>
```

Returns:

- `recommendedEvents`
- `upcomingEvents`
- `trendingEvents`
- `universityWideEvents`
- `recentlyAddedEvents`

## Register For Event

```http
POST /api/v1/registrations
Authorization: Bearer <student-token>
Content-Type: application/json
```

```json
{
  "eventId": 1
}
```

## Download Ticket

```http
GET /api/v1/registrations/1/ticket
Authorization: Bearer <student-token>
```

## Notification History

```http
GET /api/v1/notifications?type=EVENT_RECOMMENDATION&page=0&size=20
Authorization: Bearer <token>
```

## WebSocket

Connect to:

```text
/ws/notifications
```

Subscribe to:

```text
/topic/users/{userId}/notifications
```
