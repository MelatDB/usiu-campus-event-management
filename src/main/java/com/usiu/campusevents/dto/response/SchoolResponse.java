package com.usiu.campusevents.dto.response;

public record SchoolResponse(
        Long id,
        String schoolName,
        String abbreviation,
        String description,
        long programCount
) {
}
