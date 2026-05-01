package com.sje.restnova.controllers;

import com.sje.restnova.dtos.response.PagoResponse;
import com.sje.restnova.services.PagoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class PagoController {

    private final PagoService pagoService;

    @GetMapping
    public ResponseEntity<List<PagoResponse>> listarPagos() {
        return ResponseEntity.ok(pagoService.listarTodos());
    }

    @PostMapping
    public ResponseEntity<PagoResponse> crearPago(@RequestBody @jakarta.validation.Valid com.sje.restnova.dtos.request.PagoRequest request) {
        PagoResponse response = pagoService.crearPago(request);
        return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).body(response);
    }
}
