package com.server.api.model;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter @NoArgsConstructor
public class Tools implements Serializable{
    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(name="name", nullable = false)
    private String name;

    @Column(name="description", nullable = false)
    private String description;

    @Column(name="quantity", nullable = false)
    private int quantity;

    @Column(name="type", nullable = false)
    @Enumerated(EnumType.STRING)
    private TypeTool type;

    @Column(name="levelSecurity", nullable = false)
    private String levelSecurity;

    @CreationTimestamp
    private Instant dateCreation;

    @UpdateTimestamp
    private Instant dateUpdate;

    public enum TypeTool{ // Definição para usar enum no atributo
        Consumivel,
        Uso_Diário
    }

    // Builders
    
    public Tools(UUID id, String name, String description, int quantity, TypeTool type, String levelSecurity, Instant dateCreation, Instant dateUpdate){
        this.id = id;
        this.name = name;
        this.description = description;
        this.quantity = quantity;
        this.type = type;
        this.levelSecurity = levelSecurity;
        this.dateCreation = dateCreation;
        this.dateUpdate = dateUpdate;
    }
}