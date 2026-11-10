package com.usiu.campusevents.dto.request;

import com.usiu.campusevents.entity.enums.VenueAvailabilityStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record VenueRequest(
        @NotBlank @Size(max = 150) String venueName,
        @NotBlank @Size(max = 100) String building,
        @Size(max = 50) String roomNumber,
        @NotNull @Positive Integer capacity,
        @NotNull VenueAvailabilityStatus availabilityStatus
) {
}
