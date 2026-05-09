package com.GroupB.PatientPortal.controller;

import com.GroupB.PatientPortal.config.RabbitMQConfig;
import com.GroupB.PatientPortal.dto.AppointmentEventMessage;
import com.GroupB.PatientPortal.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@Profile("dev")   // solo activo con --spring.profiles.active=dev
public class TestEventController {

    private final RabbitTemplate rabbitTemplate;

    @PostMapping("/event/confirmed")
    public ResponseEntity<ApiResponse<String>> fireConfirmed(
            @RequestBody AppointmentEventMessage event) {
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE,
                RabbitMQConfig.ROUTING_CONFIRMED,
                event);
        return ResponseEntity.ok(ApiResponse.success(
                "Evento publicado", "routing_key: appointment.confirmed"));
    }

    @PostMapping("/event/cancelled")
    public ResponseEntity<ApiResponse<String>> fireCancelled(
            @RequestBody AppointmentEventMessage event) {
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE,
                RabbitMQConfig.ROUTING_CANCELLED,
                event);
        return ResponseEntity.ok(ApiResponse.success(
                "Evento publicado", "routing_key: appointment.cancelled"));
    }

    @PostMapping("/event/status-changed")
    public ResponseEntity<ApiResponse<String>> fireStatusChanged(
            @RequestBody AppointmentEventMessage event) {
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE,
                RabbitMQConfig.ROUTING_STATUS_CHANGED,
                event);
        return ResponseEntity.ok(ApiResponse.success(
                "Evento publicado", "routing_key: appointment.status.changed"));
    }
}