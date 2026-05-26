package com.server.api.model;

public enum LoanStatus {
    REQUESTED,   // Usuário criou a solicitação; aguardando entrega
    DELIVERED,   // Almoxarife entregou; em uso pelo funcionário
    RETURNED,    // Todos os itens devolvidos (ou empréstimo só de consumíveis)
    CANCELLED    // Cancelado antes da entrega
}
