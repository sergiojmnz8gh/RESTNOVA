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

public class ProductoController {
    private final ProductoService productoService;
    private final com.sje.restnova.services.ImagenService imagenService;

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

    @GetMapping("/top")
    public ResponseEntity<List<ProductoResponse>> getTopProducts() {
        return ResponseEntity.ok(productoService.getTopSoldProducts());
    }

    @PostMapping("/{id}/imagen")
    public ResponseEntity<ProductoResponse> uploadImage(
            @PathVariable Integer id,
            @RequestParam("imagen") org.springframework.web.multipart.MultipartFile imagen) {
        
        String url = imagenService.guardarImagenProducto(imagen, id);
        if (url != null) {
            return ResponseEntity.ok(productoService.updateProductImage(id, url));
        }
        return ResponseEntity.badRequest().build();
    }
}

