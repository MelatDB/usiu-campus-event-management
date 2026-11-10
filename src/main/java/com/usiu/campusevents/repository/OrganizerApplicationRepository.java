package com.usiu.campusevents.repository;

import com.usiu.campusevents.entity.OrganizerApplication;
import com.usiu.campusevents.entity.enums.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrganizerApplicationRepository extends JpaRepository<OrganizerApplication, Long> {

    Optional<OrganizerApplication> findFirstByStudentIdOrderByCreatedAtDesc(Long studentId);

    Optional<OrganizerApplication> findFirstByStudentIdAndStatus(Long studentId, ApplicationStatus status);

    Page<OrganizerApplication> findByStatusOrderByCreatedAtDesc(ApplicationStatus status, Pageable pageable);

    Page<OrganizerApplication> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<OrganizerApplication> findByStudentIdOrderByCreatedAtDesc(Long studentId, Pageable pageable);

    List<OrganizerApplication> findByStatus(ApplicationStatus status);
}
