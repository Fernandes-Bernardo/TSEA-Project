package com.server.api.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.server.api.model.Role;
import com.server.api.model.User;
import com.server.api.repository.UserRepository;

@Configuration
public class BootstrapAdmin {

    private static final Logger log = LoggerFactory.getLogger(BootstrapAdmin.class);

    @Bean
    public CommandLineRunner seedAdmin(
            UserRepository repo,
            BCryptPasswordEncoder encoder,
            @Value("${app.bootstrap.admin.password}") String adminPassword) {
        return args -> {
            boolean adminExists = repo.findAll().stream().anyMatch(u -> u.getRole() == Role.ROLE_ADMIN);
            if (!adminExists) {
                var admin = new User(
                        "Administrador",
                        1,
                        Role.ROLE_ADMIN,
                        "TI",
                        encoder.encode(adminPassword));
                repo.save(admin);
                log.info("Admin padrão criado: employeeId=1. Use a variável de ambiente ADMIN_PASSWORD para definir a senha.");
            }
        };
    }
}
