package com.GroupB.PatientPortal.controller;

import com.GroupB.PatientPortal.dto.ApiResponse;
import com.GroupB.PatientPortal.security.JwtUtil;
import com.GroupB.PatientPortal.service.AppointmentProxyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

@RestController
@RequiredArgsConstructor
@Tag(name = "Citas", description = "Portal de citas del paciente")
@SecurityRequirement(name = "bearerAuth")
public class AppointmentController {

    private final AppointmentProxyService appointmentProxyService;
    private final JwtUtil jwtUtil;

    @GetMapping("/api/doctors/available")
    @Operation(summary = "Ver médicos disponibles (proxy a Grupo A)")
    public ResponseEntity<ApiResponse<Object>> getDoctors(
            @RequestParam(required = false) String specialty,
            Pageable pageable) {
        return ResponseEntity.ok(
                ApiResponse.success("Médicos obtenidos",
                        appointmentProxyService.getDoctors(specialty, pageable)));
    }

    @GetMapping("/api/patient/appointments")
    @Operation(summary = "Ver historial de citas del paciente")
    public ResponseEntity<ApiResponse<Object>> getMyAppointments(
            HttpServletRequest request,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        Long patientId = extractPatientId(request);
        return ResponseEntity.ok(
                ApiResponse.success("Citas obtenidas",
                        appointmentProxyService.getPatientAppointments(
                                patientId, status, pageable)));
    }

    @PostMapping("/api/patient/appointments")
    @Operation(summary = "Solicitar nueva cita (proxy a Grupo A)")
    public ResponseEntity<ApiResponse<Object>> createAppointment(
            HttpServletRequest request,
            @RequestParam Long doctorId,
            @RequestParam LocalDateTime dateTime) {
        Long patientId = extractPatientId(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Cita creada exitosamente",
                        appointmentProxyService.createAppointment(
                                patientId, doctorId, dateTime)));
    }

    @DeleteMapping("/api/patient/appointments/{id}")
    @Operation(summary = "Cancelar cita (proxy a Grupo A)")
    public ResponseEntity<ApiResponse<Object>> cancelAppointment(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Cita cancelada exitosamente",
                        appointmentProxyService.cancelAppointment(id)));
    }

    private Long extractPatientId(HttpServletRequest request) {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                return jwtUtil.extractPatientId(authHeader.substring(7));
            }
        } catch (Exception e) {
            // log error
        }
        return 0L;
    }
}