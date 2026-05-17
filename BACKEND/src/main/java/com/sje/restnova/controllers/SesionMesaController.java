package com.sje.restnova.controllers;

import com.sje.restnova.dtos.response.SesionMesaResponse;
import com.sje.restnova.services.SesionMesaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sesiones-mesa")
@RequiredArgsConstructor

public class SesionMesaController {

    private final SesionMesaService service;

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'CAMARERO')")
    public ResponseEntity<List<SesionMesaResponse>> getAllSessions() {
        return ResponseEntity.ok(service.getAllSessions());
    }

    @GetMapping("/token/{token}")
    public ResponseEntity<SesionMesaResponse> findByToken(@PathVariable String token) {
        
        return ResponseEntity.ok(service.findByToken(token));
    }

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'CAMARERO')")
    public ResponseEntity<SesionMesaResponse> createSession(@RequestBody @jakarta.validation.Valid com.sje.restnova.dtos.request.SesionMesaRequest request) {
        SesionMesaResponse response = service.createSession(request);
        return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}/cerrar")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'CAMARERO')")
    public ResponseEntity<SesionMesaResponse> closeSession(@PathVariable Integer id) {
        return ResponseEntity.ok(service.closeSession(id));
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSession(@PathVariable Integer id) {
        service.deleteSession(id);
        return ResponseEntity.noContent().build();
    }
}

