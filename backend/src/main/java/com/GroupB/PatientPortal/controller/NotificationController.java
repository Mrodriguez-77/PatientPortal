package com.GroupB.PatientPortal.controller;

import com.GroupB.PatientPortal.dto.ApiResponse;
import com.GroupB.PatientPortal.entity.Notification;
import com.GroupB.PatientPortal.repository.NotificationRepository;
import com.GroupB.PatientPortal.repository.PatientRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

@RestController
@RequestMapping("/api/patient/notifications")
@RequiredArgsConstructor
@Tag(name = "Notificaciones", description = "Notificaciones del paciente")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final PatientRepository patientRepository;

    @GetMapping
    @Operation(summary = "Obtener notificaciones del paciente autenticado")
    public ResponseEntity<ApiResponse<Page<Notification>>> getNotifications(
            Principal principal,
            @RequestParam(required = false) Boolean read,
            Pageable pageable) {

        Long patientId = patientRepository
                .findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"))
                .getId();

        Page<Notification> notifications;
        if (read != null) {
            notifications = notificationRepository
                    .findByPatientIdAndRead(patientId, read, pageable);
        } else {
            notifications = notificationRepository
                    .findByPatientId(patientId, pageable);
        }

        return ResponseEntity.ok(
                ApiResponse.success("Notificaciones obtenidas", notifications));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Marcar notificación como leída")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notificación no encontrada"));
        notification.setRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok(
                ApiResponse.success("Notificación marcada como leída", null));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(Principal principal) {
        Long patientId = patientRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"))
                .getId();
        notificationRepository.markAllAsReadByPatientId(patientId);
        return ResponseEntity.ok(ApiResponse.success("Todas marcadas como leídas", null));
    }
}