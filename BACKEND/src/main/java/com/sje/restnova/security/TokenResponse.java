package com.sje.restnova.security;

import com.sje.restnova.dtos.response.UsuarioResponse;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TokenResponse {
    private final String token;
    private final UsuarioResponse usuario;
}