package com.usiu.campusevents.service.interfaces;

import com.usiu.campusevents.dto.request.AnnouncementRequest;
import com.usiu.campusevents.dto.response.AnnouncementResponse;
import com.usiu.campusevents.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

public interface AnnouncementService {

    AnnouncementResponse create(AnnouncementRequest request);

    AnnouncementResponse update(Long id, AnnouncementRequest request);

    AnnouncementResponse get(Long id);

    PageResponse<AnnouncementResponse> listForEvent(Long eventId, Pageable pageable);

    void delete(Long id);
}
