package com.server.api.service;

import java.security.Key;
import java.util.Date;

import org.springframework.stereotype.Service;

import com.server.api.model.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {
    private static final String secret = "chave-temporaria-para-testes-de-laboratorio-123-123-3";

    private Key key = Keys.hmacShaKeyFor(secret.getBytes());

    private final long EXPIRATION = 1000 * 60 * 60 * 24;

    public String generateToken(User user) {
        return Jwts.builder()
                .setSubject(user.getEmployeeId().toString()) // identifier
                .claim("role", user.getRole().name())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(key)
                .compact();
    }

    public String extractEmployeeId(String token) {
        return extractAllClaims(token).getSubject();
    }

    public String extractRole(String token) {
    return extractAllClaims(token).get("role", String.class);
}

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean isTokenValid(String token) {
        try {
            extractAllClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isTokenExpired(String token) {
        return extractAllClaims(token)
                .getExpiration()
                .before(new Date());
    }
}