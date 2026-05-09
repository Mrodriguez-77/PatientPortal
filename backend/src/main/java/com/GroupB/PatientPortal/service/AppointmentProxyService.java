package com.GroupB.PatientPortal.service;

import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;

public interface AppointmentProxyService {

    Object getDoctors(String specialty, Pageable pageable, String jwtToken);

    Object getPatientAppointments(Long patientId, String status, Pageable pageable, String jwtToken);

    Object createAppointment(Long patientId, Long doctorId, LocalDateTime dateTime, String jwtToken);

    Object cancelAppointment(Long patientId, Long appointmentId, String jwtToken);
}