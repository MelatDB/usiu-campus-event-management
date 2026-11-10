package com.usiu.campusevents.dto.response;

import com.usiu.campusevents.entity.enums.ClubStatus;

import java.time.LocalDate;

public record ClubResponse(
        Long id,
        String clubName,
        String description,
        String advisorName,
        String logo,
        LocalDate createdDate,
        ClubStatus status
) {
}
