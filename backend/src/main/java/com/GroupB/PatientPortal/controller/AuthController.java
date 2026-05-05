package com.GroupB.PatientPortal.controller;

import com.GroupB.PatientPortal.dto.*;
import com.GroupB.PatientPortal.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Registro y login de pacientes")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Registrar nuevo paciente")
    public ResponseEntity<ApiResponse<LoginResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Paciente registrado exitosamente",
                        authService.register(request)));
    }

    @PostMapping("/login")
    @Operation(summary = "Login de paciente, retorna JWT")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Login exitoso", authService.login(request)));
    }

    @GetMapping("/me")
    @Operation(summary = "Obtener perfil del paciente autenticado",
            security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<PatientProfileResponse>> getProfile(
            Principal principal) {
        return ResponseEntity.ok(
                ApiResponse.success("Perfil obtenido",
                        authService.getProfile(principal.getName())));
    }

    @PutMapping("/change-password")
    @Operation(summary = "Cambiar contraseña del paciente autenticado",
            security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<Void>> changePassword(
            Principal principal,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(principal.getName(), request);
        return ResponseEntity.ok(
                ApiResponse.success("Contraseña actualizada exitosamente", null));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Solicitar recuperación de contraseña")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @RequestBody java.util.Map<String, String> body) {
        // No revelar si el email existe o no (prevención de enumeración)
        return ResponseEntity.ok(
                ApiResponse.success("Si el email existe, recibirás instrucciones", null));
    }
}