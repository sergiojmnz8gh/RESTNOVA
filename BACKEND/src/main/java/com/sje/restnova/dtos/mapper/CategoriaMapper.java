package com.sje.restnova.dtos.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.sje.restnova.dtos.request.CategoriaRequest;
import com.sje.restnova.dtos.response.CategoriaResponse;
import com.sje.restnova.entities.Categoria;

@Mapper(componentModel = "spring")
public interface CategoriaMapper {
    
    CategoriaResponse toResponseDTO(Categoria categoria);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "disponible", ignore = true)
    @Mapping(target = "productos", ignore = true)
    Categoria toEntity(CategoriaRequest categoriaRequest);
}
