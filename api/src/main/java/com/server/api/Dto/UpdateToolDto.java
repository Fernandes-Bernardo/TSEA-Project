package com.server.api.dto;

import com.server.api.model.Tools.TypeTool;

public record UpdateToolDto (String name, String description, TypeTool type, String levelSecurity){} // Dto for update information from escified tool
