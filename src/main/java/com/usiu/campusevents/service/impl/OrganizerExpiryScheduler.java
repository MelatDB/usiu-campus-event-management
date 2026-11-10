package com.usiu.campusevents.service.impl;

import com.usiu.campusevents.entity.User;
import com.usiu.campusevents.entity.enums.NotificationType;
import com.usiu.campusevents.entity.enums.Role;
import com.usiu.campusevents.entity.enums.UserStatus;
import com.usiu.campusevents.repository.UserRepository;
import com.usiu.campusevents.service.interfaces.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class OrganizerExpiryScheduler {

    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 5 * * * *")
    @Transactional
    public void expireOverdueOrganizers() {
        List<User> expired = userRepository.findByRoleAndExpiresAtBeforeAndStatus(
                Role.CLUB_ORGANIZER,
                LocalDateTime.now(),
                UserStatus.ACTIVE
        );
        expired.forEach(organizer -> {
            organizer.setStatus(UserStatus.INACTIVE);
            notificationService.notifyUser(
                    organizer,
                    "Organizer account expired",
                    "Your club organizer account expired on " + organizer.getExpiresAt().toLocalDate()
                            + ". Contact an administrator to renew it.",
                    NotificationType.SYSTEM_ALERT,
                    null
            );
        });
    }
}
