package com.usiu.campusevents.controller;

import com.usiu.campusevents.dto.request.ProgramRequest;
import com.usiu.campusevents.dto.response.PageResponse;
import com.usiu.campusevents.dto.response.ProgramResponse;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/programs")
public class ProgramController {

    private final CatalogService catalogService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProgramResponse create(@Valid @RequestBody ProgramRequest request) {
        return catalogService.createProgram(request);
    }

    @PutMapping("/{id}")
    public ProgramResponse update(@PathVariable Long id, @Valid @RequestBody ProgramRequest request) {
        return catalogService.updateProgram(id, request);
    }

    @GetMapping("/{id}")
    public ProgramResponse get(@PathVariable Long id) {
        return catalogService.getProgram(id);
    }

    @GetMapping
    public PageResponse<ProgramResponse> list(@RequestParam(required = false) Long schoolId, Pageable pageable) {
        return catalogService.listPrograms(schoolId, pageable);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        catalogService.deleteProgram(id);
    }
}
