package com.usiu.campusevents.service.interfaces;

import com.usiu.campusevents.dto.request.FavoriteRequest;
import com.usiu.campusevents.dto.response.FavoriteResponse;
import com.usiu.campusevents.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

public interface FavoriteService {

    FavoriteResponse add(FavoriteRequest request);

    void remove(Long eventId);

    PageResponse<FavoriteResponse> myFavorites(Pageable pageable);
}
