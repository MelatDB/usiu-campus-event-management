package com.usiu.campusevents.mapper;

import com.usiu.campusevents.dto.response.AnnouncementResponse;
import com.usiu.campusevents.dto.response.AttendanceResponse;
import com.usiu.campusevents.dto.response.CategoryResponse;
import com.usiu.campusevents.dto.response.ClubResponse;
import com.usiu.campusevents.dto.response.EventResponse;
import com.usiu.campusevents.dto.response.FavoriteResponse;
import com.usiu.campusevents.dto.response.NotificationResponse;
import com.usiu.campusevents.dto.response.OrganizerApplicationDocumentResponse;
import com.usiu.campusevents.dto.response.OrganizerApplicationResponse;
import com.usiu.campusevents.dto.response.ProgramResponse;
import com.usiu.campusevents.dto.response.RegistrationResponse;
import com.usiu.campusevents.dto.response.SchoolResponse;
import com.usiu.campusevents.dto.response.UserResponse;
import com.usiu.campusevents.dto.response.VenueResponse;
import com.usiu.campusevents.entity.Announcement;
import com.usiu.campusevents.entity.Attendance;
import com.usiu.campusevents.entity.Event;
import com.usiu.campusevents.entity.EventCategory;
import com.usiu.campusevents.entity.FavoriteEvent;
import com.usiu.campusevents.entity.Notification;
import com.usiu.campusevents.entity.OrganizerApplication;
import com.usiu.campusevents.entity.OrganizerApplicationDocument;
import com.usiu.campusevents.entity.Program;
import com.usiu.campusevents.entity.Registration;
import com.usiu.campusevents.entity.School;
import com.usiu.campusevents.entity.StudentClub;
import com.usiu.campusevents.entity.User;
import com.usiu.campusevents.entity.Venue;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

@Component
public class CampusMapper {

    public UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getRegistrationNumber(),
                user.getEmployeeNumber(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getRole(),
                user.getStatus(),
                user.getProfilePhoto(),
                user.getYearOfStudy(),
                user.getSchool() == null ? null : user.getSchool().getId(),
                user.getSchool() == null ? null : user.getSchool().getSchoolName(),
                user.getProgram() == null ? null : user.getProgram().getId(),
                user.getProgram() == null ? null : user.getProgram().getProgramName(),
                user.getExpiresAt(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    public SchoolResponse toSchoolResponse(School school) {
        return new SchoolResponse(
                school.getId(),
                school.getSchoolName(),
                school.getAbbreviation(),
                school.getDescription(),
                school.getPrograms() == null ? 0 : school.getPrograms().size()
        );
    }

    public ProgramResponse toProgramResponse(Program program) {
        return new ProgramResponse(
                program.getId(),
                program.getProgramName(),
                program.getDescription(),
                program.getSchool() == null ? null : program.getSchool().getId(),
                program.getSchool() == null ? null : program.getSchool().getSchoolName()
        );
    }

    public ClubResponse toClubResponse(StudentClub club) {
        return new ClubResponse(
                club.getId(),
                club.getClubName(),
                club.getDescription(),
                club.getAdvisorName(),
                club.getLogo(),
                club.getCreatedDate(),
                club.getStatus()
        );
    }

    public CategoryResponse toCategoryResponse(EventCategory category) {
        return new CategoryResponse(
                category.getId(),
                category.getCategoryName(),
                category.getDescription()
        );
    }

    public VenueResponse toVenueResponse(Venue venue) {
        return new VenueResponse(
                venue.getId(),
                venue.getVenueName(),
                venue.getBuilding(),
                venue.getRoomNumber(),
                venue.getCapacity(),
                venue.getAvailabilityStatus()
        );
    }

    public EventResponse toEventResponse(Event event) {
        List<Program> targetPrograms = event.getTargetPrograms().stream()
                .sorted(Comparator.comparing(Program::getProgramName))
                .toList();
        return new EventResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getEventImage(),
                event.getStartDateTime(),
                event.getEndDateTime(),
                event.getRegistrationDeadline(),
                event.getMaximumCapacity(),
                event.getCurrentParticipants(),
                event.getEventStatus(),
                event.getApprovalStatus(),
                event.getOpenToAllStudents(),
                event.getTargetYearOfStudy(),
                event.getClub().getId(),
                event.getClub().getClubName(),
                event.getOrganizer().getId(),
                fullName(event.getOrganizer()),
                event.getCategory().getId(),
                event.getCategory().getCategoryName(),
                event.getVenue().getId(),
                event.getVenue().getVenueName(),
                event.getTargetSchool() == null ? null : event.getTargetSchool().getId(),
                event.getTargetSchool() == null ? null : event.getTargetSchool().getSchoolName(),
                targetPrograms.stream().map(Program::getId).toList(),
                targetPrograms.stream().map(Program::getProgramName).toList(),
                event.getCreatedAt(),
                event.getUpdatedAt()
        );
    }

    public RegistrationResponse toRegistrationResponse(Registration registration) {
        return new RegistrationResponse(
                registration.getId(),
                registration.getRegistrationDate(),
                registration.getRegistrationStatus(),
                registration.getAttendanceStatus(),
                registration.getStudent().getId(),
                fullName(registration.getStudent()),
                registration.getEvent().getId(),
                registration.getEvent().getTitle(),
                registration.getEvent().getStartDateTime()
        );
    }

    public AttendanceResponse toAttendanceResponse(Attendance attendance) {
        Registration registration = attendance.getRegistration();
        return new AttendanceResponse(
                attendance.getId(),
                attendance.getCheckInTime(),
                attendance.getAttendanceStatus(),
                registration.getId(),
                registration.getStudent().getId(),
                fullName(registration.getStudent()),
                registration.getEvent().getId(),
                registration.getEvent().getTitle()
        );
    }

    public AnnouncementResponse toAnnouncementResponse(Announcement announcement) {
        return new AnnouncementResponse(
                announcement.getId(),
                announcement.getTitle(),
                announcement.getMessage(),
                announcement.getPostedDate(),
                announcement.getEvent().getId(),
                announcement.getEvent().getTitle()
        );
    }

    public NotificationResponse toNotificationResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getNotificationType(),
                notification.getRead(),
                notification.getSentAt(),
                notification.getReadAt(),
                notification.getEvent() == null ? null : notification.getEvent().getId(),
                notification.getEvent() == null ? null : notification.getEvent().getTitle()
        );
    }

    public FavoriteResponse toFavoriteResponse(FavoriteEvent favoriteEvent) {
        return new FavoriteResponse(
                favoriteEvent.getId(),
                favoriteEvent.getEvent().getId(),
                favoriteEvent.getEvent().getTitle(),
                favoriteEvent.getEvent().getStartDateTime(),
                favoriteEvent.getCreatedAt()
        );
    }

    public OrganizerApplicationResponse toOrganizerApplicationResponse(OrganizerApplication application) {
        return new OrganizerApplicationResponse(
                application.getId(),
                application.getStudent().getId(),
                fullName(application.getStudent()),
                application.getStudent().getEmail(),
                application.getStudent().getRegistrationNumber(),
                application.getMotivation(),
                application.getExperience(),
                application.getEventIdea(),
                application.getDocuments().stream().map(this::toOrganizerApplicationDocumentResponse).toList(),
                application.getStatus(),
                application.getRejectionReason(),
                application.getReviewedBy() == null ? null : application.getReviewedBy().getId(),
                application.getReviewedBy() == null ? null : fullName(application.getReviewedBy()),
                application.getReviewedAt(),
                application.getCreatedAt(),
                application.getUpdatedAt()
        );
    }

    public OrganizerApplicationDocumentResponse toOrganizerApplicationDocumentResponse(OrganizerApplicationDocument document) {
        return new OrganizerApplicationDocumentResponse(
                document.getId(),
                document.getFileName(),
                document.getContentType(),
                document.getFileSize()
        );
    }

    private String fullName(User user) {
        return user.getFirstName() + " " + user.getLastName();
    }
}
