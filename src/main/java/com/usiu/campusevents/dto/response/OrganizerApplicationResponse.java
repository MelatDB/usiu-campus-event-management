package com.usiu.campusevents.dto.response;

import com.usiu.campusevents.entity.enums.ApplicationStatus;

import java.time.LocalDateTime;
import java.util.List;

public record OrganizerApplicationResponse(
        Long id,
        Long studentId,
        String studentName,
        String studentEmail,
        String registrationNumber,
        String motivation,
        String experience,
        String eventIdea,
        List<OrganizerApplicationDocumentResponse> documents,
        ApplicationStatus status,
        String rejectionReason,
        Long reviewedById,
        String reviewedByName,
        LocalDateTime reviewedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
