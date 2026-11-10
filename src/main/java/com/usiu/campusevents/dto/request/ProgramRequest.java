package com.usiu.campusevents.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ProgramRequest(
        @NotBlank @Size(max = 150) String programName,
        String description,
        @NotNull Long schoolId
) {
}
