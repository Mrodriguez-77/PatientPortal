package com.GroupB.PatientPortal.scheduler;

import com.GroupB.PatientPortal.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class EspoCrmSyncReprocessor {

    private final RabbitTemplate rabbitTemplate;

    @Scheduled(fixedDelay = 300_000)
    public void reprocessDlq() {
        int count = 0;
        while (true) {
            Message msg = rabbitTemplate.receive(
                    RabbitMQConfig.QUEUE_ESPOCRM_DLQ, 500);
            if (msg == null) {
                break;
            }
            rabbitTemplate.send(
                    RabbitMQConfig.EXCHANGE,
                    RabbitMQConfig.ROUTING_ESPOCRM,
                    msg);
            count++;
        }
        if (count > 0) {
            log.info("EspoCRM DLQ: {} mensajes re-encolados", count);
        }
    }
}


