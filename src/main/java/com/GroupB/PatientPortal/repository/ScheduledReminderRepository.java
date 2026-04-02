package com.GroupB.PatientPortal.repository;

import com.GroupB.PatientPortal.entity.ScheduledReminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ScheduledReminderRepository extends JpaRepository<ScheduledReminder, Long> {

    List<ScheduledReminder> findBySentFalseAndReminderDateTimeBefore(LocalDateTime now);

    boolean existsByAppointmentId(Long appointmentId);
}