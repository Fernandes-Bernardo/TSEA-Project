package com.server.api.controller;

import java.io.IOException;
import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.server.api.dto.ToolsDto;
import com.server.api.dto.UpdateToolDto;
import com.server.api.model.Tools;
import com.server.api.service.ToolImageService;
import com.server.api.service.ToolsService;

import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("api/tools")
public class ToolsController {

    private final ToolsService toolsService;
    private final ToolImageService toolImageService;

    public ToolsController(ToolsService toolsService, ToolImageService toolImageService) {
        this.toolsService = toolsService;
        this.toolImageService = toolImageService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Tools> createTools(@RequestBody ToolsDto toolDto) {
        var tool = toolsService.createTools(toolDto);
        return ResponseEntity
                .created(URI.create("/api/tools/" + tool.getId()))
                .body(tool);
    }

    @GetMapping
    public ResponseEntity<List<Tools>> getAll() {
        return ResponseEntity.ok(toolsService.listTools());
    }

    @GetMapping("/{toolId}")
    public ResponseEntity<Tools> getToolById(@PathVariable("toolId") String id) {
        return toolsService.getToolById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Tools>> searchByName(@RequestParam String name) {
        return ResponseEntity.ok(toolsService.getByName(name));
    }

    @PutMapping("/{toolId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> updateToolById(@PathVariable("toolId") String id, @RequestBody UpdateToolDto updToolDto) {
        toolsService.updateToolById(id, updToolDto);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{toolId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deletedById(@PathVariable("toolId") String id) {
        toolImageService.delete(UUID.fromString(id));
        toolsService.DeleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/{toolId}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Tools> uploadImage(@PathVariable("toolId") String id,
                                             @RequestPart("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(toolImageService.save(UUID.fromString(id), file));
    }

    @GetMapping("/{toolId}/image")
    public ResponseEntity<byte[]> getImage(@PathVariable("toolId") String id) throws IOException {
        var img = toolImageService.load(UUID.fromString(id));
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(img.contentType()))
                .header("Cache-Control", "max-age=300")
                .body(img.bytes());
    }

    @DeleteMapping("/{toolId}/image")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteImage(@PathVariable("toolId") String id) {
        toolImageService.delete(UUID.fromString(id));
        return ResponseEntity.noContent().build();
    }
}
