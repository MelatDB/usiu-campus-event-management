package com.usiu.campusevents.dto.response;

public record AnalyticsResponse(
        long totalUsers,
        long totalStudents,
        long totalOrganizers,
        long totalEvents,
        long pendingEvents,
        long publishedEvents,
        long activeRegistrations
) {
}
