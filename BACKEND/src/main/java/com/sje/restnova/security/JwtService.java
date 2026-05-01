package com.sje.restnova.security;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.sje.restnova.entities.Usuario;

import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final SecretKey secretKey;

    public String generateToken(Usuario usuario) {
        Instant now = Instant.now();
        Date expiryDate = Date.from(now.plus(30, ChronoUnit.DAYS));

        return Jwts.builder()
                .subject(usuario.getEmail())
                .id(String.valueOf(usuario.getId()))
                .issuedAt(Date.from(now))
                .expiration(expiryDate)
                .claim("rol", usuario.getRol().getNombre())
                .claim("email", usuario.getEmail())
                .signWith(secretKey)
                .compact();
    }

    public String extractUsername(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        Date expiration = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getExpiration();
        return expiration.before(new Date());
    }
}