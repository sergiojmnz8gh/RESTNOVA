package com.sje.restnova.controllers;

import com.sje.restnova.dtos.request.ProductoRequest;
import com.sje.restnova.dtos.response.ProductoResponse;
import com.sje.restnova.services.ProductoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ProductoController {

    private final ProductoService productoService;

    @GetMapping
    public ResponseEntity<List<ProductoResponse>> getAllProducts() {
        return ResponseEntity.ok(productoService.getAllProducts());
    }

    @PostMapping
    public ResponseEntity<ProductoResponse> createProduct(@RequestBody @Valid ProductoRequest request) {
        ProductoResponse response = productoService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductoResponse> updateProduct(@PathVariable Integer id, @RequestBody @Valid ProductoRequest request) {
        return ResponseEntity.ok(productoService.updateProduct(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Integer id) {
        productoService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
