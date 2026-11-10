export type Role = 'ADMINISTRATOR' | 'CLUB_ORGANIZER' | 'STUDENT';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';

export type RegistrationStatus = 'REGISTERED' | 'CANCELLED' | 'WAITLISTED';

export type AttendanceStatus = 'NOT_MARKED' | 'PRESENT' | 'ABSENT' | 'CHECKED_IN';

export type NotificationType =
  | 'EVENT_RECOMMENDATION'
  | 'REGISTRATION_SUCCESS'
  | 'REGISTRATION_CANCELLED'
  | 'DEADLINE_REMINDER'
  | 'EVENT_UPDATED'
  | 'EVENT_CANCELLED'
  | 'VENUE_CHANGED'
  | 'EVENT_REMINDER'
  | 'ATTENDANCE_RECORDED'
  | 'EVENT_APPROVAL'
  | 'EVENT_REJECTION'
  | 'CAPACITY_REACHED'
  | 'ADMIN_CHANGE_REQUEST'
  | 'NEW_EVENT_SUBMITTED'
  | 'VENUE_CONFLICT'
  | 'SYSTEM_ALERT'
  | 'ANNOUNCEMENT'
  | 'ORGANIZER_APPLICATION'
  | 'ORGANIZER_APPROVED'
  | 'ORGANIZER_REJECTED';

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface OrganizerApplicationDocument {
  id: number;
  fileName: string;
  contentType?: string | null;
  fileSize: number;
}

export interface OrganizerApplication {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  registrationNumber?: string | null;
  motivation?: string | null;
  experience?: string | null;
  eventIdea?: string | null;
  documents: OrganizerApplicationDocument[];
  status: ApplicationStatus;
  rejectionReason?: string | null;
  reviewedById?: number | null;
  reviewedByName?: string | null;
  reviewedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type ClubStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type VenueAvailabilityStatus = 'AVAILABLE' | 'UNDER_MAINTENANCE' | 'UNAVAILABLE';

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresInMs: number;
  user: User;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  registrationNumber?: string | null;
  employeeNumber?: string | null;
  email: string;
  phoneNumber?: string | null;
  role: Role;
  status: UserStatus;
  profilePhoto?: string | null;
  yearOfStudy?: number | null;
  schoolId?: number | null;
  schoolName?: string | null;
  programId?: number | null;
  programName?: string | null;
  expiresAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentRegistrationPayload {
  firstName: string;
  lastName: string;
  registrationNumber: string;
  email: string;
  password: string;
  phoneNumber?: string;
  schoolId: number;
  programId: number;
  yearOfStudy: number;
  profilePhoto?: string;
}

export interface UserPayload {
  firstName: string;
  lastName: string;
  registrationNumber?: string | null;
  employeeNumber?: string | null;
  email: string;
  password?: string | null;
  phoneNumber?: string | null;
  role: Role;
  status: UserStatus;
  profilePhoto?: string | null;
  schoolId?: number | null;
  programId?: number | null;
  yearOfStudy?: number | null;
  expiresAt?: string | null;
}

export interface Feedback {
  id: number;
  rating: number;
  comment?: string | null;
  tags: string[];
  studentId: number;
  studentName: string;
  eventId: number;
  eventTitle: string;
  createdAt?: string;
}

export interface FeedbackPayload {
  rating: number;
  comment?: string;
  tags?: string[];
}

export interface EventFeedbackSummary {
  eventId: number;
  averageRating: number;
  feedbackCount: number;
  ratingDistribution: Record<number, number>;
  feedback: Feedback[];
}

export interface FeedbackEventSummary {
  eventId: number;
  eventTitle: string;
  organizerName: string;
  averageRating: number;
  feedbackCount: number;
}

export interface School {
  id: number;
  schoolName: string;
  abbreviation: string;
  description?: string;
  programCount: number;
}

export interface SchoolPayload {
  schoolName: string;
  abbreviation: string;
  description?: string;
}

export interface Program {
  id: number;
  programName: string;
  description?: string;
  schoolId: number;
  schoolName: string;
}

export interface ProgramPayload {
  programName: string;
  description?: string;
  schoolId: number;
}

export interface Club {
  id: number;
  clubName: string;
  description?: string;
  advisorName?: string;
  logo?: string;
  createdDate?: string;
  status: ClubStatus;
}

export interface ClubPayload {
  clubName: string;
  description?: string;
  advisorName?: string;
  logo?: string;
  createdDate?: string;
  status: ClubStatus;
}

export interface Category {
  id: number;
  categoryName: string;
  description?: string;
}

export interface CategoryPayload {
  categoryName: string;
  description?: string;
}

export interface Venue {
  id: number;
  venueName: string;
  building: string;
  roomNumber?: string;
  capacity: number;
  availabilityStatus: VenueAvailabilityStatus;
}

export interface VenuePayload {
  venueName: string;
  building: string;
  roomNumber?: string;
  capacity: number;
  availabilityStatus: VenueAvailabilityStatus;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  eventImage?: string;
  startDateTime: string;
  endDateTime: string;
  registrationDeadline: string;
  maximumCapacity: number;
  currentParticipants: number;
  eventStatus: EventStatus;
  approvalStatus: ApprovalStatus;
  openToAllStudents: boolean;
  targetYearOfStudy?: number | null;
  clubId?: number | null;
  clubName?: string | null;
  organizerId: number;
  organizerName: string;
  categoryId?: number | null;
  categoryName?: string | null;
  venueId?: number | null;
  venueName?: string | null;
  targetSchoolId?: number | null;
  targetSchoolName?: string | null;
  targetProgramIds: number[];
  targetProgramNames: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface EventPayload {
  title: string;
  description: string;
  eventImage?: string;
  startDateTime: string;
  endDateTime: string;
  registrationDeadline: string;
  maximumCapacity: number;
  clubId: number | null;
  categoryId: number | null;
  venueId: number | null;
  targetSchoolId?: number | null;
  targetProgramIds?: number[];
  openToAllStudents: boolean;
  targetYearOfStudy?: number | null;
}

export interface DashboardData {
  recommendedEvents: Event[];
  upcomingEvents: Event[];
  trendingEvents: Event[];
  universityWideEvents: Event[];
  recentlyAddedEvents: Event[];
}

export interface EventSearchParams {
  title?: string;
  categoryId?: number;
  schoolId?: number;
  programId?: number;
  venueId?: number;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface Registration {
  id: number;
  registrationDate: string;
  registrationStatus: RegistrationStatus;
  attendanceStatus: AttendanceStatus;
  studentId: number;
  studentName: string;
  eventId: number;
  eventTitle: string;
  eventStartDateTime: string;
}

export interface Favorite {
  id: number;
  eventId: number;
  eventTitle: string;
  eventStartDateTime: string;
  createdAt: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  notificationType: NotificationType;
  read: boolean;
  sentAt: string;
  readAt?: string;
  eventId?: number | null;
  eventTitle?: string | null;
}

export interface Attendance {
  id: number;
  checkInTime: string;
  attendanceStatus: AttendanceStatus;
  registrationId: number;
  studentId: number;
  studentName: string;
  eventId: number;
  eventTitle: string;
}

export interface Announcement {
  id: number;
  title: string;
  message: string;
  postedDate: string;
  eventId: number;
  eventTitle: string;
}

export interface AnnouncementPayload {
  eventId: number;
  title: string;
  message: string;
}

export interface AnalyticsData {
  totalUsers: number;
  totalStudents: number;
  totalOrganizers: number;
  totalEvents: number;
  pendingEvents: number;
  publishedEvents: number;
  activeRegistrations: number;
}

export interface CampusAnnouncementPayload {
  title: string;
  message: string;
}
