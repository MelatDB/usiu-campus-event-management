package com.usiu.campusevents.service.impl;

import com.usiu.campusevents.dto.response.AnalyticsResponse;
import com.usiu.campusevents.entity.enums.ApprovalStatus;
import com.usiu.campusevents.entity.enums.EventStatus;
import com.usiu.campusevents.entity.enums.RegistrationStatus;
import com.usiu.campusevents.entity.enums.Role;
import com.usiu.campusevents.repository.EventRepository;
import com.usiu.campusevents.repository.RegistrationRepository;
import com.usiu.campusevents.repository.UserRepository;
import com.usiu.campusevents.service.interfaces.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMINISTRATOR')")
public class AnalyticsServiceImpl implements AnalyticsService {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;

    @Override
    @Transactional(readOnly = true)
    public AnalyticsResponse overview() {
        return new AnalyticsResponse(
                userRepository.count(),
                userRepository.countByRole(Role.STUDENT),
                userRepository.countByRole(Role.CLUB_ORGANIZER),
                eventRepository.count(),
                eventRepository.countByApprovalStatus(ApprovalStatus.PENDING),
                eventRepository.countByEventStatus(EventStatus.PUBLISHED),
                registrationRepository.countByRegistrationStatus(RegistrationStatus.REGISTERED)
        );
    }
}
