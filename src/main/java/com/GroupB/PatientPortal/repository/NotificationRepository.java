package com.GroupB.PatientPortal.repository;

import com.GroupB.PatientPortal.entity.Notification;
import com.GroupB.PatientPortal.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByPatientId(Long patientId, Pageable pageable);

    Page<Notification> findByPatientIdAndRead(Long patientId, boolean read, Pageable pageable);

    boolean existsByAppointmentIdAndType(Long appointmentId, NotificationType type);
}