package com.server.api.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.server.api.dto.auth.AuthRequest;
import com.server.api.dto.auth.AuthResponse;
import com.server.api.repository.UserRepository;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder encoder;
    private final JwtService jwtService;
    
    public AuthService(UserRepository userRepository, BCryptPasswordEncoder encoder, JwtService jwtService){
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.jwtService = jwtService;
    }

    public AuthResponse login(AuthRequest request){
        var user = userRepository.findByEmployeeId(request.employeeId())
        .orElseThrow(() -> new RuntimeException("Usuario não encontrado"));

        boolean passwordMatch = encoder.matches(
            request.password(), 
            user.getPassword()
        );

        if(!passwordMatch){
            throw new RuntimeException("Senha invalida!");
        }

        String token = jwtService.generateToken(user);

        return new AuthResponse(token);
    }
}
