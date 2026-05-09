package com.GroupB.PatientPortal.listener;

import com.GroupB.PatientPortal.config.RabbitMQConfig;
import com.GroupB.PatientPortal.dto.AppointmentEventMessage;
import com.GroupB.PatientPortal.service.AppointmentEventService;
import com.rabbitmq.client.Channel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;
import org.springframework.amqp.core.Message;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class AppointmentEventListener {

    private final AppointmentEventService appointmentEventService;

    @RabbitListener(queues = RabbitMQConfig.QUEUE_CONFIRMED)
    public void consumeConfirmed(AppointmentEventMessage event,
                                 Message message,
                                 Channel channel,
                                 @Header(AmqpHeaders.DELIVERY_TAG) long tag) {
        try {
            log.info("RabbitMQ recibido [confirmed]: appointmentId={}",
                    event.getAppointmentId());
            appointmentEventService.processConfirmedAppointment(event);
            channel.basicAck(tag, false);
        } catch (Exception e) {
            log.error("Error procesando confirmed, nack: {}", e.getMessage());
            try {
                channel.basicNack(tag, false, false);
            } catch (IOException ioException) {
                log.error("Error enviando nack confirmed: {}", ioException.getMessage());
            }
        }
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_CANCELLED)
    public void consumeCancelled(AppointmentEventMessage event,
                                 Message message,
                                 Channel channel,
                                 @Header(AmqpHeaders.DELIVERY_TAG) long tag) {
        try {
            log.info("RabbitMQ recibido [cancelled]: appointmentId={}",
                    event.getAppointmentId());
            appointmentEventService.processCancellation(event);
            channel.basicAck(tag, false);
        } catch (Exception e) {
            log.error("Error procesando cancelled, nack: {}", e.getMessage());
            try {
                channel.basicNack(tag, false, false);
            } catch (IOException ioException) {
                log.error("Error enviando nack cancelled: {}", ioException.getMessage());
            }
        }
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_STATUS_CHANGED)
    public void consumeStatusChanged(AppointmentEventMessage event,
                                     Message message,
                                     Channel channel,
                                     @Header(AmqpHeaders.DELIVERY_TAG) long tag) {
        try {
            log.info("RabbitMQ recibido [status.changed]: appointmentId={}, status={}",
                    event.getAppointmentId(), event.getStatus());
            appointmentEventService.processStatusChange(event);
            channel.basicAck(tag, false);
        } catch (Exception e) {
            log.error("Error procesando status.changed, nack: {}", e.getMessage());
            try {
                channel.basicNack(tag, false, false);
            } catch (IOException ioException) {
                log.error("Error enviando nack status.changed: {}", ioException.getMessage());
            }
        }
    }
}