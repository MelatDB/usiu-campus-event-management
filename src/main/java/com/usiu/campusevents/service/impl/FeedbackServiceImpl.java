package com.usiu.campusevents.service.impl;

import com.usiu.campusevents.dto.request.FeedbackRequest;
import com.usiu.campusevents.dto.response.EventFeedbackSummaryResponse;
import com.usiu.campusevents.dto.response.EventResponse;
import com.usiu.campusevents.dto.response.FeedbackEventSummaryResponse;
import com.usiu.campusevents.dto.response.FeedbackResponse;
import com.usiu.campusevents.entity.Event;
import com.usiu.campusevents.entity.EventFeedback;
import com.usiu.campusevents.entity.Registration;
import com.usiu.campusevents.entity.User;
import com.usiu.campusevents.entity.enums.ApprovalStatus;
import com.usiu.campusevents.entity.enums.EventStatus;
import com.usiu.campusevents.entity.enums.RegistrationStatus;
import com.usiu.campusevents.entity.enums.Role;
import com.usiu.campusevents.exception.BadRequestException;
import com.usiu.campusevents.exception.ResourceNotFoundException;
import com.usiu.campusevents.exception.UnauthorizedActionException;
import com.usiu.campusevents.mapper.CampusMapper;
import com.usiu.campusevents.repository.EventFeedbackRepository;
import com.usiu.campusevents.repository.EventRepository;
import com.usiu.campusevents.repository.RegistrationRepository;
import com.usiu.campusevents.repository.UserRepository;
import com.usiu.campusevents.service.interfaces.FeedbackService;
import com.usiu.campusevents.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {

    private final EventFeedbackRepository feedbackRepository;
    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final CampusMapper mapper;

    @Override
    @Transactional
    @PreAuthorize("hasRole('STUDENT')")
    public FeedbackResponse submit(Long eventId, FeedbackRequest request) {
        User student = userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", eventId));

        Registration registration = registrationRepository.findByStudentIdAndEventId(student.getId(), eventId)
                .orElseThrow(() -> new BadRequestException("You can only give feedback for events you registered for"));
        if (registration.getRegistrationStatus() != RegistrationStatus.REGISTERED) {
            throw new BadRequestException("You can only give feedback for events you actively participated in");
        }
        if (event.getEventStatus() == EventStatus.CANCELLED) {
            throw new BadRequestException("You cannot give feedback for a cancelled event");
        }
        if (event.getApprovalStatus() != ApprovalStatus.APPROVED) {
            throw new BadRequestException("You cannot give feedback for an unapproved event");
        }
        if (!event.getEndDateTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("You can only give feedback after the event has ended");
        }
        if (feedbackRepository.existsByStudentIdAndEventId(student.getId(), eventId)) {
            throw new BadRequestException("You already gave feedback for this event");
        }

        EventFeedback feedback = EventFeedback.builder()
                .rating(request.rating())
                .comment(request.comment())
                .tags(request.tags() == null ? List.of() : request.tags().stream().map(String::trim).filter(t -> !t.isBlank()).limit(6).toList())
                .student(student)
                .event(event)
                .build();
        return toResponse(feedbackRepository.save(feedback));
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','CLUB_ORGANIZER')")
    public EventFeedbackSummaryResponse eventSummary(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", eventId));
        if (!SecurityUtils.hasRole(Role.ADMINISTRATOR) && !event.getOrganizer().getId().equals(SecurityUtils.currentUserId())) {
            throw new UnauthorizedActionException("Only the organizer can view feedback for this event");
        }
        List<FeedbackResponse> feedback = feedbackRepository.findByEventIdOrderByCreatedAtDesc(eventId)
                .stream().map(this::toResponse).toList();
        Double avg = feedbackRepository.averageRating(eventId);
        Map<Integer, Long> distribution = new LinkedHashMap<>();
        for (int star = 1; star <= 5; star++) {
            distribution.put(star, feedbackRepository.countByEventIdAndRating(eventId, star));
        }
        return new EventFeedbackSummaryResponse(
                eventId,
                avg == null ? 0.0 : Math.round(avg * 10.0) / 10.0,
                feedback.size(),
                distribution,
                feedback
        );
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','CLUB_ORGANIZER')")
    public List<FeedbackEventSummaryResponse> eventList() {
        Long organizerId = SecurityUtils.hasRole(Role.ADMINISTRATOR) ? null : SecurityUtils.currentUserId();
        return feedbackRepository.findFeedbackEventAggregates(organizerId)
                .stream()
                .map(a -> new FeedbackEventSummaryResponse(
                        a.getEventId(),
                        a.getEventTitle(),
                        a.getOrganizerFirstName() + " " + a.getOrganizerLastName(),
                        a.getAverageRating() == null ? 0.0 : Math.round(a.getAverageRating() * 10.0) / 10.0,
                        a.getFeedbackCount() == null ? 0 : a.getFeedbackCount()
                ))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('STUDENT')")
    public List<FeedbackResponse> myFeedback() {
        return feedbackRepository.findByStudentIdOrderByCreatedAtDesc(SecurityUtils.currentUserId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('STUDENT')")
    public List<EventResponse> pendingFeedbackEvents() {
        return feedbackRepository.findPendingFeedbackEvents(SecurityUtils.currentUserId(), LocalDateTime.now())
                .stream()
                .map(mapper::toEventResponse)
                .toList();
    }

    private FeedbackResponse toResponse(EventFeedback feedback) {
        return new FeedbackResponse(
                feedback.getId(),
                feedback.getRating(),
                feedback.getComment(),
                feedback.getTags(),
                feedback.getStudent().getId(),
                feedback.getStudent().getFirstName() + " " + feedback.getStudent().getLastName(),
                feedback.getEvent().getId(),
                feedback.getEvent().getTitle(),
                feedback.getCreatedAt()
        );
    }
}
