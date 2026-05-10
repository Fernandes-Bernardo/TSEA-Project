package com.server.api.model;

import java.io.Serializable;
import java.util.Random;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")  
@Getter @Setter @NoArgsConstructor
public class User implements Serializable{
    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "employeeId", nullable = false, unique = true)
    private Integer employeeId;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role;

    @Column(name = "sector", nullable = false)
    private String sector;

    @Column(name = "password", nullable = false)
    private String password;

    // Builders
    public User(String name, Role role, String sector, String password) {
        this.name = name;
        this.employeeId = /*(int) (Math.random() * 100000)*/ new Random().nextInt(1_000_000); // TEST
        this.role = role;
        this.sector = sector;
        this.password = password;
    }

}
