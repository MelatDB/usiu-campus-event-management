package com.usiu.campusevents.repository;

import com.usiu.campusevents.entity.FavoriteEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FavoriteEventRepository extends JpaRepository<FavoriteEvent, Long> {

    Optional<FavoriteEvent> findByStudentIdAndEventId(Long studentId, Long eventId);

    boolean existsByStudentIdAndEventId(Long studentId, Long eventId);

    Page<FavoriteEvent> findByStudentId(Long studentId, Pageable pageable);

    void deleteByStudentId(Long studentId);
}
