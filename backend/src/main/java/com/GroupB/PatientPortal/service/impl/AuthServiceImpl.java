package com.GroupB.PatientPortal.service.impl;

import com.GroupB.PatientPortal.dto.*;
import com.GroupB.PatientPortal.entity.Patient;
import com.GroupB.PatientPortal.enums.Role;
import com.GroupB.PatientPortal.exception.BadRequestException;
import com.GroupB.PatientPortal.exception.EmailAlreadyExistsException;
import com.GroupB.PatientPortal.exception.InvalidCredentialsException;
import com.GroupB.PatientPortal.exception.ResourceNotFoundException;
import com.GroupB.PatientPortal.repository.PatientRepository;
import com.GroupB.PatientPortal.security.JwtUtil;
import com.GroupB.PatientPortal.service.AuthService;
import com.GroupB.PatientPortal.service.EspoCrmService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EspoCrmService espoCrmService;

    @Override
    public LoginResponse register(RegisterRequest request) {
        if (patientRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("El email ya está registrado");
        }

        Patient patient = Patient.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .birthDate(request.getBirthDate())
                .phone(request.getPhone())
                .role(Role.PATIENT)
                .build();

        Patient saved = patientRepository.save(patient);

        espoCrmService.syncContact(saved);

        String token = jwtUtil.generateToken(
                saved.getEmail(),
                saved.getRole().name(),
                saved.getId()
        );

        return LoginResponse.builder()
                .token(token)
                .patientId(saved.getId())
                .fullName(saved.getFullName())
                .email(saved.getEmail())
                .role(saved.getRole().name())
                .build();
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        Patient patient = patientRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Credenciales inválidas"));

        if (!passwordEncoder.matches(request.getPassword(), patient.getPassword())) {
            throw new InvalidCredentialsException("Credenciales inválidas");
        }

        String token = jwtUtil.generateToken(
                patient.getEmail(),
                patient.getRole().name(),
                patient.getId()
        );

        return LoginResponse.builder()
                .token(token)
                .patientId(patient.getId())
                .fullName(patient.getFullName())
                .email(patient.getEmail())
                .role(patient.getRole().name())
                .build();
    }

    @Override
    public PatientProfileResponse getProfile(String email) {
        Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente no encontrado"));

        return PatientProfileResponse.builder()
                .id(patient.getId())
                .fullName(patient.getFullName())
                .email(patient.getEmail())
                .birthDate(patient.getBirthDate())
                .phone(patient.getPhone())
                .role(patient.getRole())
                .createdAt(patient.getCreatedAt())
                .build();
    }

    @Override
    public void changePassword(String email, ChangePasswordRequest request) {
        Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente no encontrado"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), patient.getPassword())) {
            throw new BadRequestException("La contraseña actual es incorrecta");
        }

        patient.setPassword(passwordEncoder.encode(request.getNewPassword()));
        patientRepository.save(patient);
    }
}