import axios from 'axios';
import {
  Announcement,
  AnnouncementPayload,
  Attendance,
  AttendanceStatus,
  AuthResponse,
  AnalyticsData,
  ApplicationStatus,
  CampusAnnouncementPayload,
  Category,
  CategoryPayload,
  Club,
  ClubPayload,
  DashboardData,
  Event,
  EventPayload,
  EventSearchParams,
  EventFeedbackSummary,
  Favorite,
  Feedback,
  FeedbackEventSummary,
  FeedbackPayload,
  Notification,
  NotificationType,
  OrganizerApplication,
  PageResponse,
  Program,
  ProgramPayload,
  Registration,
  School,
  SchoolPayload,
  StudentRegistrationPayload,
  User,
  UserPayload,
  Venue,
  VenuePayload,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error: any, fallback: string): string {
  const data = error?.response?.data;
  if (data?.validationErrors && typeof data.validationErrors === 'object') {
    const details = Object.values(data.validationErrors)
      .filter((v) => v)
      .join('; ');
    return `${data.message || fallback}${details ? `: ${details}` : ''}`;
  }
  return data?.message || error?.message || fallback;
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },
  register: async (data: StudentRegistrationPayload): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.post('/auth/change-password', { currentPassword, newPassword });
  },
};

export const eventService = {
  getDashboard: async (): Promise<DashboardData> => {
    const response = await api.get<DashboardData>('/events/dashboard');
    return response.data;
  },

  getAll: async (params: EventSearchParams = {}): Promise<PageResponse<Event>> => {
    const response = await api.get<PageResponse<Event>>('/events', {
      params: { page: 0, size: 12, sort: 'startDateTime,asc', ...params },
    });
    return response.data;
  },

  getById: async (id: number): Promise<Event> => {
    const response = await api.get<Event>(`/events/${id}`);
    return response.data;
  },

  getOrganizerEvents: async (params: EventSearchParams = {}): Promise<PageResponse<Event>> => {
    const response = await api.get<PageResponse<Event>>('/events/organizer', {
      params: { page: 0, size: 20, sort: 'startDateTime,asc', ...params },
    });
    return response.data;
  },

  create: async (data: EventPayload): Promise<Event> => {
    const response = await api.post<Event>('/events', data);
    return response.data;
  },

  update: async (id: number, data: EventPayload): Promise<Event> => {
    const response = await api.put<Event>(`/events/${id}`, data);
    return response.data;
  },

  approve: async (id: number): Promise<Event> => {
    const response = await api.post<Event>(`/events/${id}/approve`);
    return response.data;
  },

  reject: async (id: number, reason: string): Promise<Event> => {
    const response = await api.post<Event>(`/events/${id}/reject`, { reason });
    return response.data;
  },

  cancel: async (id: number, reason?: string): Promise<Event> => {
    const response = await api.post<Event>(`/events/${id}/cancel`, reason ? { reason } : undefined);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/events/${id}`);
  },
};

export const registrationService = {
  register: async (eventId: number): Promise<Registration> => {
    const response = await api.post<Registration>('/registrations', { eventId });
    return response.data;
  },

  cancel: async (id: number): Promise<Registration> => {
    const response = await api.post<Registration>(`/registrations/${id}/cancel`);
    return response.data;
  },

  getById: async (id: number): Promise<Registration> => {
    const response = await api.get<Registration>(`/registrations/${id}`);
    return response.data;
  },

  getMyRegistrations: async (params: EventSearchParams = {}): Promise<PageResponse<Registration>> => {
    const response = await api.get<PageResponse<Registration>>('/registrations/mine', {
      params: { page: 0, size: 20, sort: 'registrationDate,desc', ...params },
    });
    return response.data;
  },

  getEventRegistrations: async (eventId: number, params: EventSearchParams = {}): Promise<PageResponse<Registration>> => {
    const response = await api.get<PageResponse<Registration>>(`/registrations/events/${eventId}`, {
      params: { page: 0, size: 100, sort: 'registrationDate,asc', ...params },
    });
    return response.data;
  },

  downloadTicket: async (id: number): Promise<Blob> => {
    const response = await api.get(`/registrations/${id}/ticket`, { responseType: 'blob' });
    return response.data;
  },
};

export const favoriteService = {
  getAll: async (params: EventSearchParams = {}): Promise<PageResponse<Favorite>> => {
    const response = await api.get<PageResponse<Favorite>>('/favorites', {
      params: { page: 0, size: 20, ...params },
    });
    return response.data;
  },

  add: async (eventId: number): Promise<Favorite> => {
    const response = await api.post<Favorite>('/favorites', { eventId });
    return response.data;
  },

  remove: async (eventId: number): Promise<void> => {
    await api.delete(`/favorites/events/${eventId}`);
  },
};

export const notificationService = {
  getAll: async (params: EventSearchParams & { type?: NotificationType } = {}): Promise<PageResponse<Notification>> => {
    const response = await api.get<PageResponse<Notification>>('/notifications', {
      params: { page: 0, size: 20, sort: 'sentAt,desc', ...params },
    });
    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<{ unreadCount: number }>('/notifications/unread-count');
    return response.data.unreadCount;
  },

  markAsRead: async (id: number): Promise<Notification> => {
    const response = await api.patch<Notification>(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  },

  sendCampusAnnouncement: async (data: CampusAnnouncementPayload): Promise<void> => {
    await api.post('/notifications/campus-announcements', data);
  },
};

export const userService = {
  getById: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  getAll: async (params: EventSearchParams & { role?: string } = {}): Promise<PageResponse<User>> => {
    const response = await api.get<PageResponse<User>>('/users', {
      params: { page: 0, size: 20, ...params },
    });
    return response.data;
  },

  create: async (data: UserPayload): Promise<User> => {
    const response = await api.post<User>('/users', data);
    return response.data;
  },

  update: async (id: number, data: UserPayload): Promise<User> => {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

export const feedbackService = {
  submit: async (eventId: number, data: FeedbackPayload): Promise<Feedback> => {
    const response = await api.post<Feedback>(`/feedback/events/${eventId}`, data);
    return response.data;
  },

  getEventSummary: async (eventId: number): Promise<EventFeedbackSummary> => {
    const response = await api.get<EventFeedbackSummary>(`/feedback/events/${eventId}`);
    return response.data;
  },

  getEvents: async (): Promise<FeedbackEventSummary[]> => {
    const response = await api.get<FeedbackEventSummary[]>('/feedback/events');
    return response.data;
  },

  getMine: async (): Promise<Feedback[]> => {
    const response = await api.get<Feedback[]>('/feedback/mine');
    return response.data;
  },

  getPending: async (): Promise<Event[]> => {
    const response = await api.get<Event[]>('/feedback/pending');
    return response.data;
  },
};

export const schoolService = {
  getAll: async (params: EventSearchParams = {}): Promise<PageResponse<School>> => {
    const response = await api.get<PageResponse<School>>('/schools', { params });
    return response.data;
  },
  create: async (data: SchoolPayload): Promise<School> => {
    const response = await api.post<School>('/schools', data);
    return response.data;
  },
  update: async (id: number, data: SchoolPayload): Promise<School> => {
    const response = await api.put<School>(`/schools/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/schools/${id}`);
  },
};

export const programService = {
  getAll: async (params: EventSearchParams & { schoolId?: number } = {}): Promise<PageResponse<Program>> => {
    const response = await api.get<PageResponse<Program>>('/programs', { params });
    return response.data;
  },
  create: async (data: ProgramPayload): Promise<Program> => {
    const response = await api.post<Program>('/programs', data);
    return response.data;
  },
  update: async (id: number, data: ProgramPayload): Promise<Program> => {
    const response = await api.put<Program>(`/programs/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/programs/${id}`);
  },
};

export const clubService = {
  getAll: async (params: EventSearchParams = {}): Promise<PageResponse<Club>> => {
    const response = await api.get<PageResponse<Club>>('/clubs', { params });
    return response.data;
  },
  create: async (data: ClubPayload): Promise<Club> => {
    const response = await api.post<Club>('/clubs', data);
    return response.data;
  },
  update: async (id: number, data: ClubPayload): Promise<Club> => {
    const response = await api.put<Club>(`/clubs/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/clubs/${id}`);
  },
};

export const categoryService = {
  getAll: async (params: EventSearchParams = {}): Promise<PageResponse<Category>> => {
    const response = await api.get<PageResponse<Category>>('/categories', { params });
    return response.data;
  },
  create: async (data: CategoryPayload): Promise<Category> => {
    const response = await api.post<Category>('/categories', data);
    return response.data;
  },
  update: async (id: number, data: CategoryPayload): Promise<Category> => {
    const response = await api.put<Category>(`/categories/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};

export const venueService = {
  getAll: async (params: EventSearchParams = {}): Promise<PageResponse<Venue>> => {
    const response = await api.get<PageResponse<Venue>>('/venues', { params });
    return response.data;
  },
  create: async (data: VenuePayload): Promise<Venue> => {
    const response = await api.post<Venue>('/venues', data);
    return response.data;
  },
  update: async (id: number, data: VenuePayload): Promise<Venue> => {
    const response = await api.put<Venue>(`/venues/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/venues/${id}`);
  },
};

export const analyticsService = {
  getOverview: async (): Promise<AnalyticsData> => {
    const response = await api.get<AnalyticsData>('/analytics/overview');
    return response.data;
  },
};

export const attendanceService = {
  record: async (registrationId: number, attendanceStatus: AttendanceStatus): Promise<Attendance> => {
    const response = await api.post<Attendance>('/attendance', { registrationId, attendanceStatus });
    return response.data;
  },

  getById: async (id: number): Promise<Attendance> => {
    const response = await api.get<Attendance>(`/attendance/${id}`);
    return response.data;
  },

  getAll: async (params: EventSearchParams = {}): Promise<PageResponse<Attendance>> => {
    const response = await api.get<PageResponse<Attendance>>('/attendance', {
      params: { page: 0, size: 20, ...params },
    });
    return response.data;
  },
};

export const announcementService = {
  getByEvent: async (eventId: number): Promise<PageResponse<Announcement>> => {
    const response = await api.get<PageResponse<Announcement>>('/announcements', {
      params: { eventId, page: 0, size: 20 },
    });
    return response.data;
  },

  getById: async (id: number): Promise<Announcement> => {
    const response = await api.get<Announcement>(`/announcements/${id}`);
    return response.data;
  },

  create: async (data: AnnouncementPayload): Promise<Announcement> => {
    const response = await api.post<Announcement>('/announcements', data);
    return response.data;
  },

  update: async (id: number, data: AnnouncementPayload): Promise<Announcement> => {
    const response = await api.put<Announcement>(`/announcements/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/announcements/${id}`);
  },
};

export const organizerApplicationService = {
  apply: async (
    fields: { motivation?: string; experience?: string; eventIdea?: string },
    documents: File[]
  ): Promise<OrganizerApplication> => {
    const formData = new FormData();
    if (fields.motivation) formData.append('motivation', fields.motivation);
    if (fields.experience) formData.append('experience', fields.experience);
    if (fields.eventIdea) formData.append('eventIdea', fields.eventIdea);
    documents.forEach((file) => formData.append('documents', file));
    const response = await api.post<OrganizerApplication>('/organizer-applications', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getMine: async (params: EventSearchParams = {}): Promise<PageResponse<OrganizerApplication>> => {
    const response = await api.get<PageResponse<OrganizerApplication>>('/organizer-applications/mine', {
      params: { page: 0, size: 10, sort: 'createdAt,desc', ...params },
    });
    return response.data;
  },

  getAll: async (params: EventSearchParams & { status?: ApplicationStatus } = {}): Promise<PageResponse<OrganizerApplication>> => {
    const response = await api.get<PageResponse<OrganizerApplication>>('/organizer-applications', {
      params: { page: 0, size: 100, sort: 'createdAt,desc', ...params },
    });
    return response.data;
  },

  approve: async (id: number, message?: string): Promise<OrganizerApplication> => {
    const response = await api.post<OrganizerApplication>(
      `/organizer-applications/${id}/approve`,
      { message: message ?? '' }
    );
    return response.data;
  },

  reject: async (id: number, reason: string): Promise<OrganizerApplication> => {
    const response = await api.post<OrganizerApplication>(`/organizer-applications/${id}/reject`, { reason });
    return response.data;
  },

  downloadDocument: async (applicationId: number, documentId: number): Promise<Blob> => {
    const response = await api.get(`/organizer-applications/${applicationId}/documents/${documentId}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default api;
