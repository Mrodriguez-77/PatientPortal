package com.GroupB.PatientPortal.controller;

import com.GroupB.PatientPortal.dto.ApiResponse;
import com.GroupB.PatientPortal.service.AppointmentProxyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.time.LocalDateTime;

@RestController
@RequiredArgsConstructor
@Tag(name = "Citas", description = "Portal de citas del paciente")
@SecurityRequirement(name = "bearerAuth")
public class AppointmentController {

    private final AppointmentProxyService appointmentProxyService;

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
            Principal principal,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        String[] parts = principal.getName().split(":");
        Long patientId = Long.parseLong(parts[0]);
        return ResponseEntity.ok(
                ApiResponse.success("Citas obtenidas",
                        appointmentProxyService.getPatientAppointments(
                                patientId, status, pageable)));
    }

    @PostMapping("/api/patient/appointments")
    @Operation(summary = "Solicitar nueva cita (proxy a Grupo A)")
    public ResponseEntity<ApiResponse<Object>> createAppointment(
            Principal principal,
            @RequestParam Long doctorId,
            @RequestParam LocalDateTime dateTime) {
        Long patientId = extractPatientId(principal.getName());
        return ResponseEntity
                .status(HttpStatus.CREATED)
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

    private Long extractPatientId(String principalName) {
        try {
            return Long.parseLong(principalName);
        } catch (NumberFormatException e) {
            return 0L;
        }
    }
}