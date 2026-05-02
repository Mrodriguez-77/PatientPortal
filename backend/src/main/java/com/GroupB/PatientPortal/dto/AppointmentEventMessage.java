package com.GroupB.PatientPortal.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AppointmentEventMessage {

    private Long appointmentId;
    private Long patientId;
    private String patientEmail;
    private String patientName;
    private String doctorName;
    private String specialty;
    private LocalDateTime dateTime;
    private String status;
    private String oldStatus;
    private String cancellationReason;
}