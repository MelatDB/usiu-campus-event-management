package com.usiu.campusevents.controller;

import com.usiu.campusevents.dto.request.RegistrationRequest;
import com.usiu.campusevents.dto.response.PageResponse;
import com.usiu.campusevents.dto.response.RegistrationResponse;
import com.usiu.campusevents.service.interfaces.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/registrations")
public class RegistrationController {

    private final RegistrationService registrationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RegistrationResponse register(@Valid @RequestBody RegistrationRequest request) {
        return registrationService.register(request);
    }

    @PostMapping("/{id}/cancel")
    public RegistrationResponse cancel(@PathVariable Long id) {
        return registrationService.cancel(id);
    }

    @GetMapping("/{id}")
    public RegistrationResponse get(@PathVariable Long id) {
        return registrationService.get(id);
    }

    @GetMapping("/mine")
    public PageResponse<RegistrationResponse> mine(Pageable pageable) {
        return registrationService.myRegistrations(pageable);
    }

    @GetMapping("/events/{eventId}")
    public PageResponse<RegistrationResponse> eventRegistrations(@PathVariable Long eventId, Pageable pageable) {
        return registrationService.eventRegistrations(eventId, pageable);
    }

    @GetMapping("/{id}/ticket")
    public ResponseEntity<byte[]> downloadTicket(@PathVariable Long id) {
        byte[] ticket = registrationService.generateTicket(id);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG);
        headers.setContentLength(ticket.length);
        headers.setContentDisposition(ContentDisposition.attachment().filename("event-ticket-" + id + ".png").build());
        return new ResponseEntity<>(ticket, headers, HttpStatus.OK);
    }
}
