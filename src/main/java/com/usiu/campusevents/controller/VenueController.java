package com.usiu.campusevents.controller;

import com.usiu.campusevents.dto.request.VenueRequest;
import com.usiu.campusevents.dto.response.PageResponse;
import com.usiu.campusevents.dto.response.VenueResponse;
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
@RequestMapping("/api/v1/venues")
public class VenueController {

    private final CatalogService catalogService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VenueResponse create(@Valid @RequestBody VenueRequest request) {
        return catalogService.createVenue(request);
    }

    @PutMapping("/{id}")
    public VenueResponse update(@PathVariable Long id, @Valid @RequestBody VenueRequest request) {
        return catalogService.updateVenue(id, request);
    }

    @GetMapping("/{id}")
    public VenueResponse get(@PathVariable Long id) {
        return catalogService.getVenue(id);
    }

    @GetMapping
    public PageResponse<VenueResponse> list(Pageable pageable) {
        return catalogService.listVenues(pageable);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        catalogService.deleteVenue(id);
    }
}
