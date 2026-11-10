package com.usiu.campusevents.dto.response;

public record FeedbackEventSummaryResponse(
        Long eventId,
        String eventTitle,
        String organizerName,
        double averageRating,
        long feedbackCount
) {
}
