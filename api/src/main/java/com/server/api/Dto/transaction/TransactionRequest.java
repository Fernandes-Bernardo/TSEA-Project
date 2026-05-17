package com.server.api.dto.transaction;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TransactionRequest(
        @NotNull
        Integer employeeId,
        
        @NotBlank
        String toolName,

        @NotNull
        @Min(1)
        Integer toolQuantity
    ){}