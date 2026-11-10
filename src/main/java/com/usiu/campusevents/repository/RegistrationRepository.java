package com.usiu.campusevents.repository;

import com.usiu.campusevents.entity.Registration;
import com.usiu.campusevents.entity.enums.RegistrationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    Optional<Registration> findByStudentIdAndEventId(Long studentId, Long eventId);

    void deleteByStudentId(Long studentId);

    boolean existsByStudentIdAndEventIdAndRegistrationStatus(Long studentId, Long eventId, RegistrationStatus status);

    Page<Registration> findByStudentId(Long studentId, Pageable pageable);

    Page<Registration> findByEventId(Long eventId, Pageable pageable);

    List<Registration> findByEventIdAndRegistrationStatus(Long eventId, RegistrationStatus status);

    long countByRegistrationStatus(RegistrationStatus status);

    @Query(value = """
            select count(*)
            from registrations
            where event_id = :eventId
              and registration_status = 'REGISTERED'
            """, nativeQuery = true)
    long countActiveRegistrationsNative(@Param("eventId") Long eventId);
}
