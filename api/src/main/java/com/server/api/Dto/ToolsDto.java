package com.server.api.Dto;

import java.time.Instant;
import java.util.UUID;

public class ToolsDto {
    private UUID id;
    private String name;
    private String description;
    private int quantity;
    private String type;
    private String levelSecurity;
    private Instant dateCreation;
    private Instant dateUpdate;

    // Builders
    public ToolsDto(){}
    
    public ToolsDto(UUID id, String name, String description, int quantity, String type, String levelSecurity, Instant dateCreation, Instant dateUpdate){
        this.id = id;
        this.name = name;
        this.description = description;
        this.quantity = quantity;
        this.type = type;
        this.levelSecurity = levelSecurity;
        this.dateCreation = dateCreation;
        this.dateUpdate = dateUpdate;
    }

    // Getters e setters
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

    public Instant getDateCreation(){
        return dateCreation;
    }

    public void setDateCreation(Instant dateCreation){
        this.dateCreation = dateCreation;
    }

    public Instant getDateUpdate(){
        return dateUpdate;
    }

    public void setDateUpdate(Instant dateUpdate){
        this.dateUpdate = dateUpdate;
    }
}
