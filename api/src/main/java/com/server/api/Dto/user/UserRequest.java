package com.server.api.dto.user;

import jakarta.validation.constraints.*;

public record UserRequest(

    @NotBlank
    String name,

    @NotBlank
    String role,

    @NotBlank
    String sector,

    @NotBlank
    @Size(min = 8)
    String password

) {}