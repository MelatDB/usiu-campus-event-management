package com.usiu.campusevents.service.interfaces;

import com.usiu.campusevents.dto.request.RegistrationRequest;
import com.usiu.campusevents.dto.response.PageResponse;
import com.usiu.campusevents.dto.response.RegistrationResponse;
import org.springframework.data.domain.Pageable;

public interface RegistrationService {

    RegistrationResponse register(RegistrationRequest request);

    RegistrationResponse cancel(Long registrationId);

    RegistrationResponse get(Long id);

    byte[] generateTicket(Long id);

    PageResponse<RegistrationResponse> myRegistrations(Pageable pageable);

    PageResponse<RegistrationResponse> eventRegistrations(Long eventId, Pageable pageable);
}
