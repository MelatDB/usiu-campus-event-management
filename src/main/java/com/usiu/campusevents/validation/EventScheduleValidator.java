package com.usiu.campusevents.validation;

import com.usiu.campusevents.dto.request.EventRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class EventScheduleValidator implements ConstraintValidator<ValidEventSchedule, EventRequest> {

    @Override
    public boolean isValid(EventRequest request, ConstraintValidatorContext context) {
        if (request == null
                || request.startDateTime() == null
                || request.endDateTime() == null
                || request.registrationDeadline() == null) {
            return true;
        }
        return request.endDateTime().isAfter(request.startDateTime())
                && request.registrationDeadline().isBefore(request.startDateTime());
    }
}
