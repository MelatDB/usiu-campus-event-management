package com.usiu.campusevents.service.impl;

import com.usiu.campusevents.dto.request.AttendanceRequest;
import com.usiu.campusevents.dto.response.AttendanceResponse;
import com.usiu.campusevents.dto.response.PageResponse;
import com.usiu.campusevents.entity.Attendance;
import com.usiu.campusevents.entity.Event;
import com.usiu.campusevents.entity.Registration;
import com.usiu.campusevents.entity.enums.AttendanceStatus;
import com.usiu.campusevents.entity.enums.NotificationType;
import com.usiu.campusevents.entity.enums.RegistrationStatus;
import com.usiu.campusevents.entity.enums.Role;
import com.usiu.campusevents.exception.BadRequestException;
import com.usiu.campusevents.exception.ResourceNotFoundException;
import com.usiu.campusevents.exception.UnauthorizedActionException;
import com.usiu.campusevents.mapper.CampusMapper;
import com.usiu.campusevents.repository.AttendanceRepository;
import com.usiu.campusevents.repository.RegistrationRepository;
import com.usiu.campusevents.service.interfaces.AttendanceService;
import com.usiu.campusevents.service.interfaces.NotificationService;
import com.usiu.campusevents.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final RegistrationRepository registrationRepository;
    private final NotificationService notificationService;
    private final CampusMapper mapper;

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','CLUB_ORGANIZER')")
    public AttendanceResponse record(AttendanceRequest request) {
        Registration registration = registrationRepository.findById(request.registrationId())
                .orElseThrow(() -> new ResourceNotFoundException("Registration", request.registrationId()));
        ensureOrganizerOrAdmin(registration.getEvent());
        if (registration.getRegistrationStatus() != RegistrationStatus.REGISTERED) {
            throw new BadRequestException("Attendance can only be recorded for registered students");
        }
        if (request.attendanceStatus() == AttendanceStatus.NOT_MARKED) {
            throw new BadRequestException("Recorded attendance status must be present, absent, or checked in");
        }

        Attendance attendance = attendanceRepository.findByRegistrationId(registration.getId())
                .orElseGet(() -> Attendance.builder().registration(registration).build());
        attendance.setAttendanceStatus(request.attendanceStatus());
        attendance.setCheckInTime(LocalDateTime.now());
        registration.setAttendanceStatus(request.attendanceStatus());
        Attendance saved = attendanceRepository.save(attendance);

        notificationService.notifyUser(
                registration.getStudent(),
                "Attendance recorded",
                "Your attendance for " + registration.getEvent().getTitle() + " was recorded as " + request.attendanceStatus() + ".",
                NotificationType.ATTENDANCE_RECORDED,
                registration.getEvent()
        );
        return mapper.toAttendanceResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceResponse get(Long id) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance", id));
        ensureCanView(attendance);
        return mapper.toAttendanceResponse(attendance);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public PageResponse<AttendanceResponse> list(Pageable pageable) {
        return PageResponse.from(attendanceRepository.findAll(pageable).map(mapper::toAttendanceResponse));
    }

    private void ensureCanView(Attendance attendance) {
        Event event = attendance.getRegistration().getEvent();
        if (SecurityUtils.hasRole(Role.ADMINISTRATOR)
                || event.getOrganizer().getId().equals(SecurityUtils.currentUserId())
                || attendance.getRegistration().getStudent().getId().equals(SecurityUtils.currentUserId())) {
            return;
        }
        throw new UnauthorizedActionException("You do not have permission to view this attendance record");
    }

    private void ensureOrganizerOrAdmin(Event event) {
        if (SecurityUtils.hasRole(Role.ADMINISTRATOR) || event.getOrganizer().getId().equals(SecurityUtils.currentUserId())) {
            return;
        }
        throw new UnauthorizedActionException("Only the event organizer can record attendance");
    }
}
