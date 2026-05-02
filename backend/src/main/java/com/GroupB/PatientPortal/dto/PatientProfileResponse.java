package com.GroupB.PatientPortal.dto;

import com.GroupB.PatientPortal.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientProfileResponse {

    private Long id;
    private String fullName;
    private String email;
    private LocalDate birthDate;
    private String phone;
    private Role role;
    private LocalDateTime createdAt;
}