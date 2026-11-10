package com.usiu.campusevents.dto.request;

import com.usiu.campusevents.entity.enums.Role;
import com.usiu.campusevents.entity.enums.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record UserRequest(
        @NotBlank @Size(max = 80) String firstName,
        @NotBlank @Size(max = 80) String lastName,
        @Size(max = 50) String registrationNumber,
        @Size(max = 50) String employeeNumber,
        @Email @NotBlank @Size(max = 150) String email,
        @Size(min = 8, max = 100) String password,
        @Pattern(regexp = "^$|^\\+?[0-9 ()-]{7,30}$") String phoneNumber,
        @NotNull Role role,
        @NotNull UserStatus status,
        String profilePhoto,
        Long schoolId,
        Long programId,
        @Min(1) @Max(6) Integer yearOfStudy,
        LocalDateTime expiresAt
) {
}
