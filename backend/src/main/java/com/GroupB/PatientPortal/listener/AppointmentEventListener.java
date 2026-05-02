package com.GroupB.PatientPortal.listener;

import com.GroupB.PatientPortal.config.RabbitMQConfig;
import com.GroupB.PatientPortal.dto.AppointmentEventMessage;
import com.GroupB.PatientPortal.service.AppointmentEventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AppointmentEventListener {

    private final AppointmentEventService appointmentEventService;

    @RabbitListener(queues = RabbitMQConfig.QUEUE_CONFIRMED)
    public void consumeConfirmed(AppointmentEventMessage event) {
        log.info("RabbitMQ recibido [confirmed]: appointmentId={}",
                event.getAppointmentId());
        appointmentEventService.processConfirmedAppointment(event);
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_CANCELLED)
    public void consumeCancelled(AppointmentEventMessage event) {
        log.info("RabbitMQ recibido [cancelled]: appointmentId={}",
                event.getAppointmentId());
        appointmentEventService.processCancellation(event);
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_STATUS_CHANGED)
    public void consumeStatusChanged(AppointmentEventMessage event) {
        log.info("RabbitMQ recibido [status.changed]: appointmentId={}, status={}",
                event.getAppointmentId(), event.getStatus());
        appointmentEventService.processStatusChange(event);
    }
}