package com.usiu.campusevents.service.impl;

import com.usiu.campusevents.dto.request.EventDecisionRequest;
import com.usiu.campusevents.dto.request.EventRequest;
import com.usiu.campusevents.dto.response.DashboardResponse;
import com.usiu.campusevents.dto.response.EventResponse;
import com.usiu.campusevents.dto.response.PageResponse;
import com.usiu.campusevents.entity.Event;
import com.usiu.campusevents.entity.EventCategory;
import com.usiu.campusevents.entity.Program;
import com.usiu.campusevents.entity.Registration;
import com.usiu.campusevents.entity.School;
import com.usiu.campusevents.entity.StudentClub;
import com.usiu.campusevents.entity.User;
import com.usiu.campusevents.entity.Venue;
import com.usiu.campusevents.entity.enums.ApprovalStatus;
import com.usiu.campusevents.entity.enums.EventStatus;
import com.usiu.campusevents.entity.enums.NotificationType;
import com.usiu.campusevents.entity.enums.RegistrationStatus;
import com.usiu.campusevents.entity.enums.Role;
import com.usiu.campusevents.entity.enums.UserStatus;
import com.usiu.campusevents.entity.enums.VenueAvailabilityStatus;
import com.usiu.campusevents.exception.BadRequestException;
import com.usiu.campusevents.exception.ResourceNotFoundException;
import com.usiu.campusevents.exception.UnauthorizedActionException;
import com.usiu.campusevents.exception.VenueConflictException;
import com.usiu.campusevents.mapper.CampusMapper;
import com.usiu.campusevents.repository.EventCategoryRepository;
import com.usiu.campusevents.repository.EventRepository;
import com.usiu.campusevents.repository.ProgramRepository;
import com.usiu.campusevents.repository.RegistrationRepository;
import com.usiu.campusevents.repository.SchoolRepository;
import com.usiu.campusevents.repository.StudentClubRepository;
import com.usiu.campusevents.repository.UserRepository;
import com.usiu.campusevents.repository.VenueRepository;
import com.usiu.campusevents.service.interfaces.EventService;
import com.usiu.campusevents.service.interfaces.NotificationService;
import com.usiu.campusevents.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final StudentClubRepository clubRepository;
    private final UserRepository userRepository;
    private final EventCategoryRepository categoryRepository;
    private final VenueRepository venueRepository;
    private final SchoolRepository schoolRepository;
    private final ProgramRepository programRepository;
    private final RegistrationRepository registrationRepository;
    private final NotificationService notificationService;
    private final CampusMapper mapper;

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','CLUB_ORGANIZER')")
    public EventResponse create(EventRequest request) {
        User organizer = currentUser();
        StudentClub club = clubRepository.findById(request.clubId())
                .orElseThrow(() -> new ResourceNotFoundException("Club", request.clubId()));
        EventCategory category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Event category", request.categoryId()));
        Venue venue = venueRepository.findById(request.venueId())
                .orElseThrow(() -> new ResourceNotFoundException("Venue", request.venueId()));
        School targetSchool = request.targetSchoolId() == null ? null : schoolRepository.findById(request.targetSchoolId())
                .orElseThrow(() -> new ResourceNotFoundException("School", request.targetSchoolId()));
        Set<Program> targetPrograms = loadTargetPrograms(request.targetProgramIds());
        validateTargetPrograms(targetSchool, targetPrograms);
        validateEventWindowAndVenue(null, request, venue);

        Event event = Event.builder()
                .title(request.title())
                .description(request.description())
                .eventImage(request.eventImage())
                .startDateTime(request.startDateTime())
                .endDateTime(request.endDateTime())
                .registrationDeadline(request.registrationDeadline())
                .maximumCapacity(request.maximumCapacity())
                .currentParticipants(0)
                .eventStatus(EventStatus.DRAFT)
                .approvalStatus(ApprovalStatus.PENDING)
                .openToAllStudents(request.openToAllStudents())
                .targetYearOfStudy(request.targetYearOfStudy())
                .deadlineReminderSent(false)
                .oneDayReminderSent(false)
                .oneHourReminderSent(false)
                .club(club)
                .organizer(organizer)
                .category(category)
                .venue(venue)
                .targetSchool(targetSchool)
                .targetPrograms(targetPrograms)
                .build();
        Event saved = eventRepository.save(event);
        notifyAdmins("New event submitted for approval", saved.getTitle() + " is awaiting administrator review.", NotificationType.NEW_EVENT_SUBMITTED, saved);
        return mapper.toEventResponse(saved);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','CLUB_ORGANIZER')")
    public EventResponse update(Long id, EventRequest request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", id));
        ensureOrganizerOrAdmin(event);

        Venue venue = venueRepository.findById(request.venueId())
                .orElseThrow(() -> new ResourceNotFoundException("Venue", request.venueId()));
        boolean venueChanged = !event.getVenue().getId().equals(venue.getId());
        validateEventWindowAndVenue(event.getId(), request, venue);
        if (request.maximumCapacity() < event.getCurrentParticipants()) {
            throw new BadRequestException("Maximum capacity cannot be lower than current registrations");
        }

        event.setTitle(request.title());
        event.setDescription(request.description());
        event.setEventImage(request.eventImage());
        event.setStartDateTime(request.startDateTime());
        event.setEndDateTime(request.endDateTime());
        event.setRegistrationDeadline(request.registrationDeadline());
        event.setMaximumCapacity(request.maximumCapacity());
        event.setClub(clubRepository.findById(request.clubId())
                .orElseThrow(() -> new ResourceNotFoundException("Club", request.clubId())));
        event.setCategory(categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Event category", request.categoryId())));
        event.setVenue(venue);
        School targetSchool = request.targetSchoolId() == null ? null : schoolRepository.findById(request.targetSchoolId())
                .orElseThrow(() -> new ResourceNotFoundException("School", request.targetSchoolId()));
        Set<Program> targetPrograms = loadTargetPrograms(request.targetProgramIds());
        validateTargetPrograms(targetSchool, targetPrograms);
        event.setTargetSchool(targetSchool);
        event.setTargetPrograms(targetPrograms);
        event.setOpenToAllStudents(request.openToAllStudents());
        event.setTargetYearOfStudy(request.targetYearOfStudy());

        if (!SecurityUtils.hasRole(Role.ADMINISTRATOR)) {
            event.setApprovalStatus(ApprovalStatus.PENDING);
            event.setEventStatus(EventStatus.DRAFT);
            notifyAdmins("Event updated and resubmitted", event.getTitle() + " was updated by its organizer.", NotificationType.NEW_EVENT_SUBMITTED, event);
        }

        NotificationType type = venueChanged ? NotificationType.VENUE_CHANGED : NotificationType.EVENT_UPDATED;
        String message = venueChanged
                ? "The venue for " + event.getTitle() + " has changed to " + venue.getVenueName() + "."
                : "Details for " + event.getTitle() + " have been updated.";
        notificationService.notifyUsers(registeredStudents(event), event.getTitle() + " updated", message, type, event);
        return mapper.toEventResponse(event);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public EventResponse approve(Long id, EventDecisionRequest request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", id));
        ensureNoVenueConflict(event.getId(), event.getVenue(), event.getStartDateTime(), event.getEndDateTime());
        event.setApprovalStatus(ApprovalStatus.APPROVED);
        event.setEventStatus(EventStatus.PUBLISHED);

        notificationService.notifyUser(
                event.getOrganizer(),
                "Event approved",
                event.getTitle() + " has been approved and published.",
                NotificationType.EVENT_APPROVAL,
                event
        );
        notificationService.notifyUsers(
                matchingStudents(event),
                "Recommended event: " + event.getTitle(),
                "A campus event matching your profile is now open for registration.",
                NotificationType.EVENT_RECOMMENDATION,
                event
        );
        return mapper.toEventResponse(event);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public EventResponse reject(Long id, EventDecisionRequest request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", id));
        event.setApprovalStatus(ApprovalStatus.REJECTED);
        event.setEventStatus(EventStatus.DRAFT);
        String reason = request == null || request.reason() == null || request.reason().isBlank()
                ? "No reason provided."
                : request.reason();
        notificationService.notifyUser(
                event.getOrganizer(),
                "Event rejected",
                event.getTitle() + " was rejected. Reason: " + reason,
                NotificationType.EVENT_REJECTION,
                event
        );
        return mapper.toEventResponse(event);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','CLUB_ORGANIZER')")
    public EventResponse cancel(Long id, EventDecisionRequest request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", id));
        ensureOrganizerOrAdmin(event);
        event.setEventStatus(EventStatus.CANCELLED);
        notificationService.notifyUsers(
                registeredStudents(event),
                "Event cancelled",
                event.getTitle() + " has been cancelled.",
                NotificationType.EVENT_CANCELLED,
                event
        );
        return mapper.toEventResponse(event);
    }

    @Override
    @Transactional(readOnly = true)
    public EventResponse get(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", id));
        ensureCanViewEvent(event);
        return mapper.toEventResponse(event);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<EventResponse> search(
            String title,
            Long categoryId,
            Long schoolId,
            Long programId,
            Long venueId,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            Pageable pageable
    ) {
        ApprovalStatus approvalStatus = SecurityUtils.hasRole(Role.ADMINISTRATOR) ? null : ApprovalStatus.APPROVED;
        EventStatus eventStatus = SecurityUtils.hasRole(Role.ADMINISTRATOR) ? null : EventStatus.PUBLISHED;
        return PageResponse.from(eventRepository.search(title, categoryId, schoolId, programId, venueId, fromDate, toDate, approvalStatus, eventStatus, pageable)
                .map(mapper::toEventResponse));
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','CLUB_ORGANIZER')")
    public PageResponse<EventResponse> organizerEvents(Pageable pageable) {
        if (SecurityUtils.hasRole(Role.ADMINISTRATOR)) {
            return PageResponse.from(eventRepository.findAll(pageable).map(mapper::toEventResponse));
        }
        return PageResponse.from(eventRepository.findByOrganizerId(SecurityUtils.currentUserId(), pageable)
                .map(mapper::toEventResponse));
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('STUDENT')")
    public DashboardResponse studentDashboard() {
        User student = currentUser();
        LocalDateTime now = LocalDateTime.now();
        Pageable firstSix = PageRequest.of(0, 6);
        Long schoolId = student.getSchool() == null ? null : student.getSchool().getId();
        Long programId = student.getProgram() == null ? null : student.getProgram().getId();

        List<EventResponse> recommended = eventRepository.findRecommendedEvents(
                        schoolId,
                        programId,
                        student.getYearOfStudy(),
                        now,
                        ApprovalStatus.APPROVED,
                        EventStatus.PUBLISHED,
                        firstSix
                ).map(mapper::toEventResponse)
                .getContent();
        List<EventResponse> upcoming = eventRepository.findByApprovalStatusAndEventStatusAndStartDateTimeAfterOrderByStartDateTimeAsc(
                        ApprovalStatus.APPROVED,
                        EventStatus.PUBLISHED,
                        now,
                        firstSix
                ).map(mapper::toEventResponse)
                .getContent();
        List<EventResponse> trending = eventRepository.findTrendingNative(1, firstSix)
                .map(mapper::toEventResponse)
                .getContent();
        List<EventResponse> universityWide = eventRepository.findByApprovalStatusAndEventStatusAndOpenToAllStudentsTrueAndStartDateTimeAfterOrderByStartDateTimeAsc(
                        ApprovalStatus.APPROVED,
                        EventStatus.PUBLISHED,
                        now,
                        firstSix
                ).map(mapper::toEventResponse)
                .getContent();
        List<EventResponse> recentlyAdded = eventRepository.findByApprovalStatusAndEventStatusOrderByCreatedAtDesc(
                        ApprovalStatus.APPROVED,
                        EventStatus.PUBLISHED,
                        firstSix
                ).map(mapper::toEventResponse)
                .getContent();

        return new DashboardResponse(recommended, upcoming, trending, universityWide, recentlyAdded);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','CLUB_ORGANIZER')")
    public void delete(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", id));
        ensureOrganizerOrAdmin(event);
        eventRepository.delete(event);
    }

    private User currentUser() {
        return userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    private Set<Program> loadTargetPrograms(Set<Long> targetProgramIds) {
        if (targetProgramIds == null || targetProgramIds.isEmpty()) {
            return new HashSet<>();
        }
        List<Program> programs = programRepository.findAllById(targetProgramIds);
        if (programs.size() != targetProgramIds.size()) {
            throw new ResourceNotFoundException("One or more target programs were not found");
        }
        return new HashSet<>(programs);
    }

    private void validateTargetPrograms(School targetSchool, Set<Program> targetPrograms) {
        if (targetSchool == null) {
            return;
        }
        boolean hasProgramOutsideSchool = targetPrograms.stream()
                .anyMatch(program -> !program.getSchool().getId().equals(targetSchool.getId()));
        if (hasProgramOutsideSchool) {
            throw new BadRequestException("All targeted programs must belong to the targeted school");
        }
    }

    private void validateEventWindowAndVenue(Long eventId, EventRequest request, Venue venue) {
        if (!request.endDateTime().isAfter(request.startDateTime())) {
            throw new BadRequestException("Event end time must be after start time");
        }
        if (!request.registrationDeadline().isBefore(request.startDateTime())) {
            throw new BadRequestException("Registration deadline must be before event start time");
        }
        if (venue.getAvailabilityStatus() != VenueAvailabilityStatus.AVAILABLE) {
            throw new BadRequestException("Venue is not available");
        }
        if (request.maximumCapacity() > venue.getCapacity()) {
            throw new BadRequestException("Event maximum capacity cannot exceed venue capacity");
        }
        ensureNoVenueConflict(eventId, venue, request.startDateTime(), request.endDateTime());
    }

    private void ensureNoVenueConflict(Long eventId, Venue venue, LocalDateTime startDateTime, LocalDateTime endDateTime) {
        long conflicts = eventRepository.countVenueConflicts(
                venue.getId(),
                eventId,
                startDateTime,
                endDateTime,
                ApprovalStatus.REJECTED,
                EventStatus.CANCELLED
        );
        if (conflicts > 0) {
            notifyAdmins("Venue conflict detected", "A conflicting event exists for " + venue.getVenueName() + ".", NotificationType.VENUE_CONFLICT, null);
            throw new VenueConflictException("Venue is already booked during the selected time window");
        }
    }

    private void ensureOrganizerOrAdmin(Event event) {
        if (SecurityUtils.hasRole(Role.ADMINISTRATOR)) {
            return;
        }
        if (!event.getOrganizer().getId().equals(SecurityUtils.currentUserId())) {
            throw new UnauthorizedActionException("Only the event organizer can modify this event");
        }
    }

    private void ensureCanViewEvent(Event event) {
        if (SecurityUtils.hasRole(Role.ADMINISTRATOR)
                || event.getOrganizer().getId().equals(SecurityUtils.currentUserId())
                || (event.getApprovalStatus() == ApprovalStatus.APPROVED && event.getEventStatus() == EventStatus.PUBLISHED)) {
            return;
        }
        throw new UnauthorizedActionException("This event is not available for viewing");
    }

    private List<User> matchingStudents(Event event) {
        List<Long> programIds = event.getTargetPrograms().stream().map(Program::getId).toList();
        return userRepository.findStudentsMatchingTargets(
                Role.STUDENT,
                UserStatus.ACTIVE,
                event.getOpenToAllStudents(),
                event.getTargetSchool() == null ? null : event.getTargetSchool().getId(),
                programIds.isEmpty() ? List.of(-1L) : programIds,
                event.getTargetYearOfStudy()
        );
    }

    private List<User> registeredStudents(Event event) {
        return registrationRepository.findByEventIdAndRegistrationStatus(event.getId(), RegistrationStatus.REGISTERED)
                .stream()
                .map(Registration::getStudent)
                .toList();
    }

    private void notifyAdmins(String title, String message, NotificationType type, Event event) {
        notificationService.notifyUsers(userRepository.findByRole(Role.ADMINISTRATOR), title, message, type, event);
    }
}
