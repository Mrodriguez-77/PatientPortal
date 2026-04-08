package com.GroupB.PatientPortal.service.impl;

import com.GroupB.PatientPortal.service.AppointmentProxyService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.Optional;
import org.springframework.web.util.UriComponentsBuilder;


@Service
@Slf4j
public class AppointmentProxyServiceImpl implements AppointmentProxyService {

    private final WebClient clinicalEngineClient;

    public AppointmentProxyServiceImpl(
            @Qualifier("clinicalEngineClient") WebClient clinicalEngineClient) {
        this.clinicalEngineClient = clinicalEngineClient;
    }

    @Override
    public Object getDoctors(String specialty, Pageable pageable) {
        try {
            String uri = UriComponentsBuilder.fromPath("/api/doctors")
                    .queryParam("page", pageable.getPageNumber())
                    .queryParam("size", pageable.getPageSize())
                    .queryParamIfPresent("specialty", Optional.ofNullable(specialty).filter(s -> !s.isBlank()))
                    .build(true)
                    .toUriString();

            log.info("Proxy Grupo A -> GET {}", uri);

            Object response = clinicalEngineClient.get()
                    .uri(uri)
                    .retrieve()
                    .bodyToMono(Object.class)
                    .block();

            if (response instanceof java.util.Map<?, ?> map && map.containsKey("data")) {
                return map.get("data");
            }
            return response;

        } catch (WebClientResponseException e) {
            log.error("Proxy Grupo A <- HTTP error uri=/api/doctors status={} body={}",
                    e.getStatusCode(), e.getResponseBodyAsString());
            return Collections.emptyList();
        } catch (Exception e) {
            log.error("Proxy Grupo A <- fallo técnico uri=/api/doctors msg={}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }


    @Override
    public Object getPatientAppointments(Long patientId, String status, Pageable pageable) {
        try {
            String uri = "/api/appointments?doctorId=0&page="
                    + pageable.getPageNumber()
                    + "&size=" + pageable.getPageSize();

            return clinicalEngineClient.get()
                    .uri(uri)
                    .retrieve()
                    .bodyToMono(Object.class)
                    .block();
        } catch (Exception e) {
            log.error("Error al obtener citas: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    public Object createAppointment(Long patientId, Long doctorId, LocalDateTime dateTime) {
        try {
            String formattedDate = dateTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);

            return clinicalEngineClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/appointments")
                            .queryParam("patientId", patientId)
                            .queryParam("doctorId", doctorId)
                            .queryParam("dateTime", formattedDate)
                            .build())
                    .retrieve()
                    .bodyToMono(Object.class)
                    .block();
        } catch (Exception e) {
            log.error("Error al crear cita en Grupo A: {}", e.getMessage());
            throw new RuntimeException("No se pudo crear la cita. Intente más tarde.");
        }
    }

    @Override
    public Object cancelAppointment(Long appointmentId) {
        try {
            return clinicalEngineClient.put()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/appointments/{id}/status")
                            .queryParam("status", "CANCELLED")
                            .build(appointmentId))
                    .retrieve()
                    .bodyToMono(Object.class)
                    .block();
        } catch (Exception e) {
            log.error("Error al cancelar cita en Grupo A: {}", e.getMessage());
            throw new RuntimeException("No se pudo cancelar la cita. Intente más tarde.");
        }
    }
}
