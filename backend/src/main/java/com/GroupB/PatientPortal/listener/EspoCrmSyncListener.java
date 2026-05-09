package com.GroupB.PatientPortal.listener;

import com.GroupB.PatientPortal.config.RabbitMQConfig;
import com.GroupB.PatientPortal.entity.Patient;
import com.GroupB.PatientPortal.repository.PatientRepository;
import com.GroupB.PatientPortal.service.EspoCrmService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class EspoCrmSyncListener {

    private final PatientRepository patientRepository;
    private final EspoCrmService espoCrmService;

    @RabbitListener(queues = RabbitMQConfig.QUEUE_ESPOCRM_SYNC)
    public void onSyncRequest(Long patientId) {
        log.info("EspoCRM sync: procesando patientId={}", patientId);
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado: " + patientId));
        espoCrmService.syncContact(patient);
        log.info("EspoCRM sync exitoso: {}", patient.getEmail());
    }
}



