package com.usiu.campusevents.repository;

import com.usiu.campusevents.entity.School;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SchoolRepository extends JpaRepository<School, Long> {

    Optional<School> findByAbbreviationIgnoreCase(String abbreviation);

    boolean existsByAbbreviationIgnoreCase(String abbreviation);

    boolean existsBySchoolNameIgnoreCase(String schoolName);
}
