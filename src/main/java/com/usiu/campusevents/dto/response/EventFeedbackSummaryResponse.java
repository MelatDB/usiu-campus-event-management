package com.usiu.campusevents.dto.response;

import java.util.List;
import java.util.Map;

public record EventFeedbackSummaryResponse(
        Long eventId,
        double averageRating,
        long feedbackCount,
        Map<Integer, Long> ratingDistribution,
        List<FeedbackResponse> feedback
) {
}
