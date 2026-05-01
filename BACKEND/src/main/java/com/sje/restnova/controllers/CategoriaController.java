package com.sje.restnova.controllers;

import com.sje.restnova.dtos.request.CategoriaRequest;
import com.sje.restnova.dtos.response.CategoriaResponse;
import com.sje.restnova.services.CategoriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CategoriaController {

    private final CategoriaService categoriaService;

    @GetMapping
    public ResponseEntity<List<CategoriaResponse>> getAllCategories() {
        return ResponseEntity.ok(categoriaService.getAllCategories());
    }

    @PostMapping
    public ResponseEntity<CategoriaResponse> createCategory(@RequestBody @Valid CategoriaRequest request) {
        CategoriaResponse response = categoriaService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoriaResponse> updateCategory(@PathVariable Integer id, @RequestBody @Valid CategoriaRequest request) {
        return ResponseEntity.ok(categoriaService.updateCategory(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Integer id) {
        categoriaService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
