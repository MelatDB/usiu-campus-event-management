package com.usiu.campusevents.dto.request;

import com.usiu.campusevents.validation.ValidEventSchedule;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.Set;

@ValidEventSchedule
public record EventRequest(
        @NotBlank @Size(max = 200) String title,
        @NotBlank String description,
        String eventImage,
        @NotNull @Future LocalDateTime startDateTime,
        @NotNull @Future LocalDateTime endDateTime,
        @NotNull @Future LocalDateTime registrationDeadline,
        @NotNull @Positive Integer maximumCapacity,
        @NotNull Long clubId,
        @NotNull Long categoryId,
        @NotNull Long venueId,
        Long targetSchoolId,
        Set<Long> targetProgramIds,
        @NotNull Boolean openToAllStudents,
        @Min(1) @Max(6) Integer targetYearOfStudy
) {
}
