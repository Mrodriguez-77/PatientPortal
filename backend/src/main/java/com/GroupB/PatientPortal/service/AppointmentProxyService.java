package com.GroupB.PatientPortal.service;

import com.GroupB.PatientPortal.dto.DoctorResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;

public interface AppointmentProxyService {

    Object getDoctors(String specialty, Pageable pageable);

    Object getPatientAppointments(Long patientId, String status, Pageable pageable);

    Object createAppointment(Long patientId, Long doctorId, LocalDateTime dateTime);

    Object cancelAppointment(Long patientId, Long appointmentId);
}