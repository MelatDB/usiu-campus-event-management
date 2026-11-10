package com.usiu.campusevents.dto.request;

import jakarta.validation.constraints.Size;

public record EventDecisionRequest(
        @Size(max = 500) String reason
) {
}
