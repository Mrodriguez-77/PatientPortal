package com.GroupB.PatientPortal.service.impl;

import com.GroupB.PatientPortal.dto.AppointmentEventMessage;
import com.GroupB.PatientPortal.entity.*;
import com.GroupB.PatientPortal.enums.NotificationType;
import com.GroupB.PatientPortal.repository.*;
import com.GroupB.PatientPortal.service.AppointmentEventService;
import com.GroupB.PatientPortal.service.EmailService;
import com.GroupB.PatientPortal.service.WebSocketNotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.AmqpRejectAndDontRequeueException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentEventServiceImpl implements AppointmentEventService {

    private final AppointmentEventRepository appointmentEventRepository;
    private final AppointmentReminderRepository appointmentReminderRepository;
    private final NotificationRepository notificationRepository;
    private final PatientRepository patientRepository;
    private final EmailService emailService;
    private final WebSocketNotificationService webSocketService;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void processConfirmedAppointment(AppointmentEventMessage event) {
        log.info("Procesando cita confirmada: appointmentId={}", event.getAppointmentId());

        AppointmentEvent auditEvent = saveAuditEvent(event,
                AppointmentEvent.EventType.CONFIRMED);
        try {
            Patient patient = resolvePatient(event);
            if (patient == null) {
                markFailed(auditEvent, "Paciente no encontrado: " + event.getPatientId());
                return;
            }

            // Evitar duplicados
            if (notificationRepository.existsByAppointmentIdAndType(
                    event.getAppointmentId(), NotificationType.APPOINTMENT_CONFIRMED)) {
                log.warn("Notificación duplicada ignorada para appointmentId={}",
                        event.getAppointmentId());
                markProcessed(auditEvent);
                return;
            }

            // Guardar notificación
            saveNotification(patient, event,
                    NotificationType.APPOINTMENT_CONFIRMED,
                    "Tu cita con " + event.getDoctorName() +
                            " ha sido confirmada para " + event.getDateTime());

            // Crear recordatorio 24h
            createReminder(patient, event, 24,
                    AppointmentReminder.ReminderType.REMINDER_24H);

            // Email de confirmación
            enrichEventWithPatientData(event, patient);
            emailService.sendConfirmationEmail(event);

            // WebSocket
            webSocketService.notifyAppointmentUpdate(
                    patient.getId(), event.getAppointmentId(),
                    "CONFIRMED", event.getDoctorName(), event.getDateTime());

            markProcessed(auditEvent);
            log.info("Cita confirmada procesada exitosamente: {}", event.getAppointmentId());

        } catch (Exception e) {
            log.error("Error procesando cita confirmada: {}", e.getMessage());
            markFailed(auditEvent, e.getMessage());
            throw new AmqpRejectAndDontRequeueException(e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void processCancellation(AppointmentEventMessage event) {
        log.info("Procesando cancelación: appointmentId={}", event.getAppointmentId());

        AppointmentEvent auditEvent = saveAuditEvent(event,
                AppointmentEvent.EventType.CANCELLED);
        try {
            Patient patient = resolvePatient(event);
            if (patient == null) {
                markFailed(auditEvent, "Paciente no encontrado");
                return;
            }

            saveNotification(patient, event,
                    NotificationType.APPOINTMENT_CANCELLED,
                    "Tu cita con " + event.getDoctorName() + " ha sido cancelada.");

            enrichEventWithPatientData(event, patient);
            emailService.sendCancellationEmail(event);

            webSocketService.notifyAppointmentUpdate(
                    patient.getId(), event.getAppointmentId(),
                    "CANCELLED", event.getDoctorName(), event.getDateTime());

            markProcessed(auditEvent);

        } catch (Exception e) {
            log.error("Error procesando cancelación: {}", e.getMessage());
            markFailed(auditEvent, e.getMessage());
            throw new AmqpRejectAndDontRequeueException(e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void processStatusChange(AppointmentEventMessage event) {
        log.info("Procesando cambio de estado: appointmentId={}, newStatus={}",
                event.getAppointmentId(), event.getStatus());

        AppointmentEvent auditEvent = saveAuditEvent(event,
                AppointmentEvent.EventType.STATUS_CHANGED);
        try {
            Patient patient = resolvePatient(event);
            if (patient == null) {
                markFailed(auditEvent, "Paciente no encontrado");
                return;
            }

            String message = "Tu cita con " + event.getDoctorName() +
                    " cambió a estado: " + event.getStatus();
            NotificationType type = resolveNotificationType(event.getStatus());

            saveNotification(patient, event, type, message);

            webSocketService.notifyAppointmentUpdate(
                    patient.getId(), event.getAppointmentId(),
                    event.getStatus(), event.getDoctorName(), event.getDateTime());

            if ("CANCELLED".equals(event.getStatus())) {
                enrichEventWithPatientData(event, patient);
                emailService.sendCancellationEmail(event);
            }

            markProcessed(auditEvent);

        } catch (Exception e) {
            log.error("Error procesando cambio de estado: {}", e.getMessage());
            markFailed(auditEvent, e.getMessage());
            throw new AmqpRejectAndDontRequeueException(e.getMessage(), e);
        }
    }

    // ─── Métodos privados ───────────────────────────────────────────

    private Patient resolvePatient(AppointmentEventMessage event) {
        // Primero busca por email si viene en el evento
        if (event.getPatientEmail() != null && !event.getPatientEmail().isBlank()) {
            return patientRepository.findByEmail(event.getPatientEmail()).orElse(null);
        }
        // Si no, busca por ID
        if (event.getPatientId() != null) {
            return patientRepository.findById(event.getPatientId()).orElse(null);
        }
        return null;
    }

    private void enrichEventWithPatientData(AppointmentEventMessage event,
                                            Patient patient) {
        if (event.getPatientEmail() == null || event.getPatientEmail().isBlank()) {
            event.setPatientEmail(patient.getEmail());
        }
        if (event.getPatientName() == null || event.getPatientName().isBlank()) {
            event.setPatientName(patient.getFullName());
        }
    }

    private AppointmentEvent saveAuditEvent(AppointmentEventMessage event,
                                            AppointmentEvent.EventType type) {
        String payload;
        try {
            payload = objectMapper.writeValueAsString(event);
        } catch (Exception e) {
            payload = event.toString();
        }

        AppointmentEvent auditEvent = AppointmentEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .eventType(type)
                .appointmentId(event.getAppointmentId())
                .eventPayload(payload)
                .build();

        return appointmentEventRepository.save(auditEvent);
    }

    private void saveNotification(Patient patient, AppointmentEventMessage event,
                                  NotificationType type, String message) {
        Notification notification = Notification.builder()
                .patient(patient)
                .message(message)
                .type(type)
                .appointmentId(event.getAppointmentId())
                .build();
        notificationRepository.save(notification);
    }

    private void createReminder(Patient patient, AppointmentEventMessage event,
                                int hoursBefore,
                                AppointmentReminder.ReminderType type) {
        if (event.getDateTime() == null) return;
        if (appointmentReminderRepository.existsByAppointmentId(
                event.getAppointmentId())) return;

        AppointmentReminder reminder = AppointmentReminder.builder()
                .patient(patient)
                .appointmentId(event.getAppointmentId())
                .reminderType(type)
                .hoursBeforeAppointment(hoursBefore)
                .scheduledSendTime(event.getDateTime().minusHours(hoursBefore))
                .doctorName(event.getDoctorName())
                .specialty(event.getSpecialty())
                .build();

        appointmentReminderRepository.save(reminder);
    }

    private NotificationType resolveNotificationType(String status) {
        return switch (status != null ? status : "") {
            case "CONFIRMED" -> NotificationType.APPOINTMENT_CONFIRMED;
            case "CANCELLED" -> NotificationType.APPOINTMENT_CANCELLED;
            case "COMPLETED" -> NotificationType.APPOINTMENT_COMPLETED;
            default -> NotificationType.APPOINTMENT_STATUS_CHANGED;
        };
    }

    private void markProcessed(AppointmentEvent event) {
        event.setProcessingStatus(AppointmentEvent.ProcessingStatus.PROCESSED);
        event.setProcessedAt(LocalDateTime.now());
        appointmentEventRepository.save(event);
    }

    private void markFailed(AppointmentEvent event, String error) {
        event.setProcessingStatus(AppointmentEvent.ProcessingStatus.FAILED);
        event.setErrorMessage(error);
        appointmentEventRepository.save(event);
    }
}