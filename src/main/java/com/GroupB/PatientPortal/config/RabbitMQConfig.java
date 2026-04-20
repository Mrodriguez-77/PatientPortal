package com.GroupB.PatientPortal.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE = "appointments.exchange";

    public static final String QUEUE_CONFIRMED = "patient.appointments.confirmed";
    public static final String QUEUE_CANCELLED = "patient.appointments.cancelled";
    public static final String QUEUE_STATUS_CHANGED = "patient.appointments.status.changed";

    public static final String ROUTING_CONFIRMED = "appointment.confirmed";
    public static final String ROUTING_CANCELLED = "appointment.cancelled";
    public static final String ROUTING_STATUS_CHANGED = "appointment.status.changed";

    @Bean
    public DirectExchange appointmentsExchange() {
        return new DirectExchange(EXCHANGE, true, false);
    }

    @Bean
    public Queue confirmedQueue() {
        return new Queue(QUEUE_CONFIRMED, true);
    }

    @Bean
    public Queue cancelledQueue() {
        return new Queue(QUEUE_CANCELLED, true);
    }

    @Bean
    public Queue statusChangedQueue() {
        return new Queue(QUEUE_STATUS_CHANGED, true);
    }

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
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
