package com.usiu.campusevents.controller;

import com.usiu.campusevents.dto.request.EventDecisionRequest;
import com.usiu.campusevents.dto.request.EventRequest;
import com.usiu.campusevents.dto.response.DashboardResponse;
import com.usiu.campusevents.dto.response.EventResponse;
import com.usiu.campusevents.dto.response.PageResponse;
import com.usiu.campusevents.service.interfaces.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/events")
public class EventController {

    private final EventService eventService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EventResponse create(@Valid @RequestBody EventRequest request) {
        return eventService.create(request);
    }

    @PutMapping("/{id}")
    public EventResponse update(@PathVariable Long id, @Valid @RequestBody EventRequest request) {
        return eventService.update(id, request);
    }

    @PostMapping("/{id}/approve")
    public EventResponse approve(@PathVariable Long id, @RequestBody(required = false) EventDecisionRequest request) {
        return eventService.approve(id, request);
    }

    @PostMapping("/{id}/reject")
    public EventResponse reject(@PathVariable Long id, @RequestBody(required = false) EventDecisionRequest request) {
        return eventService.reject(id, request);
    }

    @PostMapping("/{id}/cancel")
    public EventResponse cancel(@PathVariable Long id, @RequestBody(required = false) EventDecisionRequest request) {
        return eventService.cancel(id, request);
    }

    @GetMapping("/{id}")
    public EventResponse get(@PathVariable Long id) {
        return eventService.get(id);
    }

    @GetMapping
    public PageResponse<EventResponse> search(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long schoolId,
            @RequestParam(required = false) Long programId,
            @RequestParam(required = false) Long venueId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            Pageable pageable
    ) {
        return eventService.search(title, categoryId, schoolId, programId, venueId, fromDate, toDate, pageable);
    }

    @GetMapping("/dashboard")
    public DashboardResponse dashboard() {
        return eventService.studentDashboard();
    }

    @GetMapping("/organizer")
    public PageResponse<EventResponse> organizerEvents(Pageable pageable) {
        return eventService.organizerEvents(pageable);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        eventService.delete(id);
    }
}
