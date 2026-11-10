package com.usiu.campusevents.dto.response;

public record OrganizerApplicationDocumentResponse(
        Long id,
        String fileName,
        String contentType,
        long fileSize
) {
}
