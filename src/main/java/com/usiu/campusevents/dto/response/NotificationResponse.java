package com.usiu.campusevents.dto.response;

import com.usiu.campusevents.entity.enums.NotificationType;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        String title,
        String message,
        NotificationType notificationType,
        Boolean read,
        LocalDateTime sentAt,
        LocalDateTime readAt,
        Long eventId,
        String eventTitle
) {
}
