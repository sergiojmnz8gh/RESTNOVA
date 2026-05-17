package com.sje.restnova.security;

import com.sje.restnova.dtos.response.UsuarioResponse;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
public class TokenResponse {
    private final String token;
    private final UsuarioResponse usuario;

    public TokenResponse(String token, UsuarioResponse usuario) {
        this.token = token;
        this.usuario = usuario;
    }
}

