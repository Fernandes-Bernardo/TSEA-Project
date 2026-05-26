package com.server.api.dto;

import com.server.api.model.Tools.TypeTool;

public record ToolsDto(
        String name,
        String description,
        int quantity,
        Integer minQuantity,
        TypeTool type,
        String levelSecurity
){}
