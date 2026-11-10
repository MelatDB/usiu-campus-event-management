package com.usiu.campusevents.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record FeedbackResponse(
        Long id,
        Integer rating,
        String comment,
        List<String> tags,
        Long studentId,
        String studentName,
        Long eventId,
        String eventTitle,
        LocalDateTime createdAt
) {
}
