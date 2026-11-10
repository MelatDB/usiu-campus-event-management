package com.usiu.campusevents.dto.request;

import com.usiu.campusevents.entity.enums.ClubStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ClubRequest(
        @NotBlank @Size(max = 150) String clubName,
        String description,
        @Size(max = 150) String advisorName,
        String logo,
        LocalDate createdDate,
        @NotNull ClubStatus status
) {
}
