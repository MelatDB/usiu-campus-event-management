package com.usiu.campusevents.websocket;

import com.usiu.campusevents.dto.response.NotificationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationRealtimePublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public void publish(Long userId, NotificationResponse notification) {
        messagingTemplate.convertAndSend("/topic/users/" + userId + "/notifications", notification);
    }
}
