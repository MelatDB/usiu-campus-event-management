package com.usiu.campusevents.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SchoolRequest(
        @NotBlank @Size(max = 150) String schoolName,
        @NotBlank @Size(max = 20) String abbreviation,
        String description
) {
}
