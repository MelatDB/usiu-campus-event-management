import React, { createContext, useCallback, useContext, useState } from 'react';
import { NotificationType } from '../types';
import './Toast.css';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  title?: string;
  eventTitle?: string;
  icon?: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, title?: string, eventTitle?: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  notify: (title: string, message: string, type: NotificationType, eventTitle?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let nextId = 1;

interface NotificationStyle {
  toastType: ToastType;
  icon: string;
}

function notificationStyle(type: NotificationType): NotificationStyle {
  switch (type) {
    case 'EVENT_REMINDER':
    case 'DEADLINE_REMINDER':
      return { toastType: 'info', icon: 'fa-bell' };
    case 'EVENT_APPROVAL':
    case 'REGISTRATION_SUCCESS':
    case 'ATTENDANCE_RECORDED':
    case 'CAPACITY_REACHED':
    case 'EVENT_RECOMMENDATION':
      return { toastType: 'success', icon: 'fa-circle-check' };
    case 'EVENT_REJECTION':
    case 'EVENT_CANCELLED':
    case 'REGISTRATION_CANCELLED':
    case 'VENUE_CONFLICT':
    case 'SYSTEM_ALERT':
      return { toastType: 'warning', icon: 'fa-triangle-exclamation' };
    case 'ANNOUNCEMENT':
      return { toastType: 'info', icon: 'fa-bullhorn' };
    case 'EVENT_UPDATED':
    case 'VENUE_CHANGED':
    case 'NEW_EVENT_SUBMITTED':
    case 'ADMIN_CHANGE_REQUEST':
    default:
      return { toastType: 'info', icon: 'fa-info-circle' };
  }
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'success', title?: string, eventTitle?: string) => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, message, type, title, eventTitle }]);
      setTimeout(() => dismiss(id), title ? 8000 : 3500);
    },
    [dismiss]
  );

  const success = useCallback((message: string) => showToast(message, 'success'), [showToast]);
  const error = useCallback((message: string) => showToast(message, 'error'), [showToast]);
  const info = useCallback((message: string, title?: string) => showToast(message, 'info', title), [showToast]);
  const warning = useCallback((message: string, title?: string) => showToast(message, 'warning', title), [showToast]);

  const notify = useCallback(
    (title: string, message: string, type: NotificationType, eventTitle?: string) => {
      const style = notificationStyle(type);
      const id = nextId++;
      setToasts((prev) => [
        ...prev,
        { id, message, title, eventTitle, type: style.toastType, icon: style.icon },
      ]);
      setTimeout(() => dismiss(id), 8000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning, notify }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type} ${toast.title ? 'toast-notification' : ''}`}
            onClick={() => dismiss(toast.id)}
          >
            <span className="toast-icon">
              <i className={`fas ${toast.icon || defaultIcon(toast.type)}`}></i>
            </span>
            <span className="toast-body">
              {toast.title && <span className="toast-title">{toast.title}</span>}
              <span className="toast-message">{toast.message}</span>
              {toast.eventTitle && <span className="toast-event">{toast.eventTitle}</span>}
            </span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

function defaultIcon(type: ToastType): string {
  switch (type) {
    case 'success':
      return 'fa-check';
    case 'error':
      return 'fa-xmark';
    case 'warning':
      return 'fa-triangle-exclamation';
    case 'info':
    default:
      return 'fa-info-circle';
  }
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};
