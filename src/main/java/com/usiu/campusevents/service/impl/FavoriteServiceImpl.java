package com.usiu.campusevents.service.impl;

import com.usiu.campusevents.dto.request.FavoriteRequest;
import com.usiu.campusevents.dto.response.FavoriteResponse;
import com.usiu.campusevents.dto.response.PageResponse;
import com.usiu.campusevents.entity.Event;
import com.usiu.campusevents.entity.FavoriteEvent;
import com.usiu.campusevents.entity.User;
import com.usiu.campusevents.exception.BadRequestException;
import com.usiu.campusevents.exception.ResourceNotFoundException;
import com.usiu.campusevents.mapper.CampusMapper;
import com.usiu.campusevents.repository.EventRepository;
import com.usiu.campusevents.repository.FavoriteEventRepository;
import com.usiu.campusevents.repository.UserRepository;
import com.usiu.campusevents.service.interfaces.FavoriteService;
import com.usiu.campusevents.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class FavoriteServiceImpl implements FavoriteService {

    private final FavoriteEventRepository favoriteRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final CampusMapper mapper;

    @Override
    @Transactional
    public FavoriteResponse add(FavoriteRequest request) {
        Long studentId = SecurityUtils.currentUserId();
        if (favoriteRepository.existsByStudentIdAndEventId(studentId, request.eventId())) {
            throw new BadRequestException("Event is already in favorites");
        }
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
        Event event = eventRepository.findById(request.eventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event", request.eventId()));
        FavoriteEvent favorite = FavoriteEvent.builder()
                .student(student)
                .event(event)
                .build();
        return mapper.toFavoriteResponse(favoriteRepository.save(favorite));
    }

    @Override
    @Transactional
    public void remove(Long eventId) {
        FavoriteEvent favorite = favoriteRepository.findByStudentIdAndEventId(SecurityUtils.currentUserId(), eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Favorite event not found"));
        favoriteRepository.delete(favorite);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<FavoriteResponse> myFavorites(Pageable pageable) {
        return PageResponse.from(favoriteRepository.findByStudentId(SecurityUtils.currentUserId(), pageable)
                .map(mapper::toFavoriteResponse));
    }
}
