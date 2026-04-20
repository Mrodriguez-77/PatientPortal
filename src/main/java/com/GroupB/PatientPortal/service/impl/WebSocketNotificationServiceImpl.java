package com.GroupB.PatientPortal.service.impl;

import com.GroupB.PatientPortal.dto.AppointmentStatusMessage;
import com.GroupB.PatientPortal.service.WebSocketNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketNotificationServiceImpl implements WebSocketNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void notifyAppointmentUpdate(Long patientId, Long appointmentId,
                                        String newStatus, String doctorName,
                                        LocalDateTime dateTime) {
        AppointmentStatusMessage message = AppointmentStatusMessage.builder()
                .appointmentId(appointmentId)
                .newStatus(newStatus)
                .doctorName(doctorName)
                .dateTime(dateTime)
                .timestamp(LocalDateTime.now())
                .build();

        String destination = "/topic/patient/" + patientId + "/appointments";
        messagingTemplate.convertAndSend(destination, message);
        log.info("WebSocket enviado a {}: appointmentId={}, status={}",
                destination, appointmentId, newStatus);
    }

    @Override
    public void notifyReminder(Long patientId, Long appointmentId, String message) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "REMINDER");
        payload.put("appointmentId", appointmentId);
        payload.put("message", message);
        payload.put("timestamp", LocalDateTime.now());

        String destination = "/topic/patient/" + patientId + "/appointments";
        messagingTemplate.convertAndSend(destination, payload);
        log.info("WebSocket recordatorio enviado a paciente {}", patientId);
    }
}