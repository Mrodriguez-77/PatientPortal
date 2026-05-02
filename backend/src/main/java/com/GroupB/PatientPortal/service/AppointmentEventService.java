package com.GroupB.PatientPortal.service;

import com.GroupB.PatientPortal.dto.AppointmentEventMessage;

public interface AppointmentEventService {
    void processConfirmedAppointment(AppointmentEventMessage event);
    void processCancellation(AppointmentEventMessage event);
    void processStatusChange(AppointmentEventMessage event);
}