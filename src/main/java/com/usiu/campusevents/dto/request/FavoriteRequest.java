package com.usiu.campusevents.dto.request;

import jakarta.validation.constraints.NotNull;

public record FavoriteRequest(
        @NotNull Long eventId
) {
}
