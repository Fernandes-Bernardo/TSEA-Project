package com.server.api.repository;

import java.util.List;
import java.util.UUID;

import com.server.api.model.Tools;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ToolsRepository extends JpaRepository<Tools, UUID>{

    List<Tools> findByName(String name);
    List<Tools> findById(int id);
    List<Tools> findByNameContaing(String name);
}
