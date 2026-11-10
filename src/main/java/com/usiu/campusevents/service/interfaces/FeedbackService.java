package com.usiu.campusevents.service.interfaces;

import com.usiu.campusevents.dto.request.FeedbackRequest;
import com.usiu.campusevents.dto.response.EventFeedbackSummaryResponse;
import com.usiu.campusevents.dto.response.EventResponse;
import com.usiu.campusevents.dto.response.FeedbackEventSummaryResponse;
import com.usiu.campusevents.dto.response.FeedbackResponse;

import java.util.List;

public interface FeedbackService {

    FeedbackResponse submit(Long eventId, FeedbackRequest request);

    EventFeedbackSummaryResponse eventSummary(Long eventId);

    List<FeedbackResponse> myFeedback();

    List<EventResponse> pendingFeedbackEvents();

    List<FeedbackEventSummaryResponse> eventList();
}
