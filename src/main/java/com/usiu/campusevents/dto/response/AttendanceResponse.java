package com.usiu.campusevents.dto.response;

import com.usiu.campusevents.entity.enums.AttendanceStatus;

import java.time.LocalDateTime;

public record AttendanceResponse(
        Long id,
        LocalDateTime checkInTime,
        AttendanceStatus attendanceStatus,
        Long registrationId,
        Long studentId,
        String studentName,
        Long eventId,
        String eventTitle
) {
}
