package com.GroupB.PatientPortal.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "scheduled_reminders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduledReminder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "appointment_id", nullable = false)
    private Long appointmentId;

    @Column(name = "patient_email", nullable = false)
    private String patientEmail;

    @Column(name = "patient_name", nullable = false)
    private String patientName;

    @Column(name = "doctor_name", nullable = false)
    private String doctorName;

    @Column(name = "reminder_date_time", nullable = false)
    private LocalDateTime reminderDateTime;

    @Column(nullable = false)
    private boolean sent;

    @PrePersist
    public void prePersist() {
        this.sent = false;
    }
}