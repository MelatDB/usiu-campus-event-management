package com.usiu.campusevents.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
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
@Table(name = "schools")
public class School extends AuditableEntity {

    @Column(name = "school_name", nullable = false, unique = true, length = 150)
    private String schoolName;

    @Column(nullable = false, unique = true, length = 20)
    private String abbreviation;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    @OneToMany(mappedBy = "school", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Program> programs = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "school", fetch = FetchType.LAZY)
    private List<User> students = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "targetSchool", fetch = FetchType.LAZY)
    private List<Event> targetedEvents = new ArrayList<>();
}
