package com.usiu.campusevents.repository;

import com.usiu.campusevents.entity.User;
import com.usiu.campusevents.entity.enums.Role;
import com.usiu.campusevents.entity.enums.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByRegistrationNumberIgnoreCase(String registrationNumber);

    boolean existsByEmployeeNumberIgnoreCase(String employeeNumber);

    Page<User> findByRole(Role role, Pageable pageable);

    List<User> findByRole(Role role);

    List<User> findByRoleIn(Collection<Role> roles);

    List<User> findByStatus(UserStatus status);

    List<User> findByPasswordStartingWith(String prefix);

    long countByRole(Role role);

    List<User> findByRoleAndExpiresAtBeforeAndStatus(Role role, java.time.LocalDateTime expiresAtBefore, UserStatus status);

    @Query("""
            select distinct u
            from User u
            where u.role = :role
              and u.status = :status
              and (
                    :openToAll = true
                    or (:schoolId is not null and u.school.id = :schoolId)
                    or u.program.id in :programIds
                    or (:targetYearOfStudy is not null and u.yearOfStudy = :targetYearOfStudy)
              )
            """)
    List<User> findStudentsMatchingTargets(
            @Param("role") Role role,
            @Param("status") UserStatus status,
            @Param("openToAll") boolean openToAll,
            @Param("schoolId") Long schoolId,
            @Param("programIds") Collection<Long> programIds,
            @Param("targetYearOfStudy") Integer targetYearOfStudy
    );
}
