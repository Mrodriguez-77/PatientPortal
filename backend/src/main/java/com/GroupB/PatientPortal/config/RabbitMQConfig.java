package com.GroupB.PatientPortal.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // ── Exchange principal ──────────────────────────────────────
    public static final String EXCHANGE = "appointments.exchange";

    // ── Routing keys ────────────────────────────────────────────
    public static final String ROUTING_CONFIRMED = "appointment.confirmed";
    public static final String ROUTING_CANCELLED = "appointment.cancelled";
    public static final String ROUTING_STATUS_CHANGED = "appointment.status.changed";
    public static final String ROUTING_ESPOCRM = "espocrm.sync";

    // ── Queues principales ──────────────────────────────────────
    public static final String QUEUE_CONFIRMED = "patient.appointments.confirmed";
    public static final String QUEUE_CANCELLED = "patient.appointments.cancelled";
    public static final String QUEUE_STATUS_CHANGED = "patient.appointments.status.changed";
    public static final String QUEUE_ESPOCRM_SYNC = "espocrm.sync.queue";

    // ── Dead Letter Queue ───────────────────────────────────────
    public static final String DLQ_EXCHANGE = "appointments.dlx";
    public static final String DLQ_CONFIRMED = "patient.appointments.confirmed.dlq";
    public static final String DLQ_CANCELLED = "patient.appointments.cancelled.dlq";
    public static final String DLQ_STATUS_CHANGED = "patient.appointments.status.changed.dlq";
    public static final String QUEUE_ESPOCRM_DLQ = "espocrm.sync.dlq";

    // ── Serialización JSON ──────────────────────────────────────
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitAdmin rabbitAdmin(ConnectionFactory connectionFactory) {
        return new RabbitAdmin(connectionFactory);
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }

    // ── Exchange principal ──────────────────────────────────────
    @Bean
    public DirectExchange appointmentsExchange() {
        return new DirectExchange(EXCHANGE, true, false);
    }

    // ── Dead Letter Exchange ────────────────────────────────────
    @Bean
    public DirectExchange deadLetterExchange() {
        return new DirectExchange(DLQ_EXCHANGE, true, false);
    }

    // ── Queues principales con DLQ configurada ──────────────────
    @Bean
    public Queue confirmedQueue() {
        return QueueBuilder.durable(QUEUE_CONFIRMED)
                .withArgument("x-dead-letter-exchange", DLQ_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", DLQ_CONFIRMED)
                .build();
    }

    @Bean
    public Queue cancelledQueue() {
        return QueueBuilder.durable(QUEUE_CANCELLED)
                .withArgument("x-dead-letter-exchange", DLQ_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", DLQ_CANCELLED)
                .build();
    }

    @Bean
    public Queue statusChangedQueue() {
        return QueueBuilder.durable(QUEUE_STATUS_CHANGED)
                .withArgument("x-dead-letter-exchange", DLQ_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", DLQ_STATUS_CHANGED)
                .build();
    }

    @Bean
    public Queue espoCrmSyncQueue() {
        return QueueBuilder.durable(QUEUE_ESPOCRM_SYNC)
                .withArgument("x-dead-letter-exchange", DLQ_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", QUEUE_ESPOCRM_DLQ)
                .build();
    }

    // ── Dead Letter Queues ──────────────────────────────────────
    @Bean
    public Queue dlqConfirmed() {
        return new Queue(DLQ_CONFIRMED, true);
    }

    @Bean
    public Queue dlqCancelled() {
        return new Queue(DLQ_CANCELLED, true);
    }

    @Bean
    public Queue dlqStatusChanged() {
        return new Queue(DLQ_STATUS_CHANGED, true);
    }

    @Bean
    public Queue dlqEspoCrmSync() {
        return new Queue(QUEUE_ESPOCRM_DLQ, true);
    }

    // ── Bindings principales ────────────────────────────────────
    @Bean
    public Binding confirmedBinding() {
        return BindingBuilder.bind(confirmedQueue())
                .to(appointmentsExchange())
                .with(ROUTING_CONFIRMED);
    }

    @Bean
    public Binding cancelledBinding() {
        return BindingBuilder.bind(cancelledQueue())
                .to(appointmentsExchange())
                .with(ROUTING_CANCELLED);
    }

    @Bean
    public Binding statusChangedBinding() {
        return BindingBuilder.bind(statusChangedQueue())
                .to(appointmentsExchange())
                .with(ROUTING_STATUS_CHANGED);
    }

    @Bean
    public Binding espoCrmSyncBinding() {
        return BindingBuilder.bind(espoCrmSyncQueue())
                .to(appointmentsExchange())
                .with(ROUTING_ESPOCRM);
    }

    // ── Bindings DLQ ────────────────────────────────────────────
    @Bean
    public Binding dlqConfirmedBinding() {
        return BindingBuilder.bind(dlqConfirmed())
                .to(deadLetterExchange())
                .with(DLQ_CONFIRMED);
    }

    @Bean
    public Binding dlqCancelledBinding() {
        return BindingBuilder.bind(dlqCancelled())
                .to(deadLetterExchange())
                .with(DLQ_CANCELLED);
    }

    @Bean
    public Binding dlqStatusChangedBinding() {
        return BindingBuilder.bind(dlqStatusChanged())
                .to(deadLetterExchange())
                .with(DLQ_STATUS_CHANGED);
    }

    @Bean
    public Binding dlqEspoCrmSyncBinding() {
        return BindingBuilder.bind(dlqEspoCrmSync())
                .to(deadLetterExchange())
                .with(QUEUE_ESPOCRM_DLQ);
    }

}