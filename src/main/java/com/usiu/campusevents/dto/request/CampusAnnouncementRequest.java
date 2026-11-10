package com.usiu.campusevents.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CampusAnnouncementRequest(
        @NotBlank @Size(max = 200) String title,
        @NotBlank String message
) {
}
