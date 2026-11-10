package com.usiu.campusevents.controller;

import com.usiu.campusevents.dto.request.AttendanceRequest;
import com.usiu.campusevents.dto.response.AttendanceResponse;
import com.usiu.campusevents.dto.response.PageResponse;
import com.usiu.campusevents.service.interfaces.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AttendanceResponse record(@Valid @RequestBody AttendanceRequest request) {
        return attendanceService.record(request);
    }

    @GetMapping("/{id}")
    public AttendanceResponse get(@PathVariable Long id) {
        return attendanceService.get(id);
    }

    @GetMapping
    public PageResponse<AttendanceResponse> list(Pageable pageable) {
        return attendanceService.list(pageable);
    }
}
