package com.usiu.campusevents.service.interfaces;

import com.usiu.campusevents.dto.request.EventDecisionRequest;
import com.usiu.campusevents.dto.request.EventRequest;
import com.usiu.campusevents.dto.response.DashboardResponse;
import com.usiu.campusevents.dto.response.EventResponse;
import com.usiu.campusevents.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface EventService {

    EventResponse create(EventRequest request);

    EventResponse update(Long id, EventRequest request);

    EventResponse approve(Long id, EventDecisionRequest request);

    EventResponse reject(Long id, EventDecisionRequest request);

    EventResponse cancel(Long id, EventDecisionRequest request);

    EventResponse get(Long id);

    PageResponse<EventResponse> search(
            String title,
            Long categoryId,
            Long schoolId,
            Long programId,
            Long venueId,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            Pageable pageable
    );

    PageResponse<EventResponse> organizerEvents(Pageable pageable);

    DashboardResponse studentDashboard();

    void delete(Long id);
}
