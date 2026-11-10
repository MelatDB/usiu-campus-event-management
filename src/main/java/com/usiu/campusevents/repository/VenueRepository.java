package com.usiu.campusevents.repository;

import com.usiu.campusevents.entity.Venue;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VenueRepository extends JpaRepository<Venue, Long> {

    boolean existsByBuildingIgnoreCaseAndRoomNumberIgnoreCase(String building, String roomNumber);
}
