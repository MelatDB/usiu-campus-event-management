package com.usiu.campusevents.controller;

import com.usiu.campusevents.dto.request.ClubRequest;
import com.usiu.campusevents.dto.response.ClubResponse;
import com.usiu.campusevents.dto.response.PageResponse;
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
@RequestMapping("/api/v1/clubs")
public class ClubController {

    private final CatalogService catalogService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClubResponse create(@Valid @RequestBody ClubRequest request) {
        return catalogService.createClub(request);
    }

    @PutMapping("/{id}")
    public ClubResponse update(@PathVariable Long id, @Valid @RequestBody ClubRequest request) {
        return catalogService.updateClub(id, request);
    }

    @GetMapping("/{id}")
    public ClubResponse get(@PathVariable Long id) {
        return catalogService.getClub(id);
    }

    @GetMapping
    public PageResponse<ClubResponse> list(Pageable pageable) {
        return catalogService.listClubs(pageable);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        catalogService.deleteClub(id);
    }
}
