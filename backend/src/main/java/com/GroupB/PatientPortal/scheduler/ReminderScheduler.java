package com.GroupB.PatientPortal.scheduler;

import com.GroupB.PatientPortal.repository.AppointmentReminderRepository;
import com.GroupB.PatientPortal.service.EmailService;
import com.GroupB.PatientPortal.service.WebSocketNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class ReminderScheduler {

    private final AppointmentReminderRepository reminderRepository;
    private final EmailService emailService;
    private final WebSocketNotificationService webSocketService;

    @Scheduled(fixedRate = 300000) // cada 5 minutos
    public void sendScheduledReminders() {
        log.info("ReminderScheduler: buscando recordatorios pendientes...");

        var reminders = reminderRepository
                .findBySentFalseAndScheduledSendTimeBetween(
                        LocalDateTime.now().minusMinutes(5),
                        LocalDateTime.now().plusMinutes(5)
                );

        if (reminders.isEmpty()) {
            log.debug("No hay recordatorios pendientes.");
            return;
        }

        log.info("Encontrados {} recordatorios para enviar", reminders.size());

        for (var reminder : reminders) {
            try {
                emailService.sendReminderEmail(reminder);

                reminder.setSent(true);
                reminder.setEmailSentAt(LocalDateTime.now());
                reminderRepository.save(reminder);

                webSocketService.notifyReminder(
                        reminder.getPatient().getId(),
                        reminder.getAppointmentId(),
                        "Tu cita con " + reminder.getDoctorName() +
                                " es en " + reminder.getHoursBeforeAppointment() + " horas"
                );

                log.info("Recordatorio enviado: id={}, paciente={}",
                        reminder.getId(),
                        reminder.getPatient().getEmail());

            } catch (Exception e) {
                log.error("Error enviando recordatorio {}: {}",
                        reminder.getId(), e.getMessage());
            }
        }
    }
}