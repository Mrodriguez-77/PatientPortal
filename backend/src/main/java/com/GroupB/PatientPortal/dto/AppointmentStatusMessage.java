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
public class AppointmentStatusMessage {

    private Long appointmentId;
    private String newStatus;
    private String doctorName;
    private LocalDateTime dateTime;
    private LocalDateTime timestamp;
}