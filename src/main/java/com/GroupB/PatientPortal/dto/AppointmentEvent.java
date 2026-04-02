package com.GroupB.PatientPortal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentEvent {

    private Long appointmentId;
    private Long patientId;
    private String patientEmail;
    private String patientName;
    private String doctorName;
    private String specialty;
    private LocalDateTime dateTime;
    private String status;
}