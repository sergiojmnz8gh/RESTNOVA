package com.sje.restnova.dtos.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.sje.restnova.dtos.request.ProductoRequest;
import com.sje.restnova.dtos.response.ProductoResponse;
import com.sje.restnova.entities.Producto;

@Mapper(componentModel = "spring")
public interface ProductoMapper {
    
    ProductoResponse toResponseDTO(Producto producto);

    @Mapping(target = "categoria", ignore = true)
    @Mapping(target = "id", ignore = true)
    Producto toEntity(ProductoRequest productoRequest);

    @Mapping(target = "categoria", ignore = true)
    @Mapping(target = "id", ignore = true)
    void updateProductoFromRequest(ProductoRequest request, @org.mapstruct.MappingTarget Producto producto);
}

