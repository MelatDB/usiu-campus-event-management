package com.usiu.campusevents.service.impl;

import com.usiu.campusevents.dto.request.CampusAnnouncementRequest;
import com.usiu.campusevents.dto.response.NotificationResponse;
import com.usiu.campusevents.dto.response.PageResponse;
import com.usiu.campusevents.dto.response.UnreadCountResponse;
import com.usiu.campusevents.entity.Event;
import com.usiu.campusevents.entity.Notification;
import com.usiu.campusevents.entity.User;
import com.usiu.campusevents.entity.enums.NotificationType;
import com.usiu.campusevents.entity.enums.Role;
import com.usiu.campusevents.entity.enums.UserStatus;
import com.usiu.campusevents.exception.ResourceNotFoundException;
import com.usiu.campusevents.exception.UnauthorizedActionException;
import com.usiu.campusevents.mapper.CampusMapper;
import com.usiu.campusevents.repository.NotificationRepository;
import com.usiu.campusevents.repository.UserRepository;
import com.usiu.campusevents.service.interfaces.NotificationService;
import com.usiu.campusevents.util.SecurityUtils;
import com.usiu.campusevents.websocket.NotificationRealtimePublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collection;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final CampusMapper mapper;
    private final JavaMailSender mailSender;
    private final NotificationRealtimePublisher realtimePublisher;

    @Value("${app.notifications.email-enabled:false}")
    private boolean emailEnabled;

    @Override
    @Transactional
    public NotificationResponse notifyUser(User user, String title, String message, NotificationType type, Event event) {
        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .notificationType(type)
                .read(false)
                .sentAt(LocalDateTime.now())
                .user(user)
                .event(event)
                .build();
        Notification saved = notificationRepository.save(notification);
        NotificationResponse response = mapper.toNotificationResponse(saved);
        realtimePublisher.publish(user.getId(), response);
        sendEmailIfEnabled(user, title, message);
        return response;
    }

    @Override
    @Transactional
    public void notifyUsers(Collection<User> users, String title, String message, NotificationType type, Event event) {
        users.forEach(user -> notifyUser(user, title, message, type, event));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> myNotifications(NotificationType type, Pageable pageable) {
        Long userId = SecurityUtils.currentUserId();
        return PageResponse.from((type == null
                ? notificationRepository.findByUserIdOrderBySentAtDesc(userId, pageable)
                : notificationRepository.findByUserIdAndNotificationTypeOrderBySentAtDesc(userId, type, pageable))
                .map(mapper::toNotificationResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public UnreadCountResponse unreadCount() {
        return new UnreadCountResponse(notificationRepository.countByUserIdAndReadFalse(SecurityUtils.currentUserId()));
    }

    @Override
    @Transactional
    public NotificationResponse markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", id));
        if (!notification.getUser().getId().equals(SecurityUtils.currentUserId()) && !SecurityUtils.hasRole(Role.ADMINISTRATOR)) {
            throw new UnauthorizedActionException("You can only mark your own notifications as read");
        }
        notification.setRead(true);
        notification.setReadAt(LocalDateTime.now());
        return mapper.toNotificationResponse(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        Long userId = SecurityUtils.currentUserId();
        notificationRepository.findByUserIdAndReadFalse(userId).forEach(notification -> {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
        });
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public void sendCampusAnnouncement(CampusAnnouncementRequest request) {
        notifyUsers(
                userRepository.findByStatus(UserStatus.ACTIVE),
                request.title(),
                request.message(),
                NotificationType.ANNOUNCEMENT,
                null
        );
    }

    private void sendEmailIfEnabled(User user, String title, String body) {
        if (!emailEnabled || user.getEmail() == null || user.getEmail().isBlank()) {
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setSubject(title);
            message.setText(body);
            mailSender.send(message);
        } catch (MailException ex) {
            log.warn("Email notification failed for user {}", user.getId(), ex);
        }
    }
}
