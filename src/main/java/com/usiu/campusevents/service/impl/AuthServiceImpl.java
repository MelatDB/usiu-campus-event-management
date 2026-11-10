package com.usiu.campusevents.service.impl;

import com.usiu.campusevents.dto.request.ChangePasswordRequest;
import com.usiu.campusevents.dto.request.LoginRequest;
import com.usiu.campusevents.dto.request.StudentRegistrationRequest;
import com.usiu.campusevents.dto.response.AuthResponse;
import com.usiu.campusevents.entity.Program;
import com.usiu.campusevents.entity.School;
import com.usiu.campusevents.entity.User;
import com.usiu.campusevents.entity.enums.Role;
import com.usiu.campusevents.entity.enums.UserStatus;
import com.usiu.campusevents.exception.BadRequestException;
import com.usiu.campusevents.exception.ResourceNotFoundException;
import com.usiu.campusevents.mapper.CampusMapper;
import com.usiu.campusevents.repository.ProgramRepository;
import com.usiu.campusevents.repository.SchoolRepository;
import com.usiu.campusevents.repository.UserRepository;
import com.usiu.campusevents.security.JwtService;
import com.usiu.campusevents.security.UserPrincipal;
import com.usiu.campusevents.service.interfaces.AuthService;
import com.usiu.campusevents.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;
    private final ProgramRepository programRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CampusMapper mapper;

    @Override
    @Transactional
    public AuthResponse registerStudent(StudentRegistrationRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new BadRequestException("Email is already registered");
        }
        if (userRepository.existsByRegistrationNumberIgnoreCase(request.registrationNumber())) {
            throw new BadRequestException("Registration number is already registered");
        }

        School school = schoolRepository.findById(request.schoolId())
                .orElseThrow(() -> new ResourceNotFoundException("School", request.schoolId()));
        Program program = programRepository.findById(request.programId())
                .orElseThrow(() -> new ResourceNotFoundException("Program", request.programId()));
        if (!program.getSchool().getId().equals(school.getId())) {
            throw new BadRequestException("Selected program does not belong to the selected school");
        }

        User user = User.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .registrationNumber(request.registrationNumber())
                .email(request.email().toLowerCase())
                .password(passwordEncoder.encode(request.password()))
                .phoneNumber(request.phoneNumber())
                .role(Role.STUDENT)
                .status(UserStatus.ACTIVE)
                .profilePhoto(request.profilePhoto())
                .yearOfStudy(request.yearOfStudy())
                .school(school)
                .program(program)
                .build();
        user = userRepository.save(user);
        String token = jwtService.generateToken(UserPrincipal.from(user));
        return new AuthResponse(token, "Bearer", jwtService.getExpirationMs(), mapper.toUserResponse(user));
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email()).orElse(null);
        if (user != null && isExpiredOrganizer(user)) {
            throw new BadRequestException("Your organizer account expired on " + user.getExpiresAt().toLocalDate()
                    + ". Please contact an administrator to renew it.");
        }
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        if (user == null) {
            user = userRepository.findByEmailIgnoreCase(request.email())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        }
        String token = jwtService.generateToken(UserPrincipal.from(user));
        return new AuthResponse(token, "Bearer", jwtService.getExpirationMs(), mapper.toUserResponse(user));
    }

    private boolean isExpiredOrganizer(User user) {
        return user.getRole() == Role.CLUB_ORGANIZER
                && user.getExpiresAt() != null
                && user.getExpiresAt().isBefore(LocalDateTime.now());
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        if (passwordEncoder.matches(request.newPassword(), user.getPassword())) {
            throw new BadRequestException("New password must be different from the current password");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
    }
}
