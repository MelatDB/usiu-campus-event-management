package com.usiu.campusevents.repository;

import com.usiu.campusevents.entity.StudentClub;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentClubRepository extends JpaRepository<StudentClub, Long> {

    boolean existsByClubNameIgnoreCase(String clubName);
}
