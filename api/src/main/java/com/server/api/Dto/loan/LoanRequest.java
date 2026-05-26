package com.server.api.dto.loan;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record LoanRequest(
        @NotNull Integer employeeId,

        @NotEmpty @Valid
        List<LoanItemRequest> items,

        @Size(max = 500)
        String notes
) {}
