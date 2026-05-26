package com.server.api.model;

import java.io.Serializable;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "loans")
@Getter @Setter @NoArgsConstructor
public class Loan implements Serializable {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(name = "employee_id", nullable = false)
    private Integer employeeId;

    @Column(name = "responsible_name", nullable = false)
    private String responsibleName;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private LoanStatus status = LoanStatus.REQUESTED;

    @Column(name = "delivered_by_employee_id")
    private Integer deliveredByEmployeeId;

    @Column(name = "notes")
    private String notes;

    @CreationTimestamp
    @Column(name = "requested_at", updatable = false)
    private Instant requestedAt;

    @Column(name = "delivered_at")
    private Instant deliveredAt;

    @Column(name = "returned_at")
    private Instant returnedAt;

    @OneToMany(mappedBy = "loan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LoanItem> items = new ArrayList<>();

    public Loan(Integer employeeId, String responsibleName) {
        this.employeeId = employeeId;
        this.responsibleName = responsibleName;
        this.status = LoanStatus.REQUESTED;
    }

    public void addItem(LoanItem item) {
        item.setLoan(this);
        this.items.add(item);
    }

    /**
     * @return true se o empréstimo contém apenas itens consumíveis
     * (que não retornam fisicamente).
     */
    public boolean isConsumableOnly() {
        if (items == null || items.isEmpty()) return false;
        return items.stream()
                .allMatch(i -> i.getToolType() == Tools.TypeTool.CONSUMABLE);
    }
}
