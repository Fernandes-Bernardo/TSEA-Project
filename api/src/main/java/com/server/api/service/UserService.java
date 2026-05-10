package com.server.api.service;

import java.util.List;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.server.api.dto.user.UserRequest;
import com.server.api.dto.user.UserResponse;
import com.server.api.model.User;
import com.server.api.repository.UserRepository;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder encoder;

    public UserService(UserRepository userRepository, BCryptPasswordEncoder encoder) {
        this.userRepository = userRepository;
        this.encoder = encoder;
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmployeeId(),
                user.getRole(),
                user.getSector());
    }

    public UserResponse createUser(UserRequest request) {
        String hash = encoder.encode(request.password());

        var user = new User(
                request.name(),
                request.role(),
                request.sector(),
                hash);

        userRepository.save(user);

        return toResponse(user);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public UserResponse getUserByName(String name) {
        return userRepository.findByName(name)
                .stream()
                .findFirst()
                .map(this::toResponse)
                .orElseThrow(() -> new RuntimeException("Usuario não encontrado"));
    }

    public UserResponse getUserByEmployeeID(Integer id) {
        return userRepository.findByEmployeeId(id)
                .map(this::toResponse)
                .orElseThrow(() -> new RuntimeException("Usuario não encontrado"));
    }

}
