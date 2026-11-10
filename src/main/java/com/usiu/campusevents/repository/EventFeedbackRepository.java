package com.usiu.campusevents.repository;

import com.usiu.campusevents.entity.Event;
import com.usiu.campusevents.entity.EventFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EventFeedbackRepository extends JpaRepository<EventFeedback, Long> {

    Optional<EventFeedback> findByStudentIdAndEventId(Long studentId, Long eventId);

    boolean existsByStudentIdAndEventId(Long studentId, Long eventId);

    List<EventFeedback> findByEventIdOrderByCreatedAtDesc(Long eventId);

    List<EventFeedback> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    long countByEventIdAndRating(Long eventId, Integer rating);

    @Query("""
            select distinct r.event
            from Registration r
            where r.student.id = :studentId
              and r.registrationStatus = 'REGISTERED'
              and r.event.approvalStatus = 'APPROVED'
              and r.event.eventStatus <> 'CANCELLED'
              and r.event.endDateTime < :now
              and not exists (
                  select f from EventFeedback f
                  where f.event = r.event and f.student.id = :studentId
              )
            order by r.event.endDateTime desc
            """)
    List<Event> findPendingFeedbackEvents(@Param("studentId") Long studentId, @Param("now") LocalDateTime now);

    @Query("select avg(f.rating) from EventFeedback f where f.event.id = :eventId")
    Double averageRating(@Param("eventId") Long eventId);

    @Query("select count(f) from EventFeedback f where f.event.id = :eventId")
    long countByEventId(@Param("eventId") Long eventId);

    interface EventFeedbackAggregate {
        Long getEventId();

        String getEventTitle();

        String getOrganizerFirstName();

        String getOrganizerLastName();

        Double getAverageRating();

        Long getFeedbackCount();
    }

    @Query("""
            select f.event.id as eventId,
                   f.event.title as eventTitle,
                   f.event.organizer.firstName as organizerFirstName,
                   f.event.organizer.lastName as organizerLastName,
                   avg(f.rating) as averageRating,
                   count(f) as feedbackCount
            from EventFeedback f
            where :organizerId is null or f.event.organizer.id = :organizerId
            group by f.event.id, f.event.title, f.event.organizer.firstName, f.event.organizer.lastName
            order by count(f) desc
            """)
    List<EventFeedbackAggregate> findFeedbackEventAggregates(@Param("organizerId") Long organizerId);
}
