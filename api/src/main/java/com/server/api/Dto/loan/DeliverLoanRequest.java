package com.server.api.dto.loan;

import jakarta.validation.constraints.NotNull;

/**
 * Quando o almoxarife clica em "Entregar", o frontend manda o employeeId
 * lido do crachá do funcionário. O backend valida que bate com o do empréstimo.
 */
public record DeliverLoanRequest(
        @NotNull Integer scannedEmployeeId
) {}
