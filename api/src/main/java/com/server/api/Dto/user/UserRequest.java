package com.server.api.dto.user;

import com.server.api.model.Role;
import jakarta.validation.constraints.*;

public record UserRequest(

    @NotBlank
    String name,

    @NotNull
    Role role,

    @NotBlank
    String sector,

    @NotBlank
    @Size(min = 8)
    String password

) {}