package com.usiu.campusevents.controller;

import com.usiu.campusevents.dto.request.OrganizerApproveRequest;
import com.usiu.campusevents.dto.request.OrganizerDecisionRequest;
import com.usiu.campusevents.dto.response.OrganizerApplicationResponse;
import com.usiu.campusevents.dto.response.PageResponse;
import com.usiu.campusevents.entity.enums.ApplicationStatus;
import com.usiu.campusevents.service.interfaces.OrganizerApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/organizer-applications")
public class OrganizerApplicationController {

    private final OrganizerApplicationService organizerApplicationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrganizerApplicationResponse apply(
            @RequestParam(required = false) String motivation,
            @RequestParam(required = false) String experience,
            @RequestParam(required = false) String eventIdea,
            @RequestParam(value = "documents", required = false) List<MultipartFile> documents
    ) {
        return organizerApplicationService.apply(motivation, experience, eventIdea, documents);
    }

    @GetMapping("/mine")
    public PageResponse<OrganizerApplicationResponse> myApplications(Pageable pageable) {
        return organizerApplicationService.myApplications(pageable);
    }

    @GetMapping
    public PageResponse<OrganizerApplicationResponse> list(
            @RequestParam(required = false) ApplicationStatus status,
            Pageable pageable
    ) {
        return organizerApplicationService.list(status, pageable);
    }

    @GetMapping("/{id}")
    public OrganizerApplicationResponse get(@PathVariable Long id) {
        return organizerApplicationService.get(id);
    }

    @PostMapping("/{id}/approve")
    public OrganizerApplicationResponse approve(
            @PathVariable Long id,
            @RequestBody(required = false) OrganizerApproveRequest request
    ) {
        return organizerApplicationService.approve(id, request == null ? null : request.message());
    }

    @PostMapping("/{id}/reject")
    public OrganizerApplicationResponse reject(@PathVariable Long id, @Valid @RequestBody OrganizerDecisionRequest request) {
        return organizerApplicationService.reject(id, request.reason());
    }

    @GetMapping("/{id}/documents/{documentId}")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long id,
            @PathVariable Long documentId
    ) {
        Resource resource = organizerApplicationService.downloadDocument(id, documentId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"application-document\"")
                .body(resource);
    }
}
