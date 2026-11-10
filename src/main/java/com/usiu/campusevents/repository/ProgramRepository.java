package com.usiu.campusevents.repository;

import com.usiu.campusevents.entity.Program;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProgramRepository extends JpaRepository<Program, Long> {

    Page<Program> findBySchoolId(Long schoolId, Pageable pageable);

    List<Program> findBySchoolId(Long schoolId);

    boolean existsByProgramNameIgnoreCaseAndSchoolId(String programName, Long schoolId);
}
