package com.usiu.campusevents.dto.response;

import java.time.LocalDateTime;

public record FavoriteResponse(
        Long id,
        Long eventId,
        String eventTitle,
        LocalDateTime eventStartDateTime,
        LocalDateTime createdAt
) {
}
