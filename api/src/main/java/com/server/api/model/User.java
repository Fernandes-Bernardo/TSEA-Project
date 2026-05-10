package com.server.api.model;

import java.io.Serializable;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

    @Column(name = "role", nullable = false)
    private String role;

    @Column(name = "sector", nullable = false)
    private String sector;

    @Column(name = "password", nullable = false)
    private String password;

    // Builders
    public User(String name, String role, String sector, String password) {
        this.name = name;
        this.employeeId = (int) (Math.random() * 100000);
        this.role = role;
        this.sector = sector;
        this.password = password;
    }
}
