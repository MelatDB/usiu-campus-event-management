package com.usiu.campusevents.repository;

import com.usiu.campusevents.entity.Notification;
import com.usiu.campusevents.entity.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUserIdOrderBySentAtDesc(Long userId, Pageable pageable);

    Page<Notification> findByUserIdAndNotificationTypeOrderBySentAtDesc(
            Long userId,
            NotificationType notificationType,
            Pageable pageable
    );

    List<Notification> findByUserIdAndReadFalse(Long userId);

    void deleteByUserId(Long userId);

    long countByUserIdAndReadFalse(Long userId);
}
