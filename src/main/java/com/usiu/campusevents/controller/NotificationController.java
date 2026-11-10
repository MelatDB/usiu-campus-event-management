package com.usiu.campusevents.controller;

import com.usiu.campusevents.dto.request.CampusAnnouncementRequest;
import com.usiu.campusevents.dto.response.NotificationResponse;
import com.usiu.campusevents.dto.response.PageResponse;
import com.usiu.campusevents.dto.response.UnreadCountResponse;
import com.usiu.campusevents.entity.enums.NotificationType;
import com.usiu.campusevents.service.interfaces.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public PageResponse<NotificationResponse> history(@RequestParam(required = false) NotificationType type, Pageable pageable) {
        return notificationService.myNotifications(type, pageable);
    }

    @GetMapping("/unread-count")
    public UnreadCountResponse unreadCount() {
        return notificationService.unreadCount();
    }

    @PatchMapping("/{id}/read")
    public NotificationResponse markAsRead(@PathVariable Long id) {
        return notificationService.markAsRead(id);
    }

    @PatchMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAllAsRead() {
        notificationService.markAllAsRead();
    }

    @PostMapping("/campus-announcements")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void sendCampusAnnouncement(@Valid @RequestBody CampusAnnouncementRequest request) {
        notificationService.sendCampusAnnouncement(request);
    }
}
