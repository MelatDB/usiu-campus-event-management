package com.usiu.campusevents.dto.request;

import com.usiu.campusevents.entity.enums.AttendanceStatus;
import jakarta.validation.constraints.NotNull;

public record AttendanceRequest(
        @NotNull Long registrationId,
        @NotNull AttendanceStatus attendanceStatus
) {
}
