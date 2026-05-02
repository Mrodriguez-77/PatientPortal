package com.GroupB.PatientPortal.service;

import com.GroupB.PatientPortal.dto.*;

public interface AuthService {

    LoginResponse register(RegisterRequest request);

    LoginResponse login(LoginRequest request);

    PatientProfileResponse getProfile(String email);

    void changePassword(String email, ChangePasswordRequest request);
}