package com.usiu.campusevents.repository;

import com.usiu.campusevents.entity.Event;
import com.usiu.campusevents.entity.enums.ApprovalStatus;
import com.usiu.campusevents.entity.enums.EventStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select e from Event e where e.id = :id")
    Optional<Event> findByIdForUpdate(@Param("id") Long id);

    @Query("""
            select distinct e
            from Event e
            left join e.targetPrograms p
            where (:title is null or lower(e.title) like lower(concat('%', :title, '%')))
              and (:categoryId is null or e.category.id = :categoryId)
              and (:schoolId is null or e.targetSchool.id = :schoolId)
              and (:programId is null or p.id = :programId)
              and (:venueId is null or e.venue.id = :venueId)
              and (:fromDate is null or e.startDateTime >= :fromDate)
              and (:toDate is null or e.startDateTime <= :toDate)
              and (:approvalStatus is null or e.approvalStatus = :approvalStatus)
              and (:eventStatus is null or e.eventStatus = :eventStatus)
            """)
    Page<Event> search(
            @Param("title") String title,
            @Param("categoryId") Long categoryId,
            @Param("schoolId") Long schoolId,
            @Param("programId") Long programId,
            @Param("venueId") Long venueId,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            @Param("approvalStatus") ApprovalStatus approvalStatus,
            @Param("eventStatus") EventStatus eventStatus,
            Pageable pageable
    );

    @Query("""
            select distinct e
            from Event e
            left join e.targetPrograms p
            where e.approvalStatus = :approvalStatus
              and e.eventStatus = :eventStatus
              and e.startDateTime > :now
              and (
                    e.openToAllStudents = true
                    or (:schoolId is not null and e.targetSchool.id = :schoolId)
                    or (:programId is not null and p.id = :programId)
                    or (:yearOfStudy is not null and e.targetYearOfStudy = :yearOfStudy)
              )
            order by e.startDateTime asc
            """)
    Page<Event> findRecommendedEvents(
            @Param("schoolId") Long schoolId,
            @Param("programId") Long programId,
            @Param("yearOfStudy") Integer yearOfStudy,
            @Param("now") LocalDateTime now,
            @Param("approvalStatus") ApprovalStatus approvalStatus,
            @Param("eventStatus") EventStatus eventStatus,
            Pageable pageable
    );

    Page<Event> findByApprovalStatusAndEventStatusAndStartDateTimeAfterOrderByStartDateTimeAsc(
            ApprovalStatus approvalStatus,
            EventStatus eventStatus,
            LocalDateTime now,
            Pageable pageable
    );

    Page<Event> findByApprovalStatusAndEventStatusAndOpenToAllStudentsTrueAndStartDateTimeAfterOrderByStartDateTimeAsc(
            ApprovalStatus approvalStatus,
            EventStatus eventStatus,
            LocalDateTime now,
            Pageable pageable
    );

    Page<Event> findByApprovalStatusAndEventStatusOrderByCurrentParticipantsDesc(
            ApprovalStatus approvalStatus,
            EventStatus eventStatus,
            Pageable pageable
    );

    Page<Event> findByApprovalStatusAndEventStatusOrderByCreatedAtDesc(
            ApprovalStatus approvalStatus,
            EventStatus eventStatus,
            Pageable pageable
    );

    Page<Event> findByOrganizerId(Long organizerId, Pageable pageable);

    boolean existsByOrganizerId(Long organizerId);

    long countByApprovalStatus(ApprovalStatus approvalStatus);

    long countByEventStatus(EventStatus eventStatus);

    List<Event> findByApprovalStatusAndEventStatusAndDeadlineReminderSentFalseAndRegistrationDeadlineBetween(
            ApprovalStatus approvalStatus,
            EventStatus eventStatus,
            LocalDateTime from,
            LocalDateTime to
    );

    List<Event> findByApprovalStatusAndEventStatusAndOneDayReminderSentFalseAndStartDateTimeBetween(
            ApprovalStatus approvalStatus,
            EventStatus eventStatus,
            LocalDateTime from,
            LocalDateTime to
    );

    List<Event> findByApprovalStatusAndEventStatusAndOneHourReminderSentFalseAndStartDateTimeBetween(
            ApprovalStatus approvalStatus,
            EventStatus eventStatus,
            LocalDateTime from,
            LocalDateTime to
    );

    @Query("""
            select count(*)
            from Event e
            where e.venue.id = :venueId
              and (:eventId is null or e.id <> :eventId)
              and e.approvalStatus <> :rejectedStatus
              and e.eventStatus <> :cancelledStatus
              and e.startDateTime < :endDateTime
              and e.endDateTime > :startDateTime
            """)
    long countVenueConflicts(
            @Param("venueId") Long venueId,
            @Param("eventId") Long eventId,
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime,
            @Param("rejectedStatus") ApprovalStatus rejectedStatus,
            @Param("cancelledStatus") EventStatus cancelledStatus
    );

    @Query(value = """
            select e.*
            from events e
            where e.approval_status = 'APPROVED'
              and e.event_status = 'PUBLISHED'
              and e.start_date_time > now()
              and e.current_participants >= :minimumParticipants
            order by e.current_participants desc, e.start_date_time asc
            """, countQuery = """
            select count(*)
            from events e
            where e.approval_status = 'APPROVED'
              and e.event_status = 'PUBLISHED'
              and e.start_date_time > now()
              and e.current_participants >= :minimumParticipants
            """, nativeQuery = true)
    Page<Event> findTrendingNative(@Param("minimumParticipants") int minimumParticipants, Pageable pageable);

    @Query("""
            select distinct e
            from Event e
            left join e.targetPrograms p
            where e.approvalStatus = :approvalStatus
              and e.eventStatus = :eventStatus
              and e.startDateTime > :now
              and (
                    e.openToAllStudents = true
                    or e.targetSchool.id in :schoolIds
                    or p.id in :programIds
              )
            """)
    Page<Event> findForTargetGroups(
            @Param("schoolIds") Collection<Long> schoolIds,
            @Param("programIds") Collection<Long> programIds,
            @Param("now") LocalDateTime now,
            @Param("approvalStatus") ApprovalStatus approvalStatus,
            @Param("eventStatus") EventStatus eventStatus,
            Pageable pageable
    );
}
