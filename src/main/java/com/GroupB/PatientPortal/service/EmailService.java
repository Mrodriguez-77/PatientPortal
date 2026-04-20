package com.GroupB.PatientPortal.service;

import com.GroupB.PatientPortal.dto.AppointmentEventMessage;
import com.GroupB.PatientPortal.entity.AppointmentReminder;

public interface EmailService {
    void sendConfirmationEmail(AppointmentEventMessage event);
    void sendCancellationEmail(AppointmentEventMessage event);
    void sendReminderEmail(AppointmentReminder reminder);
}