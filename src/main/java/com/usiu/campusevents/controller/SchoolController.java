package com.usiu.campusevents.controller;

import com.usiu.campusevents.dto.request.SchoolRequest;
import com.usiu.campusevents.dto.response.PageResponse;
import com.usiu.campusevents.dto.response.SchoolResponse;
import com.usiu.campusevents.service.interfaces.CatalogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/schools")
public class SchoolController {

    private final CatalogService catalogService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SchoolResponse create(@Valid @RequestBody SchoolRequest request) {
        return catalogService.createSchool(request);
    }

    @PutMapping("/{id}")
    public SchoolResponse update(@PathVariable Long id, @Valid @RequestBody SchoolRequest request) {
        return catalogService.updateSchool(id, request);
    }

    @GetMapping("/{id}")
    public SchoolResponse get(@PathVariable Long id) {
        return catalogService.getSchool(id);
    }

    @GetMapping
    public PageResponse<SchoolResponse> list(Pageable pageable) {
        return catalogService.listSchools(pageable);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        catalogService.deleteSchool(id);
    }
}
