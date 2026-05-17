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

public class ReservaController {

    private final ReservaService reservaService;
    private final com.sje.restnova.security.AuthenticationFacade authenticationFacade;

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'CAMARERO')")
    public ResponseEntity<List<ReservaResponse>> listarReservas() {
        return ResponseEntity.ok(reservaService.listarTodas());
    }

    @GetMapping("/mis-reservas")
    public ResponseEntity<List<ReservaResponse>> listarMisReservas() {
        com.sje.restnova.entities.Usuario usuario = authenticationFacade.getAuthenticatedUsuario();
        return ResponseEntity.ok(reservaService.listarPorUsuario(usuario.getId()));
    }

    @PostMapping
    public ResponseEntity<ReservaResponse> crearReserva(@RequestBody @jakarta.validation.Valid com.sje.restnova.dtos.request.ReservaRequest request) {
        
        ReservaResponse response = reservaService.crearReserva(request);
        return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'CAMARERO')")
    public ResponseEntity<ReservaResponse> actualizarReserva(@PathVariable Integer id, @RequestBody @jakarta.validation.Valid com.sje.restnova.dtos.request.ReservaRequest request) {
        return ResponseEntity.ok(reservaService.actualizarReserva(id, request));
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'CAMARERO')")
    public ResponseEntity<Void> eliminarReserva(@PathVariable Integer id) {
        reservaService.eliminarReserva(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/max-capacidad")
    public ResponseEntity<Integer> getMaxCapacidad() {
        return ResponseEntity.ok(reservaService.getMaxCapacidad());
    }

    @GetMapping("/disponibilidad")
    public ResponseEntity<List<String>> getDisponibilidad(
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate fecha,
            @RequestParam Integer numPersonas) {
        List<String> formattedTimes = reservaService.getDisponibilidad(fecha, numPersonas).stream()
                .map(time -> time.format(java.time.format.DateTimeFormatter.ofPattern("HH:mm")))
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(formattedTimes);
    }

    @GetMapping("/dias-ocupados")
    public ResponseEntity<List<java.time.LocalDate>> getDiasOcupados(@RequestParam Integer numPersonas) {
        return ResponseEntity.ok(reservaService.getDiasOcupados(numPersonas));
    }
}

