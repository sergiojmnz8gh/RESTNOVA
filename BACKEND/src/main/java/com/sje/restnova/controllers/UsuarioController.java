package com.sje.restnova.controllers;

import com.sje.restnova.dtos.response.UsuarioResponse;
import com.sje.restnova.services.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> getAllUsers() {
        return ResponseEntity.ok(usuarioService.getAllUsers());
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponse> updateUser(@PathVariable Integer id, @RequestBody @jakarta.validation.Valid com.sje.restnova.dtos.request.UsuarioRequest request) {
        return ResponseEntity.ok(usuarioService.updateUser(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        usuarioService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

}
