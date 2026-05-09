package com.GroupB.PatientPortal.repository;

import com.GroupB.PatientPortal.entity.Notification;
import com.GroupB.PatientPortal.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByPatientId(Long patientId, Pageable pageable);

    Page<Notification> findByPatientIdAndRead(Long patientId, boolean read, Pageable pageable);

    boolean existsByAppointmentIdAndType(Long appointmentId, NotificationType type);

    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.read = true WHERE n.patient.id = :patientId AND n.read = false")
    void markAllAsReadByPatientId(@Param("patientId") Long patientId);
}