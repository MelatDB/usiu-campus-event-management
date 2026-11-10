package com.usiu.campusevents.dto.request;

import jakarta.validation.constraints.NotBlank;

public record OrganizerDecisionRequest(
        @NotBlank(message = "Reason is required") String reason
) {
}
