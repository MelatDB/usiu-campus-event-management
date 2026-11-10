package com.usiu.campusevents.controller;

import com.usiu.campusevents.dto.response.AnalyticsResponse;
import com.usiu.campusevents.service.interfaces.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/overview")
    public AnalyticsResponse overview() {
        return analyticsService.overview();
    }
}
