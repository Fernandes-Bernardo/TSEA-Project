package com.server.api.model;

import java.io.Serializable;
import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.server.api.model.Tools.TypeTool;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "loan_items")
@Getter @Setter @NoArgsConstructor
public class LoanItem implements Serializable {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "loan_id", nullable = false)
    @JsonIgnore
    private Loan loan;

    @Column(name = "tool_id", nullable = false)
    private UUID toolId;

    @Column(name = "tool_name", nullable = false)
    private String toolName;

    @Column(name = "tool_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private TypeTool toolType;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    /**
     * Para consumíveis, fica igual a quantity assim que entregue.
     * Para ferramentas, é incrementado conforme as devoluções acontecem.
     */
    @Column(name = "returned_quantity", nullable = false)
    private Integer returnedQuantity = 0;

    public LoanItem(UUID toolId, String toolName, TypeTool toolType, Integer quantity) {
        this.toolId = toolId;
        this.toolName = toolName;
        this.toolType = toolType;
        this.quantity = quantity;
        this.returnedQuantity = 0;
    }
}
