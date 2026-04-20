package com.GroupB.PatientPortal.repository;

import com.GroupB.PatientPortal.entity.AppointmentReminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentReminderRepository
        extends JpaRepository<AppointmentReminder, Long> {

    List<AppointmentReminder> findBySentFalseAndScheduledSendTimeBetween(
            LocalDateTime start, LocalDateTime end);

    boolean existsByAppointmentId(Long appointmentId);

    List<AppointmentReminder> findByAppointmentId(Long appointmentId);
}