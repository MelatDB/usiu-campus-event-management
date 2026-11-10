package com.usiu.campusevents.service.interfaces;

import com.usiu.campusevents.dto.response.OrganizerApplicationResponse;
import com.usiu.campusevents.dto.response.PageResponse;
import com.usiu.campusevents.entity.enums.ApplicationStatus;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface OrganizerApplicationService {

    OrganizerApplicationResponse apply(String motivation, String experience, String eventIdea, List<MultipartFile> documents);

    OrganizerApplicationResponse get(Long id);

    PageResponse<OrganizerApplicationResponse> myApplications(Pageable pageable);

    PageResponse<OrganizerApplicationResponse> list(ApplicationStatus status, Pageable pageable);

    OrganizerApplicationResponse approve(Long id, String message);

    OrganizerApplicationResponse reject(Long id, String reason);

    Resource downloadDocument(Long applicationId, Long documentId);
}
