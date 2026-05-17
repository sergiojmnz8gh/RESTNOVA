package com.sje.restnova.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sje.restnova.dtos.request.LoginRequest;
import com.sje.restnova.dtos.request.UsuarioRequest;
import com.sje.restnova.entities.Usuario;
import com.sje.restnova.security.JwtService;
import com.sje.restnova.security.TokenResponse;
import com.sje.restnova.services.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor

public class AuthController {

    private final AuthService authService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final com.sje.restnova.dtos.mapper.UsuarioMapper usuarioMapper;

    @PostMapping("/registro")
    public ResponseEntity<TokenResponse> register(@RequestBody @Valid UsuarioRequest request) {
        Usuario usuario = authService.registrarUsuario(request);
        String token = jwtService.generateToken(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(new TokenResponse(token, usuarioMapper.toResponseDTO(usuario)));
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody @Valid LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        Usuario usuario = (Usuario) authentication.getPrincipal();
        String token = jwtService.generateToken(usuario);

        return ResponseEntity.ok(new TokenResponse(token, usuarioMapper.toResponseDTO(usuario)));
    }

    @PostMapping("/google")
    public ResponseEntity<TokenResponse> googleLogin(@RequestBody java.util.Map<String, String> body) {
        try {
            String credential = body.get("credential");
            Usuario usuario = authService.processGoogleLogin(credential);
            String token = jwtService.generateToken(usuario);
            return ResponseEntity.ok(new TokenResponse(token, usuarioMapper.toResponseDTO(usuario)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}

