package com.usiu.campusevents.service.impl;

import com.usiu.campusevents.dto.request.UserRequest;
import com.usiu.campusevents.dto.response.PageResponse;
import com.usiu.campusevents.dto.response.UserResponse;
import com.usiu.campusevents.entity.Program;
import com.usiu.campusevents.entity.School;
import com.usiu.campusevents.entity.User;
import com.usiu.campusevents.entity.enums.Role;
import com.usiu.campusevents.exception.BadRequestException;
import com.usiu.campusevents.exception.ResourceNotFoundException;
import com.usiu.campusevents.mapper.CampusMapper;
import com.usiu.campusevents.repository.EventRepository;
import com.usiu.campusevents.repository.FavoriteEventRepository;
import com.usiu.campusevents.repository.NotificationRepository;
import com.usiu.campusevents.repository.ProgramRepository;
import com.usiu.campusevents.repository.RegistrationRepository;
import com.usiu.campusevents.repository.SchoolRepository;
import com.usiu.campusevents.repository.UserRepository;
import com.usiu.campusevents.service.interfaces.UserManagementService;
import com.usiu.campusevents.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMINISTRATOR')")
public class UserManagementServiceImpl implements UserManagementService {

    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;
    private final ProgramRepository programRepository;
    private final EventRepository eventRepository;
    private final FavoriteEventRepository favoriteEventRepository;
    private final NotificationRepository notificationRepository;
    private final RegistrationRepository registrationRepository;
    private final PasswordEncoder passwordEncoder;
    private final CampusMapper mapper;

    @Override
    @Transactional
    public UserResponse create(UserRequest request) {
        if (request.password() == null || request.password().isBlank()) {
            throw new BadRequestException("Password is required when creating a user");
        }
        validateUniqueCreate(request);
        User user = User.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .registrationNumber(request.registrationNumber())
                .employeeNumber(request.employeeNumber())
                .email(request.email().toLowerCase())
                .password(passwordEncoder.encode(request.password()))
                .phoneNumber(request.phoneNumber())
                .role(request.role())
                .status(request.status())
                .profilePhoto(request.profilePhoto())
                .yearOfStudy(request.yearOfStudy())
                .expiresAt(resolveExpiry(request.role(), request.expiresAt()))
                .build();
        applyAcademicProfile(user, request.schoolId(), request.programId());
        return mapper.toUserResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse update(Long id, UserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        validateUniqueUpdate(user, request);
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setRegistrationNumber(request.registrationNumber());
        user.setEmployeeNumber(request.employeeNumber());
        user.setEmail(request.email().toLowerCase());
        if (request.password() != null && !request.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }
        user.setPhoneNumber(request.phoneNumber());
        user.setRole(request.role());
        user.setStatus(request.status());
        user.setProfilePhoto(request.profilePhoto());
        user.setYearOfStudy(request.yearOfStudy());
        user.setExpiresAt(resolveExpiry(request.role(), request.expiresAt()));
        applyAcademicProfile(user, request.schoolId(), request.programId());
        return mapper.toUserResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse get(Long id) {
        return userRepository.findById(id)
                .map(mapper::toUserResponse)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> list(Role role, Pageable pageable) {
        return PageResponse.from((role == null ? userRepository.findAll(pageable) : userRepository.findByRole(role, pageable))
                .map(mapper::toUserResponse));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User", id);
        }
        if (id.equals(SecurityUtils.currentUserId())) {
            throw new BadRequestException("You cannot delete your own account");
        }
        if (eventRepository.existsByOrganizerId(id)) {
            throw new BadRequestException("Cannot delete this user because they are the organizer of one or more events");
        }
        favoriteEventRepository.deleteByStudentId(id);
        notificationRepository.deleteByUserId(id);
        registrationRepository.deleteByStudentId(id);
        userRepository.deleteById(id);
    }

    private void validateUniqueCreate(UserRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new BadRequestException("Email is already registered");
        }
        if (request.registrationNumber() != null
                && !request.registrationNumber().isBlank()
                && userRepository.existsByRegistrationNumberIgnoreCase(request.registrationNumber())) {
            throw new BadRequestException("Registration number is already registered");
        }
        if (request.employeeNumber() != null
                && !request.employeeNumber().isBlank()
                && userRepository.existsByEmployeeNumberIgnoreCase(request.employeeNumber())) {
            throw new BadRequestException("Employee number is already registered");
        }
    }

    private void validateUniqueUpdate(User user, UserRequest request) {
        if (!user.getEmail().equalsIgnoreCase(request.email()) && userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new BadRequestException("Email is already registered");
        }
        if (request.registrationNumber() != null
                && !request.registrationNumber().isBlank()
                && !request.registrationNumber().equalsIgnoreCase(nullToEmpty(user.getRegistrationNumber()))
                && userRepository.existsByRegistrationNumberIgnoreCase(request.registrationNumber())) {
            throw new BadRequestException("Registration number is already registered");
        }
        if (request.employeeNumber() != null
                && !request.employeeNumber().isBlank()
                && !request.employeeNumber().equalsIgnoreCase(nullToEmpty(user.getEmployeeNumber()))
                && userRepository.existsByEmployeeNumberIgnoreCase(request.employeeNumber())) {
            throw new BadRequestException("Employee number is already registered");
        }
    }

    private void applyAcademicProfile(User user, Long schoolId, Long programId) {
        School school = schoolId == null ? null : schoolRepository.findById(schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("School", schoolId));
        Program program = programId == null ? null : programRepository.findById(programId)
                .orElseThrow(() -> new ResourceNotFoundException("Program", programId));
        if (program != null && school != null && !program.getSchool().getId().equals(school.getId())) {
            throw new BadRequestException("Selected program does not belong to the selected school");
        }
        user.setSchool(school);
        user.setProgram(program);
    }

    private LocalDateTime resolveExpiry(Role role, LocalDateTime requested) {
        if (role == Role.CLUB_ORGANIZER) {
            return requested != null ? requested : LocalDateTime.now().plusYears(1);
        }
        return requested;
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }
}
