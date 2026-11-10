package com.usiu.campusevents.dto.response;

import java.util.List;

public record DashboardResponse(
        List<EventResponse> recommendedEvents,
        List<EventResponse> upcomingEvents,
        List<EventResponse> trendingEvents,
        List<EventResponse> universityWideEvents,
        List<EventResponse> recentlyAddedEvents
) {
}
