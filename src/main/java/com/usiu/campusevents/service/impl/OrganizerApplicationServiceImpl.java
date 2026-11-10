package com.usiu.campusevents.service.impl;

import com.usiu.campusevents.dto.response.OrganizerApplicationResponse;
import com.usiu.campusevents.dto.response.PageResponse;
import com.usiu.campusevents.entity.OrganizerApplication;
import com.usiu.campusevents.entity.OrganizerApplicationDocument;
import com.usiu.campusevents.entity.User;
import com.usiu.campusevents.entity.enums.ApplicationStatus;
import com.usiu.campusevents.entity.enums.NotificationType;
import com.usiu.campusevents.entity.enums.Role;
import com.usiu.campusevents.entity.enums.UserStatus;
import com.usiu.campusevents.exception.BadRequestException;
import com.usiu.campusevents.exception.ResourceNotFoundException;
import com.usiu.campusevents.mapper.CampusMapper;
import com.usiu.campusevents.repository.OrganizerApplicationDocumentRepository;
import com.usiu.campusevents.repository.OrganizerApplicationRepository;
import com.usiu.campusevents.repository.UserRepository;
import com.usiu.campusevents.service.interfaces.NotificationService;
import com.usiu.campusevents.service.interfaces.OrganizerApplicationService;
import com.usiu.campusevents.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrganizerApplicationServiceImpl implements OrganizerApplicationService {

    private static final String DOCUMENT_FOLDER = "organizer-documents";
    private static final String PASSWORD_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

    private final OrganizerApplicationRepository applicationRepository;
    private final OrganizerApplicationDocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;
    private final CampusMapper mapper;

    @Value("${app.uploads.dir:./uploads}")
    private String uploadsDir;

    @Override
    @Transactional
    @PreAuthorize("hasRole('STUDENT')")
    public OrganizerApplicationResponse apply(String motivation, String experience, String eventIdea, List<MultipartFile> documents) {
        Long studentId = SecurityUtils.currentUserId();
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("User", studentId));

        applicationRepository.findFirstByStudentIdAndStatus(studentId, ApplicationStatus.PENDING)
                .ifPresent(existing -> {
                    throw new BadRequestException("You already have an organizer application under review");
                });

        String motivationValue = trimToNull(motivation);
        String experienceValue = trimToNull(experience);
        String eventIdeaValue = trimToNull(eventIdea);
        if (motivationValue == null || experienceValue == null || eventIdeaValue == null) {
            throw new BadRequestException("Motivation, experience and event idea are required");
        }

        OrganizerApplication application = OrganizerApplication.builder()
                .motivation(motivationValue)
                .experience(experienceValue)
                .eventIdea(eventIdeaValue)
                .status(ApplicationStatus.PENDING)
                .student(student)
                .documents(new ArrayList<>())
                .build();
        application = applicationRepository.save(application);

        if (documents != null) {
            for (MultipartFile file : documents) {
                if (file == null || file.isEmpty()) {
                    continue;
                }
                application.getDocuments().add(saveDocument(application, file));
            }
        }

        notificationService.notifyUsers(
                userRepository.findByRole(Role.ADMINISTRATOR),
                "New Organizer Application",
                student.getFirstName() + " " + student.getLastName() + " (" + student.getEmail()
                        + ") has applied to become a club organizer. Review it in Organizer Requests.",
                NotificationType.ORGANIZER_APPLICATION,
                null
        );

        return mapper.toOrganizerApplicationResponse(application);
    }

    @Override
    @Transactional(readOnly = true)
    public OrganizerApplicationResponse get(Long id) {
        OrganizerApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organizer application", id));
        if (!SecurityUtils.hasRole(Role.ADMINISTRATOR)
                && !application.getStudent().getId().equals(SecurityUtils.currentUserId())) {
            throw new com.usiu.campusevents.exception.UnauthorizedActionException(
                    "You can only view your own organizer application");
        }
        return mapper.toOrganizerApplicationResponse(application);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('STUDENT')")
    public PageResponse<OrganizerApplicationResponse> myApplications(Pageable pageable) {
        return PageResponse.from(applicationRepository
                .findByStudentIdOrderByCreatedAtDesc(SecurityUtils.currentUserId(), pageable)
                .map(mapper::toOrganizerApplicationResponse));
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public PageResponse<OrganizerApplicationResponse> list(ApplicationStatus status, Pageable pageable) {
        return PageResponse.from((status == null
                ? applicationRepository.findAllByOrderByCreatedAtDesc(pageable)
                : applicationRepository.findByStatusOrderByCreatedAtDesc(status, pageable))
                .map(mapper::toOrganizerApplicationResponse));
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public OrganizerApplicationResponse approve(Long id, String message) {
        OrganizerApplication application = requirePending(id);
        User student = application.getStudent();

        String tempPassword = generateTemporaryPassword();
        String organizerEmail = buildOrganizerEmail(student.getEmail());

        User organizer = User.builder()
                .firstName(student.getFirstName())
                .lastName(student.getLastName())
                .email(organizerEmail)
                .password(passwordEncoder.encode(tempPassword))
                .role(Role.CLUB_ORGANIZER)
                .status(UserStatus.ACTIVE)
                .profilePhoto(student.getProfilePhoto())
                .yearOfStudy(student.getYearOfStudy())
                .school(student.getSchool())
                .program(student.getProgram())
                .expiresAt(LocalDateTime.now().plusYears(1))
                .build();
        userRepository.save(organizer);

        application.setStatus(ApplicationStatus.APPROVED);
        application.setReviewedBy(currentAdmin());
        application.setReviewedAt(LocalDateTime.now());
        applicationRepository.save(application);

        String adminMessage = (message == null || message.isBlank()) ? "" : "\n\nMessage from the admin: " + message.trim();
        String body = "Congratulations " + student.getFirstName() + "! Your application to become a club organizer was approved."
                + " Your student account stays exactly the same.\n\n"
                + "A new Club Organizer account was created for you. Log out and sign in with these details to start creating events:"
                + "\nEmail: " + organizerEmail
                + "\nTemporary password: " + tempPassword
                + "\nAccount expires: " + organizer.getExpiresAt().toLocalDate()
                + adminMessage;
        notificationService.notifyUser(
                student,
                "Organizer Application Approved",
                body,
                NotificationType.ORGANIZER_APPROVED,
                null
        );
        notificationService.notifyUser(
                organizer,
                "Welcome to the Organizer Team",
                "Welcome " + organizer.getFirstName() + "! Your new Club Organizer account is ready."
                        + " You can change your password anytime from your Profile."
                        + adminMessage,
                NotificationType.ORGANIZER_APPROVED,
                null
        );

        return mapper.toOrganizerApplicationResponse(application);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public OrganizerApplicationResponse reject(Long id, String reason) {
        OrganizerApplication application = requirePending(id);

        application.setStatus(ApplicationStatus.REJECTED);
        application.setRejectionReason(reason);
        application.setReviewedBy(currentAdmin());
        application.setReviewedAt(LocalDateTime.now());
        applicationRepository.save(application);

        notificationService.notifyUser(
                application.getStudent(),
                "Organizer Application Rejected",
                "We're sorry, " + application.getStudent().getFirstName()
                        + ", your application to become a club organizer was not approved."
                        + (reason == null || reason.isBlank() ? "" : " Reason: " + reason),
                NotificationType.ORGANIZER_REJECTED,
                null
        );

        return mapper.toOrganizerApplicationResponse(application);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public Resource downloadDocument(Long applicationId, Long documentId) {
        OrganizerApplicationDocument document = documentRepository
                .findByIdAndApplicationId(documentId, applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", documentId));
        Path path = Paths.get(uploadsDir, DOCUMENT_FOLDER, document.getStoredName()).toAbsolutePath().normalize();
        Resource resource = new FileSystemResource(path);
        if (!resource.exists() || !resource.isReadable()) {
            throw new ResourceNotFoundException("Document file not found on the server");
        }
        return resource;
    }

    private OrganizerApplication requirePending(Long id) {
        OrganizerApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organizer application", id));
        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new BadRequestException("This application has already been reviewed");
        }
        return application;
    }

    private User currentAdmin() {
        return userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private OrganizerApplicationDocument saveDocument(OrganizerApplication application, MultipartFile file) {
        try {
            String storedName = java.util.UUID.randomUUID() + "-" + sanitize(file.getOriginalFilename());
            Path folder = Paths.get(uploadsDir, DOCUMENT_FOLDER).toAbsolutePath().normalize();
            Files.createDirectories(folder);
            Path target = folder.resolve(storedName);
            file.transferTo(target.toFile());
            OrganizerApplicationDocument document = OrganizerApplicationDocument.builder()
                    .fileName(file.getOriginalFilename() == null ? "document" : file.getOriginalFilename())
                    .storedName(storedName)
                    .contentType(file.getContentType())
                    .fileSize(file.getSize())
                    .application(application)
                    .build();
            return documentRepository.save(document);
        } catch (IOException ex) {
            throw new BadRequestException("Failed to store uploaded document: " + ex.getMessage());
        }
    }

    private String generateTemporaryPassword() {
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder("Org@");
        for (int i = 0; i < 9; i++) {
            sb.append(PASSWORD_ALPHABET.charAt(random.nextInt(PASSWORD_ALPHABET.length())));
        }
        return sb.toString();
    }

    private String buildOrganizerEmail(String studentEmail) {
        String email = studentEmail.toLowerCase();
        int at = email.indexOf('@');
        String local = at > 0 ? email.substring(0, at) : email;
        String domain = at >= 0 ? email.substring(at) : "";
        String candidate = local + ".organizer" + domain;
        int suffix = 1;
        while (userRepository.existsByEmailIgnoreCase(candidate)) {
            suffix++;
            candidate = local + ".organizer" + suffix + domain;
        }
        return candidate;
    }

    private String sanitize(String name) {
        if (name == null || name.isBlank()) {
            return "document";
        }
        return name.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
