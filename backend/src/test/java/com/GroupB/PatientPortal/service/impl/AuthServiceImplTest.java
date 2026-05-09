package com.GroupB.PatientPortal.service.impl;

import com.GroupB.PatientPortal.dto.LoginRequest;
import com.GroupB.PatientPortal.dto.LoginResponse;
import com.GroupB.PatientPortal.dto.RegisterRequest;
import com.GroupB.PatientPortal.entity.Patient;
import com.GroupB.PatientPortal.enums.Role;
import com.GroupB.PatientPortal.exception.EmailAlreadyExistsException;
import com.GroupB.PatientPortal.exception.InvalidCredentialsException;
import com.GroupB.PatientPortal.repository.PatientRepository;
import com.GroupB.PatientPortal.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private PatientRepository patientRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtUtil jwtUtil;
    @Mock
    private RabbitTemplate rabbitTemplate;

    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        authService = new AuthServiceImpl(patientRepository, passwordEncoder, jwtUtil, rabbitTemplate);
    }

    @Test
    void register_conEmailExistente_lanzaEmailAlreadyExistsException() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@correo.com");

        when(patientRepository.existsByEmail("test@correo.com")).thenReturn(true);

        assertThrows(EmailAlreadyExistsException.class, () -> authService.register(request));
        verifyNoInteractions(rabbitTemplate);
    }

    @Test
    void login_conCredencialesInvalidas_lanzaInvalidCredentialsException() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@correo.com");
        request.setPassword("clave");

        Patient patient = Patient.builder()
                .id(1L)
                .email("test@correo.com")
                .password("hash")
                .role(Role.PATIENT)
                .build();

        when(patientRepository.findByEmail("test@correo.com")).thenReturn(Optional.of(patient));
        when(passwordEncoder.matches("clave", "hash")).thenReturn(false);

        assertThrows(InvalidCredentialsException.class, () -> authService.login(request));
    }

    @Test
    void login_exitoso_retornaTokenNoNulo() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@correo.com");
        request.setPassword("clave");

        Patient patient = Patient.builder()
                .id(1L)
                .email("test@correo.com")
                .password("hash")
                .role(Role.PATIENT)
                .build();

        when(patientRepository.findByEmail("test@correo.com")).thenReturn(Optional.of(patient));
        when(passwordEncoder.matches("clave", "hash")).thenReturn(true);
        when(jwtUtil.generateToken("test@correo.com", "PATIENT", 1L)).thenReturn("token-123");

        LoginResponse response = authService.login(request);

        assertNotNull(response.getToken());
        assertEquals("token-123", response.getToken());
    }
}

