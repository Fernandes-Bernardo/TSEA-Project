package com.server.api.Dto;

import java.util.UUID;

public class UserDto {
    
    private UUID id;
    private String name;
    private Integer employeeId;
    private String role;
    private String sector;
    private String password;

    // Builders
    public UserDto(UUID id, String name, Integer employeeID, String role, String sector, String password) {
        this.id = id;
        this.name = name;
        this.employeeId = employeeID;
        this.role = role;
        this.sector = sector;
        this.password = password;
    }

    // Getters and Setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Integer employeeId) {
        this.employeeId = employeeId;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getSector() {
        return sector;
    }

    public void setSector(String sector) {
        this.sector = sector;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }    
}
