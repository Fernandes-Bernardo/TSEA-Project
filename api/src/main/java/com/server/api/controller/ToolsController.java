package com.server.api.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.server.api.Dto.ToolsDto;
import com.server.api.Dto.UpdateToolDto;
import com.server.api.model.Tools;
import com.server.api.service.ToolsService;

import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("api/tools")
public class ToolsController{ 

    private ToolsService toolsService;

    public ToolsController(ToolsService toolsService){
        this.toolsService = toolsService;
    }
    
    @PostMapping
    public ResponseEntity<Tools> createTools(@RequestBody ToolsDto toolDto){
        var toolId = toolsService.createTools(toolDto);
        return ResponseEntity.created(URI.create("api/tools" + toolId.toString())).build(); // Return id after creat tool
    }

    @GetMapping("/{toolId}")
    public ResponseEntity<Tools> getToolById(@PathVariable("toolId") String id){
        var tool = toolsService.getToolById(id);
        if(tool.isPresent()){
            return ResponseEntity.ok(tool.get());
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("api/tool/name")
    public ResponseEntity<List<Tools>> getAllTool(String name){
        var tools = toolsService.listTools();

        return ResponseEntity.ok(tools);
    }

    @PutMapping("{toolId}")
    public ResponseEntity<Void> updateToolById(@PathVariable("toolId") String id, @RequestBody UpdateToolDto updToolDto){
        toolsService.updateToolById(id, updToolDto);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{toolId}")
    public ResponseEntity<Void> deletedById(@PathVariable("toolId") String id){
        toolsService.DeleteById(id);
        return ResponseEntity.noContent().build();
    }

}
