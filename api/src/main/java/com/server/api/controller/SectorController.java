package com.server.api.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.server.api.model.Sector;

@RestController
@RequestMapping("api/sectors")
public class SectorController {

    @GetMapping
    public ResponseEntity<List<String>> list() {
        return ResponseEntity.ok(Sector.VALUES);
    }
}
