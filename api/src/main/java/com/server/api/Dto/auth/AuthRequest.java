package com.server.api.dto.auth;

import jakarta.validation.constraints.*;

public record AuthRequest(

    @NotNull(message = "Employee ID é obrigatório")
    Integer employeeId,

    @NotBlank(message = "Senha é obrigatória")
    String password

) {}