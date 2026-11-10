package com.usiu.campusevents.entity;

import com.usiu.campusevents.entity.enums.ClubStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "student_clubs")
public class StudentClub extends AuditableEntity {

    @Column(name = "club_name", nullable = false, unique = true, length = 150)
    private String clubName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "advisor_name", length = 150)
    private String advisorName;

    private String logo;

    @Column(name = "created_date", nullable = false)
    private LocalDate createdDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ClubStatus status;

    @Builder.Default
    @OneToMany(mappedBy = "club", fetch = FetchType.LAZY)
    private List<Event> events = new ArrayList<>();
}
