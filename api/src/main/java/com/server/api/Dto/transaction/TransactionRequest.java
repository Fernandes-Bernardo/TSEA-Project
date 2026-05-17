package com.server.api.dto.transaction;

    public record TransactionRequest(Integer employeeId, String toolName, Integer toolQuantity){}