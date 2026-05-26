package com.server.api.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.server.api.dto.user.UserRequest;
import com.server.api.dto.user.UserResponse;
import com.server.api.model.Sector;
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

    @Transactional
    public UserResponse createUser(UserRequest request) {
        if (!Sector.isValid(request.sector())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Setor inválido. Use um dos setores padronizados.");
        }
        String hash = encoder.encode(request.password());

        Integer nextId = nextAvailableEmployeeId();

        var user = new User(
                request.name(),
                nextId,
                request.role(),
                request.sector(),
                hash);

        userRepository.save(user);

        return toResponse(user);
    }

    /**
     * Retorna o próximo employeeId disponível (max + 1). Começa em 1000
     * para reservar IDs baixos para admins/serviço.
     */
    private Integer nextAvailableEmployeeId() {
        Integer max = userRepository.findAll().stream()
                .map(User::getEmployeeId)
                .filter(java.util.Objects::nonNull)
                .max(Integer::compareTo)
                .orElse(999);
        return Math.max(max + 1, 1000);
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
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
    }

    public List<UserResponse> searchByName(String name) {
        if (name == null || name.isBlank()) {
            return getAllUsers();
        }
        return userRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public UserResponse getUserByEmployeeID(Integer id) {
        return userRepository.findByEmployeeId(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
    }

    public void deleteByEmployeeId(Integer employeeId) {
        var user = userRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
        userRepository.delete(user);
    }
}
