package com.server.api.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.server.api.model.User;
import com.server.api.service.UserService;

@RestController
@RequestMapping("api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("allEmployees")
    public List<User> getAllUsers(){
        return userService.getAllUsers();
    }

    // Use a DTO to transfer only the necessary data to the client, instead of sending the entire User object
}
