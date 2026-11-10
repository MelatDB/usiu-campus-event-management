package com.usiu.campusevents.repository;

import com.usiu.campusevents.entity.OrganizerApplicationDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrganizerApplicationDocumentRepository extends JpaRepository<OrganizerApplicationDocument, Long> {

    Optional<OrganizerApplicationDocument> findByIdAndApplicationId(Long id, Long applicationId);
}
