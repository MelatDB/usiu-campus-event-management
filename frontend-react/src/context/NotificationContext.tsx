import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Notification, NotificationType } from '../types';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WEBSOCKET_URL =
  import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws/notifications';

const POPUP_TYPES = new Set<NotificationType>([
  'EVENT_RECOMMENDATION',
  'DEADLINE_REMINDER',
  'EVENT_UPDATED',
  'EVENT_CANCELLED',
  'VENUE_CHANGED',
  'EVENT_REMINDER',
  'EVENT_APPROVAL',
  'EVENT_REJECTION',
  'CAPACITY_REACHED',
  'ADMIN_CHANGE_REQUEST',
  'NEW_EVENT_SUBMITTED',
  'VENUE_CONFLICT',
  'SYSTEM_ALERT',
  'ANNOUNCEMENT',
  'ORGANIZER_APPLICATION',
  'ORGANIZER_APPROVED',
  'ORGANIZER_REJECTED',
]);

interface NotificationSocketValue {
  connected: boolean;
}

const NotificationSocketContext = createContext<NotificationSocketValue>({ connected: false });

export const useNotificationSocket = () => useContext(NotificationSocketContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, refreshUnreadCount } = useAuth();
  const { notify } = useToast();
  const clientRef = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WEBSOCKET_URL) as WebSocket,
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        client.subscribe(`/topic/users/${user.id}/notifications`, (message: IMessage) => {
          try {
            const notification: Notification = JSON.parse(message.body);
            refreshUnreadCount();
            if (POPUP_TYPES.has(notification.notificationType)) {
              notify(
                notification.title,
                notification.message,
                notification.notificationType,
                notification.eventTitle ?? undefined
              );
            }
          } catch (error) {
            console.error('Failed to process notification message:', error);
          }
        });
      },
      onDisconnect: () => setConnected(false),
      onWebSocketClose: () => setConnected(false),
      onStompError: (frame) => {
        console.error('Notification STOMP error:', frame.headers.message || frame.body);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      setConnected(false);
      client.deactivate();
      clientRef.current = null;
    };
  }, [isAuthenticated, user?.id, refreshUnreadCount, notify]);

  return (
    <NotificationSocketContext.Provider value={{ connected }}>
      {children}
    </NotificationSocketContext.Provider>
  );
};
