package com.usiu.campusevents.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record FeedbackRequest(
        @NotNull @Min(1) @Max(5) Integer rating,
        String comment,
        List<String> tags
) {
}
