package com.GroupB.PatientPortal.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointment_event")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", unique = true)
    private String eventId;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private EventType eventType;

    @Column(name = "appointment_id", nullable = false)
    private Long appointmentId;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @Column(name = "event_payload", columnDefinition = "TEXT")
    private String eventPayload;

    @Column(name = "received_at")
    private LocalDateTime receivedAt;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "processing_status")
    private ProcessingStatus processingStatus;

    @Column(name = "error_message")
    private String errorMessage;

    @PrePersist
    public void prePersist() {
        this.receivedAt = LocalDateTime.now();
        this.processingStatus = ProcessingStatus.PENDING;
    }

    public enum EventType {
        CONFIRMED, CANCELLED, COMPLETED, IN_PROGRESS, STATUS_CHANGED
    }

    public enum ProcessingStatus {
        PENDING, PROCESSED, FAILED
    }
}