package com.usiu.campusevents.service.interfaces;

import com.usiu.campusevents.dto.request.UserRequest;
import com.usiu.campusevents.dto.response.PageResponse;
import com.usiu.campusevents.dto.response.UserResponse;
import com.usiu.campusevents.entity.enums.Role;
import org.springframework.data.domain.Pageable;

public interface UserManagementService {

    UserResponse create(UserRequest request);

    UserResponse update(Long id, UserRequest request);

    UserResponse get(Long id);

    PageResponse<UserResponse> list(Role role, Pageable pageable);

    void delete(Long id);
}
