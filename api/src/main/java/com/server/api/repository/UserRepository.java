package com.server.api.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.server.api.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    List<User> findByName(String name);
    List<User> findByEmployeeId(String employeeId);
}
