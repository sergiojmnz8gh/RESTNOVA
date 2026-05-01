package com.sje.restnova.controllers;

import com.sje.restnova.dtos.response.ReservaResponse;
import com.sje.restnova.services.ReservaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservas")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ReservaController {

    private final ReservaService reservaService;

    @GetMapping
    public ResponseEntity<List<ReservaResponse>> listarReservas() {
        return ResponseEntity.ok(reservaService.listarTodas());
    }

    @PostMapping
    public ResponseEntity<ReservaResponse> crearReserva(@RequestBody @jakarta.validation.Valid com.sje.restnova.dtos.request.ReservaRequest request) {
        ReservaResponse response = reservaService.crearReserva(request);
        return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReservaResponse> actualizarReserva(@PathVariable Integer id, @RequestBody @jakarta.validation.Valid com.sje.restnova.dtos.request.ReservaRequest request) {
        return ResponseEntity.ok(reservaService.actualizarReserva(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarReserva(@PathVariable Integer id) {
        reservaService.eliminarReserva(id);
        return ResponseEntity.noContent().build();
    }
}
