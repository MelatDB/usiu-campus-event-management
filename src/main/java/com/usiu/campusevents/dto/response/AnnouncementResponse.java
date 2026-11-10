package com.usiu.campusevents.dto.response;

import java.time.LocalDateTime;

public record AnnouncementResponse(
        Long id,
        String title,
        String message,
        LocalDateTime postedDate,
        Long eventId,
        String eventTitle
) {
}
