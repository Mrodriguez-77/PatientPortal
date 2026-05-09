package com.GroupB.PatientPortal.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointment_reminder")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentReminder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnoreProperties({"notifications", "password"})
    private Patient patient;

    @Column(name = "appointment_id", nullable = false)
    private Long appointmentId;

    @Column(name = "doctor_name")
    private String doctorName;

    @Column(name = "specialty")
    private String specialty;

    @Enumerated(EnumType.STRING)
    @Column(name = "reminder_type", nullable = false)
    private ReminderType reminderType;

    @Column(name = "hours_before_appointment")
    private Integer hoursBeforeAppointment;

    @Column(name = "scheduled_send_time", nullable = false)
    private LocalDateTime scheduledSendTime;

    @Column(name = "email_sent_at")
    private LocalDateTime emailSentAt;

    @Column(name = "is_sent", nullable = false)
    private boolean sent;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.sent = false;
    }

    public enum ReminderType {
        CONFIRMATION, REMINDER_24H, REMINDER_3D, CUSTOM
    }
}