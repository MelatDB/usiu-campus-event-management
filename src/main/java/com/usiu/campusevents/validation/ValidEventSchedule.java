package com.usiu.campusevents.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Documented
@Constraint(validatedBy = EventScheduleValidator.class)
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidEventSchedule {

    String message() default "Event end time must be after start time and registration deadline must be before start time";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
