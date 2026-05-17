package com.sje.restnova.controllers;

import com.sje.restnova.dtos.response.UsuarioResponse;
import com.sje.restnova.entities.Usuario;
import com.sje.restnova.services.UsuarioService;
import com.sje.restnova.services.ImagenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final ImagenService imagenService;

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

    @PostMapping("/{id}/imagen")
    public ResponseEntity<UsuarioResponse> uploadImage(@PathVariable Integer id, @RequestParam("imagen") MultipartFile imagen) {
        String imagenUrl = imagenService.guardarImagenUsuario(imagen, id);
        if (imagenUrl != null) {
            UsuarioResponse response = usuarioService.updateUserImage(id, imagenUrl);
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().build();
    }

    

    @GetMapping("/me")
    public ResponseEntity<UsuarioResponse> getProfile(@AuthenticationPrincipal Usuario currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(usuarioService.getProfile(currentUser));
    }

    @PutMapping("/me")
    public ResponseEntity<UsuarioResponse> updateProfile(@AuthenticationPrincipal Usuario currentUser, @RequestBody Map<String, Object> updates) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(usuarioService.updateProfile(currentUser, updates));
    }

    @PostMapping("/me/imagen")
    public ResponseEntity<UsuarioResponse> uploadOwnImage(@AuthenticationPrincipal Usuario currentUser, @RequestParam("file") MultipartFile imagen) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        String imagenUrl = imagenService.guardarImagenUsuario(imagen, currentUser.getId());
        if (imagenUrl != null) {
            UsuarioResponse response = usuarioService.updateUserImage(currentUser.getId(), imagenUrl);
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().build();
    }

    @PostMapping("/me/password")
    public ResponseEntity<Void> changePassword(@AuthenticationPrincipal Usuario currentUser, @RequestBody Map<String, String> passwordData) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        usuarioService.changePassword(currentUser, passwordData);
        return ResponseEntity.ok().build();
    }
}
