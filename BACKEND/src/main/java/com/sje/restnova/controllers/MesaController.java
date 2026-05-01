package com.sje.restnova.controllers;

import com.sje.restnova.dtos.request.MesaRequest;
import com.sje.restnova.dtos.response.MesaResponse;
import com.sje.restnova.services.MesaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mesas")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class MesaController {

    private final MesaService mesaService;

    @GetMapping
    public ResponseEntity<List<MesaResponse>> getAllTables() {
        return ResponseEntity.ok(mesaService.getAllTables());
    }

    @PostMapping
    public ResponseEntity<MesaResponse> createTable(@RequestBody @Valid MesaRequest request) {
        MesaResponse response = mesaService.createTable(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MesaResponse> updateTable(@PathVariable Integer id, @RequestBody @Valid MesaRequest request) {
        return ResponseEntity.ok(mesaService.updateTable(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTable(@PathVariable Integer id) {
        mesaService.deleteTable(id);
        return ResponseEntity.noContent().build();
    }
}
