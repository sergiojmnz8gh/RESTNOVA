package com.sje.restnova.services;

import com.sje.restnova.dtos.mapper.CategoriaMapper;
import com.sje.restnova.dtos.request.CategoriaRequest;
import com.sje.restnova.dtos.response.CategoriaResponse;
import com.sje.restnova.entities.Categoria;
import com.sje.restnova.repositories.CategoriaRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final CategoriaMapper categoriaMapper;

    public List<CategoriaResponse> getAllCategories() {
        return categoriaRepository.findByDisponibleTrueOrderByOrdenAsc().stream()
                .map(categoriaMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoriaResponse createCategory(CategoriaRequest request) {
        Categoria categoryEntity = categoriaMapper.toEntity(request);
        if (categoryEntity.getOrden() == null) {
            categoryEntity.setOrden(0);
        }
        Categoria savedCategory = categoriaRepository.save(categoryEntity);
        return categoriaMapper.toResponseDTO(savedCategory);
    }

    @Transactional
    public CategoriaResponse updateCategory(Integer id, CategoriaRequest request) {
        Categoria categoryEntity = categoriaRepository.findById(id)
                .orElseThrow(() -> new com.sje.restnova.exceptions.ResourceNotFoundException("Categoría no encontrada"));
        
        categoryEntity.setNombre(request.getNombre());
        if (request.getOrden() != null) {
            categoryEntity.setOrden(request.getOrden());
        }
        Categoria savedCategory = categoriaRepository.saveAndFlush(categoryEntity);
        return categoriaMapper.toResponseDTO(savedCategory);
    }

    @Transactional
    public void deleteCategory(Integer id) {
        Categoria categoryEntity = categoriaRepository.findById(id)
                .orElseThrow(() -> new com.sje.restnova.exceptions.ResourceNotFoundException("Categoría no encontrada"));
        
        
        categoryEntity.setDisponible(false);
        
        
        if (categoryEntity.getProductos() != null) {
            categoryEntity.getProductos().forEach(productEntity -> {
                productEntity.setDisponible(false);
            });
        }
        
        categoriaRepository.save(categoryEntity);
    }
}

