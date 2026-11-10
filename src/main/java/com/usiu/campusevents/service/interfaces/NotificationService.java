package com.usiu.campusevents.service.interfaces;

import com.usiu.campusevents.dto.request.CampusAnnouncementRequest;
import com.usiu.campusevents.dto.response.NotificationResponse;
import com.usiu.campusevents.dto.response.PageResponse;
import com.usiu.campusevents.dto.response.UnreadCountResponse;
import com.usiu.campusevents.entity.Event;
import com.usiu.campusevents.entity.User;
import com.usiu.campusevents.entity.enums.NotificationType;
import org.springframework.data.domain.Pageable;

import java.util.Collection;

public interface NotificationService {

    NotificationResponse notifyUser(User user, String title, String message, NotificationType type, Event event);

    void notifyUsers(Collection<User> users, String title, String message, NotificationType type, Event event);

    PageResponse<NotificationResponse> myNotifications(NotificationType type, Pageable pageable);

    UnreadCountResponse unreadCount();

    NotificationResponse markAsRead(Long id);

    void markAllAsRead();

    void sendCampusAnnouncement(CampusAnnouncementRequest request);
}
