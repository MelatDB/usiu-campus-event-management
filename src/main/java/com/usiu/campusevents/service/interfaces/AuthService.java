package com.usiu.campusevents.service.interfaces;

import com.usiu.campusevents.dto.request.ChangePasswordRequest;
import com.usiu.campusevents.dto.request.LoginRequest;
import com.usiu.campusevents.dto.request.StudentRegistrationRequest;
import com.usiu.campusevents.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse registerStudent(StudentRegistrationRequest request);

    AuthResponse login(LoginRequest request);

    void changePassword(ChangePasswordRequest request);
}
