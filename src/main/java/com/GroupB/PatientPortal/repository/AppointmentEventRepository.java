package com.GroupB.PatientPortal.repository;

import com.GroupB.PatientPortal.entity.AppointmentEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AppointmentEventRepository
        extends JpaRepository<AppointmentEvent, Long> {

    Optional<AppointmentEvent> findByEventId(String eventId);

    boolean existsByAppointmentIdAndEventType(
            Long appointmentId, AppointmentEvent.EventType eventType);
}