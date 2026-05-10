package com.server.api.controller;

import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.server.api.dto.user.UserRequest;
import com.server.api.dto.user.UserResponse;
import com.server.api.service.AuthService;
import com.server.api.service.UserService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService, AuthService authService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers(){
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{employeeId}")
    public ResponseEntity<UserResponse> getByEmployeeId(@PathVariable Integer employeeId){
        return ResponseEntity.ok(userService.getUserByEmployeeID(employeeId));
    }
    @GetMapping("/search")
    public ResponseEntity<UserResponse> getByName(@RequestParam String name){
        return ResponseEntity.ok(userService.getUserByName(name));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> createUser(@RequestBody @Valid UserRequest request) {
        var user = userService.createUser(request);

        return ResponseEntity
            .created(URI.create("/api/users/" + user.employeeId()))
            .body(user);
    }

}