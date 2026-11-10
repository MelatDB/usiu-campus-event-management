package com.usiu.campusevents.repository;

import com.usiu.campusevents.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findByRegistrationId(Long registrationId);
}
