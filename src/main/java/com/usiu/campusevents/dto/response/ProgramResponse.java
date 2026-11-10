package com.usiu.campusevents.dto.response;

public record ProgramResponse(
        Long id,
        String programName,
        String description,
        Long schoolId,
        String schoolName
) {
}
