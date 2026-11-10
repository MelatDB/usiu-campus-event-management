package com.usiu.campusevents.controller;

import com.usiu.campusevents.dto.request.FeedbackRequest;
import com.usiu.campusevents.dto.response.EventFeedbackSummaryResponse;
import com.usiu.campusevents.dto.response.EventResponse;
import com.usiu.campusevents.dto.response.FeedbackEventSummaryResponse;
import com.usiu.campusevents.dto.response.FeedbackResponse;
import com.usiu.campusevents.service.interfaces.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping("/events/{eventId}")
    @ResponseStatus(HttpStatus.CREATED)
    public FeedbackResponse submit(@PathVariable Long eventId, @Valid @RequestBody FeedbackRequest request) {
        return feedbackService.submit(eventId, request);
    }

    @GetMapping("/events")
    public List<FeedbackEventSummaryResponse> events() {
        return feedbackService.eventList();
    }

    @GetMapping("/events/{eventId}")
    public EventFeedbackSummaryResponse eventSummary(@PathVariable Long eventId) {
        return feedbackService.eventSummary(eventId);
    }

    @GetMapping("/mine")
    public List<FeedbackResponse> mine() {
        return feedbackService.myFeedback();
    }

    @GetMapping("/pending")
    public List<EventResponse> pending() {
        return feedbackService.pendingFeedbackEvents();
    }
}
