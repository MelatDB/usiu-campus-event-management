package com.usiu.campusevents.service.impl;

import com.usiu.campusevents.entity.Event;
import com.usiu.campusevents.entity.Program;
import com.usiu.campusevents.entity.Registration;
import com.usiu.campusevents.entity.User;
import com.usiu.campusevents.entity.enums.ApprovalStatus;
import com.usiu.campusevents.entity.enums.EventStatus;
import com.usiu.campusevents.entity.enums.NotificationType;
import com.usiu.campusevents.entity.enums.RegistrationStatus;
import com.usiu.campusevents.entity.enums.Role;
import com.usiu.campusevents.entity.enums.UserStatus;
import com.usiu.campusevents.repository.EventRepository;
import com.usiu.campusevents.repository.RegistrationRepository;
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
public class EventReminderScheduler {

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 */15 * * * *")
    @Transactional
    public void sendDeadlineReminders() {
        LocalDateTime now = LocalDateTime.now();
        eventRepository.findByApprovalStatusAndEventStatusAndDeadlineReminderSentFalseAndRegistrationDeadlineBetween(
                ApprovalStatus.APPROVED,
                EventStatus.PUBLISHED,
                now,
                now.plusHours(24)
        ).forEach(event -> {
            notificationService.notifyUsers(
                    matchingStudents(event),
                    "Registration deadline approaching",
                    "Registration for " + event.getTitle() + " closes soon.",
                    NotificationType.DEADLINE_REMINDER,
                    event
            );
            event.setDeadlineReminderSent(true);
        });
    }

    @Scheduled(cron = "0 */30 * * * *")
    @Transactional
    public void sendEventReminders() {
        LocalDateTime now = LocalDateTime.now();
        eventRepository.findByApprovalStatusAndEventStatusAndOneDayReminderSentFalseAndStartDateTimeBetween(
                ApprovalStatus.APPROVED,
                EventStatus.PUBLISHED,
                now.plusHours(23),
                now.plusHours(25)
        ).forEach(event -> {
            notificationService.notifyUsers(registeredStudents(event), "Event reminder", event.getTitle() + " starts in about one day.", NotificationType.EVENT_REMINDER, event);
            event.setOneDayReminderSent(true);
        });

        eventRepository.findByApprovalStatusAndEventStatusAndOneHourReminderSentFalseAndStartDateTimeBetween(
                ApprovalStatus.APPROVED,
                EventStatus.PUBLISHED,
                now,
                now.plusHours(1)
        ).forEach(event -> {
            notificationService.notifyUsers(registeredStudents(event), "Event reminder", event.getTitle() + " starts in about one hour.", NotificationType.EVENT_REMINDER, event);
            event.setOneHourReminderSent(true);
        });
    }

    private List<User> matchingStudents(Event event) {
        List<Long> programIds = event.getTargetPrograms().stream().map(Program::getId).toList();
        return userRepository.findStudentsMatchingTargets(
                Role.STUDENT,
                UserStatus.ACTIVE,
                event.getOpenToAllStudents(),
                event.getTargetSchool() == null ? null : event.getTargetSchool().getId(),
                programIds.isEmpty() ? List.of(-1L) : programIds,
                event.getTargetYearOfStudy()
        );
    }

    private List<User> registeredStudents(Event event) {
        return registrationRepository.findByEventIdAndRegistrationStatus(event.getId(), RegistrationStatus.REGISTERED)
                .stream()
                .map(Registration::getStudent)
                .toList();
    }
}
