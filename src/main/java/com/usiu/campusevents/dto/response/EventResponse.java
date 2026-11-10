package com.usiu.campusevents.dto.response;

import com.usiu.campusevents.entity.enums.ApprovalStatus;
import com.usiu.campusevents.entity.enums.EventStatus;

import java.time.LocalDateTime;
import java.util.List;

public record EventResponse(
        Long id,
        String title,
        String description,
        String eventImage,
        LocalDateTime startDateTime,
        LocalDateTime endDateTime,
        LocalDateTime registrationDeadline,
        Integer maximumCapacity,
        Integer currentParticipants,
        EventStatus eventStatus,
        ApprovalStatus approvalStatus,
        Boolean openToAllStudents,
        Integer targetYearOfStudy,
        Long clubId,
        String clubName,
        Long organizerId,
        String organizerName,
        Long categoryId,
        String categoryName,
        Long venueId,
        String venueName,
        Long targetSchoolId,
        String targetSchoolName,
        List<Long> targetProgramIds,
        List<String> targetProgramNames,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
