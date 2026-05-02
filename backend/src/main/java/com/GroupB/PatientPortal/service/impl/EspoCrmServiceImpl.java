package com.GroupB.PatientPortal.service.impl;

import com.GroupB.PatientPortal.entity.Patient;
import com.GroupB.PatientPortal.service.EspoCrmService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class EspoCrmServiceImpl implements EspoCrmService {

    private final WebClient espoCrmClient;

    public EspoCrmServiceImpl(@Qualifier("espoCrmClient") WebClient espoCrmClient) {
        this.espoCrmClient = espoCrmClient;
    }

    @Override
    public void syncContact(Patient patient) {
        try {
            String[] nameParts = patient.getFullName().split(" ", 2);
            String firstName = nameParts[0];
            String lastName = nameParts.length > 1 ? nameParts[1] : "";

            Map<String, Object> body = new HashMap<>();
            body.put("firstName", firstName);
            body.put("lastName", lastName);
            body.put("emailAddress", patient.getEmail());
            body.put("description", "Registrado via Patient Portal");

            espoCrmClient.post()
                    .uri("/api/v1/Contact")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            log.info("Contacto sincronizado con EspoCRM: {}", patient.getEmail());
        } catch (Exception e) {
            log.error("Error al sincronizar con EspoCRM: {}", e.getMessage());
        }
    }
}