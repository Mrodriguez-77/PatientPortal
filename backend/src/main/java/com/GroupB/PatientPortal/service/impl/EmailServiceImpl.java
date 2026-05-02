package com.GroupB.PatientPortal.service.impl;

import com.GroupB.PatientPortal.dto.AppointmentEventMessage;
import com.GroupB.PatientPortal.entity.AppointmentReminder;
import com.GroupB.PatientPortal.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("dd 'de' MMMM 'de' yyyy 'a las' HH:mm",
                    new Locale("es", "ES"));

    @Override
    @Async
    public void sendConfirmationEmail(AppointmentEventMessage event) {
        try {
            Context ctx = new Context(new Locale("es", "ES"));
            ctx.setVariable("patientName", event.getPatientName());
            ctx.setVariable("doctorName", event.getDoctorName());
            ctx.setVariable("specialty", event.getSpecialty());
            ctx.setVariable("dateTime",
                    event.getDateTime() != null
                            ? event.getDateTime().format(FORMATTER) : "—");
            ctx.setVariable("appointmentId", event.getAppointmentId());

            sendEmail(
                    event.getPatientEmail(),
                    "✅ Cita confirmada — Patient Portal",
                    "emails/confirmation",
                    ctx
            );
        } catch (Exception e) {
            log.error("Error enviando email de confirmación: {}", e.getMessage());
        }
    }

    @Override
    @Async
    public void sendCancellationEmail(AppointmentEventMessage event) {
        try {
            Context ctx = new Context(new Locale("es", "ES"));
            ctx.setVariable("patientName", event.getPatientName());
            ctx.setVariable("doctorName", event.getDoctorName());
            ctx.setVariable("specialty", event.getSpecialty());
            ctx.setVariable("dateTime",
                    event.getDateTime() != null
                            ? event.getDateTime().format(FORMATTER) : "—");
            ctx.setVariable("cancellationReason",
                    event.getCancellationReason() != null
                            ? event.getCancellationReason() : "No especificada");

            sendEmail(
                    event.getPatientEmail(),
                    "❌ Cita cancelada — Patient Portal",
                    "emails/cancellation",
                    ctx
            );
        } catch (Exception e) {
            log.error("Error enviando email de cancelación: {}", e.getMessage());
        }
    }

    @Override
    @Async
    public void sendReminderEmail(AppointmentReminder reminder) {
        try {
            Context ctx = new Context(new Locale("es", "ES"));
            ctx.setVariable("patientName", reminder.getPatient().getFullName());
            ctx.setVariable("doctorName", reminder.getDoctorName());
            ctx.setVariable("dateTime",
                    reminder.getScheduledSendTime() != null
                            ? reminder.getScheduledSendTime()
                              .plusHours(reminder.getHoursBeforeAppointment() != null
                                         ? reminder.getHoursBeforeAppointment() : 24)
                              .format(FORMATTER) : "—");
            ctx.setVariable("appointmentId", reminder.getAppointmentId());
            ctx.setVariable("hoursLeft",
                    reminder.getHoursBeforeAppointment() != null
                            ? reminder.getHoursBeforeAppointment() : 24);

            sendEmail(
                    reminder.getPatient().getEmail(),
                    "⏰ Recordatorio de cita — Patient Portal",
                    "emails/reminder",
                    ctx
            );
        } catch (Exception e) {
            log.error("Error enviando email de recordatorio: {}", e.getMessage());
        }
    }

    private void sendEmail(String to, String subject,
                           String templateName, Context ctx)
            throws MessagingException {
        String html = templateEngine.process(templateName, ctx);
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(html, true);
        helper.setFrom(fromEmail.isBlank() ? "noreply@patientportal.com" : fromEmail);
        mailSender.send(message);
        log.info("Email enviado a {} - asunto: {}", to, subject);
    }
}