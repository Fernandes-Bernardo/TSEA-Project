package com.server.api.model;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.server.api.model.Tools.TypeTool;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter @NoArgsConstructor
public class Transaction implements Serializable{
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    @Column(name = "employee_id", nullable = false)
    private Integer employee_id;

    @Column(name = "responsible", nullable = false)
    private String responsible;

    @Column(name = "tool_id", nullable = false)
    private UUID toolId;

    @Column(name = "tool_name", nullable = false)
    private String toolName;

    @Column(name = "tool_type", nullable = false)
    private TypeTool toolType;

    @Column(name = "tool_quantity", nullable = false)
    private Integer toolQuantity;

    @Column(name = "status", nullable = false)
    private Boolean status;

    @CreationTimestamp
    private Instant caughtDate;

    @UpdateTimestamp
    private Instant returnedDate;

    // Builder
    public Transaction(Integer employeeId, String responsible, UUID toolId, String toolName, TypeTool toolType, Integer toolQuantity){
        this.employee_id = employeeId;
        this.responsible = responsible;
        this.toolId = toolId;
        this.toolName = toolName;
        this.toolType = toolType;
        this.toolQuantity = toolQuantity;
        status = false;
    }
}