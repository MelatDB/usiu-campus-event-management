package com.usiu.campusevents.entity;

import com.usiu.campusevents.entity.enums.VenueAvailabilityStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "venues",
        uniqueConstraints = @UniqueConstraint(name = "uk_venue_location", columnNames = {"building", "room_number"})
)
public class Venue extends AuditableEntity {

    @Column(name = "venue_name", nullable = false, length = 150)
    private String venueName;

    @Column(nullable = false, length = 100)
    private String building;

    @Column(name = "room_number", length = 50)
    private String roomNumber;

    @Column(nullable = false)
    private Integer capacity;

    @Enumerated(EnumType.STRING)
    @Column(name = "availability_status", nullable = false, length = 40)
    private VenueAvailabilityStatus availabilityStatus;

    @Builder.Default
    @OneToMany(mappedBy = "venue", fetch = FetchType.LAZY)
    private List<Event> events = new ArrayList<>();
}
