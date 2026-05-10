package com.server.api.dto.user;

import java.util.UUID;

import com.server.api.model.Role;

public record UserResponse(

    UUID id,
    String name,
    Integer employeeId,
    Role role,
    String sector

) {}