package com.usiu.campusevents.dto.response;

import com.usiu.campusevents.entity.enums.AttendanceStatus;
import com.usiu.campusevents.entity.enums.RegistrationStatus;

import java.time.LocalDateTime;

public record RegistrationResponse(
        Long id,
        LocalDateTime registrationDate,
        RegistrationStatus registrationStatus,
        AttendanceStatus attendanceStatus,
        Long studentId,
        String studentName,
        Long eventId,
        String eventTitle,
        LocalDateTime eventStartDateTime
) {
}
