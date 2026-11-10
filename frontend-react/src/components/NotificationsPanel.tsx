import React, { useState, useEffect, useCallback } from 'react';
import { Notification, NotificationType } from '../types';
import { notificationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './NotificationsPanel.css';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const TYPES: Array<{ value: NotificationType | ''; label: string }> = [
  { value: '', label: 'All Types' },
  { value: 'EVENT_RECOMMENDATION', label: 'Recommendations' },
  { value: 'REGISTRATION_SUCCESS', label: 'Registrations' },
  { value: 'EVENT_REMINDER', label: 'Reminders' },
  { value: 'EVENT_UPDATED', label: 'Updates' },
  { value: 'EVENT_APPROVAL', label: 'Approvals' },
  { value: 'EVENT_REJECTION', label: 'Rejections' },
  { value: 'EVENT_CANCELLED', label: 'Cancellations' },
  { value: 'ATTENDANCE_RECORDED', label: 'Attendance' },
  { value: 'ANNOUNCEMENT', label: 'Announcements' },
  { value: 'DEADLINE_REMINDER', label: 'Deadlines' },
  { value: 'NEW_EVENT_SUBMITTED', label: 'Submissions' },
  { value: 'VENUE_CONFLICT', label: 'Venue Conflicts' },
  { value: 'SYSTEM_ALERT', label: 'System Alerts' },
  { value: 'ORGANIZER_APPLICATION', label: 'Organizer Applications' },
  { value: 'ORGANIZER_APPROVED', label: 'Organizer Approved' },
  { value: 'ORGANIZER_REJECTED', label: 'Organizer Rejected' },
];

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose }) => {
  const { refreshUnreadCount } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<NotificationType | ''>('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [marking, setMarking] = useState<number | null>(null);

  const loadNotifications = useCallback(async (typeFilter: NotificationType | '', pageNum: number) => {
    setLoading(true);
    try {
      const data = await notificationService.getAll({
        page: pageNum,
        size: 15,
        type: typeFilter || undefined,
      });
      setNotifications(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadNotifications(type, page);
    }
  }, [isOpen, type, page, loadNotifications]);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setType(e.target.value as NotificationType | '');
    setPage(0);
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      refreshUnreadCount();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleMarkRead = async (id: number) => {
    setMarking(id);
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      refreshUnreadCount();
    } catch (error) {
      console.error('Error marking as read:', error);
    } finally {
      setMarking(null);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const getTypeLabel = (t: NotificationType) => {
    const found = TYPES.find((item) => item.value === t);
    return found ? found.label : t.toLowerCase().replace(/_/g, ' ');
  };

  const getTypeClass = (t: NotificationType) => {
    if (t.startsWith('EVENT') || t === 'NEW_EVENT_SUBMITTED') return 'type-event';
    if (t.startsWith('REGISTRATION')) return 'type-registration';
    if (t.includes('REMINDER')) return 'type-reminder';
    if (t === 'ATTENDANCE_RECORDED') return 'type-attendance';
    if (t === 'VENUE_CONFLICT' || t === 'SYSTEM_ALERT') return 'type-alert';
    if (t === 'ANNOUNCEMENT') return 'type-announcement';
    if (t === 'EVENT_APPROVAL' || t === 'EVENT_REJECTION' || t.startsWith('ORGANIZER')) return 'type-approval';
    return 'type-event';
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
    if (seconds < 604800) return Math.floor(seconds / 86400) + 'd ago';
    return date.toLocaleDateString();
  };

  return (
    <div className={`notif-panel ${isOpen ? 'open' : ''}`}>
      <div className="notif-header">
        <div>
          <h3>Notifications</h3>
          <span className="notif-subtitle">Stay up to date with campus events</span>
        </div>
        <button className="close-panel" onClick={handleClose} aria-label="Close">
          Close
        </button>
      </div>

      <div className="notif-toolbar">
        <select value={type} onChange={handleTypeChange} className="notif-filter">
          {TYPES.map((item) => (
            <option key={item.value || 'all'} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <button
          className="btn btn-cream btn-sm"
          onClick={handleMarkAllRead}
          disabled={notifications.length === 0}
        >
          Mark all read
        </button>
      </div>

      <div className="notif-body">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <h3>No Notifications</h3>
            <p>You're all caught up!</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notif-item ${notification.read ? '' : 'unread'}`}
              onClick={() => !notification.read && handleMarkRead(notification.id)}
            >
              <div className="notif-item-top">
                <span className={`notif-type ${getTypeClass(notification.notificationType)}`}>
                  {getTypeLabel(notification.notificationType)}
                </span>
                <span className="notif-time">{getTimeAgo(notification.sentAt)}</span>
              </div>
              <div className="notif-title">
                {notification.read ? (
                  notification.title
                ) : (
                  <>
                    <span className="unread-dot"></span>
                    {notification.title}
                  </>
                )}
              </div>
              <div className="notif-message">{notification.message}</div>
              {notification.eventTitle && (
                <div className="notif-event">{notification.eventTitle}</div>
              )}
              {marking === notification.id && <div className="notif-marking">Marking read...</div>}
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="notif-footer">
          <button
            className="btn btn-cream btn-sm"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            Prev
          </button>
          <span>
            Page {page + 1} of {totalPages}
          </span>
          <button
            className="btn btn-cream btn-sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;
