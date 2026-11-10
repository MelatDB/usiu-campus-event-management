package com.usiu.campusevents.repository;

import com.usiu.campusevents.entity.EventCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventCategoryRepository extends JpaRepository<EventCategory, Long> {

    boolean existsByCategoryNameIgnoreCase(String categoryName);
}
