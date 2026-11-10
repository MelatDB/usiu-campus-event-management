package com.usiu.campusevents.dto.response;

import com.usiu.campusevents.entity.enums.Role;
import com.usiu.campusevents.entity.enums.UserStatus;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String firstName,
        String lastName,
        String registrationNumber,
        String employeeNumber,
        String email,
        String phoneNumber,
        Role role,
        UserStatus status,
        String profilePhoto,
        Integer yearOfStudy,
        Long schoolId,
        String schoolName,
        Long programId,
        String programName,
        LocalDateTime expiresAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
