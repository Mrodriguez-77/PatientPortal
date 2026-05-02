package com.GroupB.PatientPortal.service;

import java.time.LocalDateTime;

public interface WebSocketNotificationService {
    void notifyAppointmentUpdate(Long patientId, Long appointmentId,
                                 String newStatus, String doctorName,
                                 LocalDateTime dateTime);
    void notifyReminder(Long patientId, Long appointmentId, String message);
}