package com.server.api.dto;

import com.server.api.model.Tools.TypeTool;

public record UpdateToolDto (
        String name,
        String description,
        Integer quantity,
        Integer minQuantity,
        TypeTool type,
        String levelSecurity
){}
