package com.server.api.model;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

@Entity
public class Tools{
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
    private String type;

    @Column(name="levelSecurity", nullable = false)
    private String levelSecurity;

    @CreationTimestamp
    private Instant dateCreation;

    @UpdateTimestamp
    private Instant dateUpdate;

    // Builders
    public Tools() {}
    
    public Tools(String name, String description, int quantity, String type, String levelSecurity, Instant dateCreation, Instant dateUpdate){
        this.name = name;
        this.description = description;
        this.quantity = quantity;
        this.type = type;
        this.levelSecurity = levelSecurity;
    }

    // Getters e Setters

    public UUID getId(){
        return id;
    }

    public void setId(UUID id){
        this.id = id;
    }

    public String getName(){
        return name;
    }

    public void setName(String name){
        this.name = name;
    }

    public String getDescription(){
        return description;
    }

    public void setDescription(String description){
        this.description = description;
    }

    public int getQuantity(){
        return quantity;
    }

    public void setQuantity(int quantity){
        this.quantity = quantity;
    }

    public String getType(){
        return type;
    }

    public void setType(String type){
        this.type = type;
    }

    public String getLevelSecurity(){
        return levelSecurity;
    }

    public void setLevelSecurity(String levelSecurity){
        this.levelSecurity = levelSecurity;
    }
}