package com.usiu.campusevents.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record StudentRegistrationRequest(
        @NotBlank @Size(max = 80) String firstName,
        @NotBlank @Size(max = 80) String lastName,
        @NotBlank @Size(max = 50) String registrationNumber,
        @Email @NotBlank @Size(max = 150) String email,
        @NotBlank @Size(min = 8, max = 100) String password,
        @Pattern(regexp = "^$|^\\+?[0-9 ()-]{7,30}$") String phoneNumber,
        @NotNull Long schoolId,
        @NotNull Long programId,
        @NotNull @Min(1) @Max(6) Integer yearOfStudy,
        String profilePhoto
) {
}
