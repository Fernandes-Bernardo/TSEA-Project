package com.server.api.dto.loan;

import java.util.UUID;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record LoanItemRequest(
        @NotNull UUID toolId,
        @NotNull @Min(1) Integer quantity
) {}
