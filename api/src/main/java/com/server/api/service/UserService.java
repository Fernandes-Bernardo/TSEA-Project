package com.server.api.service;

import java.util.List;
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
