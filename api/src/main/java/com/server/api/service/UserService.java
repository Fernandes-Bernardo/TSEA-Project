package com.server.api.service;

import org.springframework.stereotype.Service;

import com.server.api.model.User;
import com.server.api.repository.UserRepository;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final Encrypt encrypt;

    public UserService(UserRepository userRepository, Encrypt encrypt) {
        this.userRepository = userRepository;
        this.encrypt = encrypt;
    }

    public User createUser(String name, Integer employeeID, String role, String sector, String password) {
        String hashPass = encrypt.passwordEncoder().encode(password);

        var user = new User(
            name,
            employeeID,
            role,
            sector,
            hashPass
        );

        return userRepository.save(user);
    }
}
