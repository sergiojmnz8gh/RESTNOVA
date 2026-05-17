package com.sje.restnova.services;

import com.sje.restnova.dtos.mapper.ProductoMapper;
import com.sje.restnova.dtos.request.ProductoRequest;
import com.sje.restnova.dtos.response.ProductoResponse;
import com.sje.restnova.entities.Categoria;
import com.sje.restnova.entities.Producto;
import com.sje.restnova.repositories.CategoriaRepository;
import com.sje.restnova.repositories.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final ProductoMapper productoMapper;

    public List<ProductoResponse> getAllProducts() {
        return productoRepository.findByActivoTrue().stream()
                .map(productoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductoResponse createProduct(ProductoRequest request) {
        Categoria categoryEntity = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada"));
        
        Producto productEntity = productoMapper.toEntity(request);
        productEntity.setCategoria(categoryEntity);
        
        Producto savedProduct = productoRepository.save(productEntity);
        return productoMapper.toResponseDTO(savedProduct);
    }

    @Transactional
    public ProductoResponse updateProduct(Integer id, ProductoRequest request) {
        Producto productEntity = productoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Producto con ID " + id + " no encontrado"));
        
        Integer catId = request.getCategoriaId();
        if (catId == null) {
            throw new IllegalArgumentException("El ID de la categoría es obligatorio");
        }

        Categoria categoryEntity = categoriaRepository.findById(catId)
                .orElseThrow(() -> new IllegalArgumentException("Categoría con ID " + catId + " no encontrada"));
        
        productoMapper.updateProductoFromRequest(request, productEntity);
        productEntity.setCategoria(categoryEntity);
        
        
        Producto savedProduct = productoRepository.saveAndFlush(productEntity);
        return productoMapper.toResponseDTO(savedProduct);
    }

    @Transactional
    public ProductoResponse updateProductImage(Integer id, String imagenUrl) {
        Producto productEntity = productoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Producto con ID " + id + " no encontrado"));
        productEntity.setImagenUrl(imagenUrl);
        Producto savedProduct = productoRepository.saveAndFlush(productEntity);
        return productoMapper.toResponseDTO(savedProduct);
    }

    @Transactional
    public void deleteProduct(Integer id) {
        Producto productEntity = productoRepository.findById(id)
                .orElseThrow(() -> new com.sje.restnova.exceptions.ResourceNotFoundException("Producto no encontrado"));
        
        productEntity.setActivo(false);
        productoRepository.save(productEntity);
    }

    public List<ProductoResponse> getTopSoldProducts() {
        return productoRepository.findTop3MostSold().stream()
                .map(productoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }
}

