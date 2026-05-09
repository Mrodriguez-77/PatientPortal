package com.GroupB.PatientPortal.service.impl;

import com.GroupB.PatientPortal.entity.Patient;
import com.GroupB.PatientPortal.service.EspoCrmService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
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
        String[] parts = patient.getFullName().split(" ", 2);
        Map<String, Object> body = new HashMap<>();
        body.put("firstName", parts[0]);
        body.put("lastName", parts.length > 1 ? parts[1] : "");
        body.put("emailAddress", patient.getEmail());
        body.put("description", "Registrado via Patient Portal");

        espoCrmClient.post()
                .uri("/api/v1/Contact")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        log.info("Contacto sincronizado con EspoCRM: {}", patient.getEmail());
    }
}