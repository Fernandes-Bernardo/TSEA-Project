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

public UserResponse createUser(UserRequest request) {
    String hash = encoder.encode(request.password());

    var user = new User(
        request.name(),
        request.role(),
        request.sector(),
        hash
    );

    userRepository.save(user);

    return new UserResponse(
        user.getId(),
        user.getName(),
        user.getEmployeeId(),
        user.getRole(),
        user.getSector()
    );
}

    public List<User> getAllUsers(){
        return userRepository.findAll();
    }

    public User getUserByName(String name){
        var user = userRepository.findByName(name);

        if(user.isEmpty()){
            throw new RuntimeException("Usuario não encontrado");
        } else {
            return user.get(0);
        }
    }

    public User getUserByEmployeeID(Integer id){
        var user = userRepository.findByEmployeeId(id);

        if (user.isEmpty()){
            throw new RuntimeException("Usuario não encontrado");            
        } else {
            return user.get(0);
        }
    }


}
