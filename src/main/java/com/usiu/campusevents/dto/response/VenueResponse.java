package com.usiu.campusevents.dto.response;

import com.usiu.campusevents.entity.enums.VenueAvailabilityStatus;

public record VenueResponse(
        Long id,
        String venueName,
        String building,
        String roomNumber,
        Integer capacity,
        VenueAvailabilityStatus availabilityStatus
) {
}
