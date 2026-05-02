package com.GroupB.PatientPortal.service;

import com.GroupB.PatientPortal.entity.Patient;

public interface EspoCrmService {
    void syncContact(Patient patient);
}