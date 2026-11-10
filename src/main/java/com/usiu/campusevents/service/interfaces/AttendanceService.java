package com.usiu.campusevents.service.interfaces;

import com.usiu.campusevents.dto.request.AttendanceRequest;
import com.usiu.campusevents.dto.response.AttendanceResponse;
import com.usiu.campusevents.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

public interface AttendanceService {

    AttendanceResponse record(AttendanceRequest request);

    AttendanceResponse get(Long id);

    PageResponse<AttendanceResponse> list(Pageable pageable);
}
