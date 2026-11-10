package com.usiu.campusevents.service.impl;

import com.usiu.campusevents.dto.request.RegistrationRequest;
import com.usiu.campusevents.dto.response.PageResponse;
import com.usiu.campusevents.dto.response.RegistrationResponse;
import com.usiu.campusevents.entity.Event;
import com.usiu.campusevents.entity.Registration;
import com.usiu.campusevents.entity.User;
import com.usiu.campusevents.entity.enums.ApprovalStatus;
import com.usiu.campusevents.entity.enums.AttendanceStatus;
import com.usiu.campusevents.entity.enums.EventStatus;
import com.usiu.campusevents.entity.enums.NotificationType;
import com.usiu.campusevents.entity.enums.RegistrationStatus;
import com.usiu.campusevents.entity.enums.Role;
import com.usiu.campusevents.exception.DuplicateRegistrationException;
import com.usiu.campusevents.exception.EventCapacityExceededException;
import com.usiu.campusevents.exception.BadRequestException;
import com.usiu.campusevents.exception.RegistrationClosedException;
import com.usiu.campusevents.exception.ResourceNotFoundException;
import com.usiu.campusevents.exception.UnauthorizedActionException;
import com.usiu.campusevents.mapper.CampusMapper;
import com.usiu.campusevents.repository.EventRepository;
import com.usiu.campusevents.repository.RegistrationRepository;
import com.usiu.campusevents.repository.UserRepository;
import com.usiu.campusevents.service.interfaces.NotificationService;
import com.usiu.campusevents.service.interfaces.RegistrationService;
import com.usiu.campusevents.util.SecurityUtils;
import com.usiu.campusevents.util.TicketGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RegistrationServiceImpl implements RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final CampusMapper mapper;

    @Override
    @Transactional
    @PreAuthorize("hasRole('STUDENT')")
    public RegistrationResponse register(RegistrationRequest request) {
        User student = currentUser();
        Event event = eventRepository.findByIdForUpdate(request.eventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event", request.eventId()));
        validateRegistrationOpen(event);

        Registration registration = registrationRepository.findByStudentIdAndEventId(student.getId(), event.getId()).orElse(null);
        if (registration != null && registration.getRegistrationStatus() == RegistrationStatus.REGISTERED) {
            throw new DuplicateRegistrationException("Student is already registered for this event");
        }
        ensureCapacity(event);

        if (registration == null) {
            registration = Registration.builder()
                    .student(student)
                    .event(event)
                    .registrationStatus(RegistrationStatus.REGISTERED)
                    .attendanceStatus(AttendanceStatus.NOT_MARKED)
                    .registrationDate(LocalDateTime.now())
                    .build();
        } else {
            registration.setRegistrationStatus(RegistrationStatus.REGISTERED);
            registration.setAttendanceStatus(AttendanceStatus.NOT_MARKED);
            registration.setRegistrationDate(LocalDateTime.now());
        }
        event.setCurrentParticipants(event.getCurrentParticipants() + 1);
        Registration saved = registrationRepository.save(registration);

        notificationService.notifyUser(student, "Registration successful", "You are registered for " + event.getTitle() + ".", NotificationType.REGISTRATION_SUCCESS, event);
        notificationService.notifyUser(event.getOrganizer(), "New registration", student.getFirstName() + " " + student.getLastName() + " registered for " + event.getTitle() + ".", NotificationType.REGISTRATION_SUCCESS, event);
        if (event.getCurrentParticipants().equals(event.getMaximumCapacity())) {
            notificationService.notifyUser(event.getOrganizer(), "Event reached capacity", event.getTitle() + " has reached maximum capacity.", NotificationType.CAPACITY_REACHED, event);
        }
        return mapper.toRegistrationResponse(saved);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('STUDENT')")
    public RegistrationResponse cancel(Long registrationId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration", registrationId));
        if (!registration.getStudent().getId().equals(SecurityUtils.currentUserId())) {
            throw new UnauthorizedActionException("Students can only cancel their own registrations");
        }
        if (registration.getRegistrationStatus() == RegistrationStatus.CANCELLED) {
            return mapper.toRegistrationResponse(registration);
        }
        registration.setRegistrationStatus(RegistrationStatus.CANCELLED);
        Event event = registration.getEvent();
        event.setCurrentParticipants(Math.max(0, event.getCurrentParticipants() - 1));
        notificationService.notifyUser(registration.getStudent(), "Registration cancelled", "Your registration for " + event.getTitle() + " was cancelled.", NotificationType.REGISTRATION_CANCELLED, event);
        notificationService.notifyUser(event.getOrganizer(), "Registration cancelled", registration.getStudent().getFirstName() + " cancelled registration for " + event.getTitle() + ".", NotificationType.REGISTRATION_CANCELLED, event);
        return mapper.toRegistrationResponse(registration);
    }

    @Override
    @Transactional(readOnly = true)
    public RegistrationResponse get(Long id) {
        Registration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registration", id));
        ensureCanViewRegistration(registration);
        return mapper.toRegistrationResponse(registration);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateTicket(Long id) {
        Registration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registration", id));
        ensureCanViewRegistration(registration);
        try {
            return TicketGenerator.generate(registration);
        } catch (IOException e) {
            throw new BadRequestException("Could not generate ticket image: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('STUDENT')")
    public PageResponse<RegistrationResponse> myRegistrations(Pageable pageable) {
        return PageResponse.from(registrationRepository.findByStudentId(SecurityUtils.currentUserId(), pageable)
                .map(mapper::toRegistrationResponse));
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','CLUB_ORGANIZER')")
    public PageResponse<RegistrationResponse> eventRegistrations(Long eventId, Pageable pageable) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", eventId));
        ensureOrganizerOrAdmin(event);
        return PageResponse.from(registrationRepository.findByEventId(eventId, pageable)
                .map(mapper::toRegistrationResponse));
    }

    private void validateRegistrationOpen(Event event) {
        if (event.getApprovalStatus() != ApprovalStatus.APPROVED || event.getEventStatus() != EventStatus.PUBLISHED) {
            throw new RegistrationClosedException("Registration is only open for approved, published events");
        }
        if (LocalDateTime.now().isAfter(event.getRegistrationDeadline())) {
            throw new RegistrationClosedException("Registration deadline has passed");
        }
    }

    private void ensureCapacity(Event event) {
        if (event.getCurrentParticipants() >= event.getMaximumCapacity()) {
            throw new EventCapacityExceededException("Event capacity has been reached");
        }
    }

    private User currentUser() {
        return userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    private void ensureCanViewRegistration(Registration registration) {
        if (SecurityUtils.hasRole(Role.ADMINISTRATOR)
                || registration.getStudent().getId().equals(SecurityUtils.currentUserId())
                || registration.getEvent().getOrganizer().getId().equals(SecurityUtils.currentUserId())) {
            return;
        }
        throw new UnauthorizedActionException("You do not have permission to view this registration");
    }

    private void ensureOrganizerOrAdmin(Event event) {
        if (SecurityUtils.hasRole(Role.ADMINISTRATOR) || event.getOrganizer().getId().equals(SecurityUtils.currentUserId())) {
            return;
        }
        throw new UnauthorizedActionException("Only the organizer can view registrations for this event");
    }
}
