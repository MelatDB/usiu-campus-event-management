package com.usiu.campusevents.controller;

import com.usiu.campusevents.service.impl.EventReminderScheduler;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/dev/reminders")
public class DevReminderController {

    private final EventReminderScheduler eventReminderScheduler;

    @PostMapping("/deadlines")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public String runDeadlineReminders() {
        eventReminderScheduler.sendDeadlineReminders();
        return "Deadline reminders processed";
    }

    @PostMapping("/events")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public String runEventReminders() {
        eventReminderScheduler.sendEventReminders();
        return "Event reminders processed";
    }
}
