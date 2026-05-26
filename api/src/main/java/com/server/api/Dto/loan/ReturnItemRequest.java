package com.server.api.dto.loan;

import java.util.UUID;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Devolução parcial: o almoxarife informa qual item do empréstimo
 * está voltando e quantas unidades.
 */
public record ReturnItemRequest(
        @NotNull UUID loanItemId,
        @NotNull @Min(1) Integer quantity
) {}
