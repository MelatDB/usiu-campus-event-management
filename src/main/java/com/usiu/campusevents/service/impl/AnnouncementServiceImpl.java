package com.usiu.campusevents.service.impl;

import com.usiu.campusevents.dto.request.AnnouncementRequest;
import com.usiu.campusevents.dto.response.AnnouncementResponse;
import com.usiu.campusevents.dto.response.PageResponse;
import com.usiu.campusevents.entity.Announcement;
import com.usiu.campusevents.entity.Event;
import com.usiu.campusevents.entity.Registration;
import com.usiu.campusevents.entity.User;
import com.usiu.campusevents.entity.enums.NotificationType;
import com.usiu.campusevents.entity.enums.RegistrationStatus;
import com.usiu.campusevents.entity.enums.Role;
import com.usiu.campusevents.exception.ResourceNotFoundException;
import com.usiu.campusevents.exception.UnauthorizedActionException;
import com.usiu.campusevents.mapper.CampusMapper;
import com.usiu.campusevents.repository.AnnouncementRepository;
import com.usiu.campusevents.repository.EventRepository;
import com.usiu.campusevents.repository.RegistrationRepository;
import com.usiu.campusevents.service.interfaces.AnnouncementService;
import com.usiu.campusevents.service.interfaces.NotificationService;
import com.usiu.campusevents.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnnouncementServiceImpl implements AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final NotificationService notificationService;
    private final CampusMapper mapper;

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','CLUB_ORGANIZER')")
    public AnnouncementResponse create(AnnouncementRequest request) {
        Event event = eventRepository.findById(request.eventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event", request.eventId()));
        ensureOrganizerOrAdmin(event);
        Announcement announcement = Announcement.builder()
                .title(request.title())
                .message(request.message())
                .postedDate(LocalDateTime.now())
                .event(event)
                .build();
        Announcement saved = announcementRepository.save(announcement);
        notificationService.notifyUsers(registeredStudents(event), request.title(), request.message(), NotificationType.ANNOUNCEMENT, event);
        return mapper.toAnnouncementResponse(saved);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','CLUB_ORGANIZER')")
    public AnnouncementResponse update(Long id, AnnouncementRequest request) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement", id));
        ensureOrganizerOrAdmin(announcement.getEvent());
        announcement.setTitle(request.title());
        announcement.setMessage(request.message());
        announcement.setPostedDate(LocalDateTime.now());
        return mapper.toAnnouncementResponse(announcement);
    }

    @Override
    @Transactional(readOnly = true)
    public AnnouncementResponse get(Long id) {
        return announcementRepository.findById(id)
                .map(mapper::toAnnouncementResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement", id));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AnnouncementResponse> listForEvent(Long eventId, Pageable pageable) {
        return PageResponse.from(announcementRepository.findByEventIdOrderByPostedDateDesc(eventId, pageable)
                .map(mapper::toAnnouncementResponse));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','CLUB_ORGANIZER')")
    public void delete(Long id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement", id));
        ensureOrganizerOrAdmin(announcement.getEvent());
        announcementRepository.delete(announcement);
    }

    private List<User> registeredStudents(Event event) {
        return registrationRepository.findByEventIdAndRegistrationStatus(event.getId(), RegistrationStatus.REGISTERED)
                .stream()
                .map(Registration::getStudent)
                .toList();
    }

    private void ensureOrganizerOrAdmin(Event event) {
        if (SecurityUtils.hasRole(Role.ADMINISTRATOR) || event.getOrganizer().getId().equals(SecurityUtils.currentUserId())) {
            return;
        }
        throw new UnauthorizedActionException("Only the event organizer can manage announcements");
    }
}
