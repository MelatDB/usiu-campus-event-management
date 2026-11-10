package com.usiu.campusevents.dto.request;

import jakarta.validation.constraints.NotNull;

public record RegistrationRequest(
        @NotNull Long eventId
) {
}
