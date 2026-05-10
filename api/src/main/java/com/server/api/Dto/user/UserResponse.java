package com.server.api.dto.user;

import java.util.UUID;

public record UserResponse(

    UUID id,
    String name,
    Integer employeeId,
    String role,
    String sector

) {}